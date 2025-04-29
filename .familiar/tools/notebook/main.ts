import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { $ } from "bun";

// Configuration
dotenv.config();

const NOTEBOOK_NAME = process.env.NOTEBOOK_NAME || "familiar";

async function main() {
  const mcp = new McpServer({
    name: "notebook",
    version: "1.0.0",
  });

  mcp.tool(
    "notebook_note_show",
    "Read a note from your notebook",
    {
      id: z.string().describe("The ID of the note to read"),
    },
    async ({ id }) => {
      try {
        const [[filename, title], content, updated] = await Promise.all([
          $`nb ${NOTEBOOK_NAME}:show --print --info --no-color ${id}`.text()
            .then<[string, string]>((out) => {
              const infoMatch = out.match(/^\[[^:]+:\d+\]\s+(\S+)\s+(.*)$/);
              if (!infoMatch) {
                throw new Error("Could not parse --info output");
              }
              const filename = infoMatch[1]?.trim() ?? "";
              const title = infoMatch[2]?.trim() ?? "";
              return [filename, title];
            }),
            $`nb ${NOTEBOOK_NAME}:show --print --updated ${id}`.text(),
          $`nb ${NOTEBOOK_NAME}:show --print ${id}`.text(),
        ]);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ id, filename, title, content, updated }),
          }],
        };
      } catch (error) {
        console.error(error);
        return { content: [{ type: "text", text: "Failed to show note" }] };
      }
    }
  )

  mcp.tool(
    "notebook_notes_list",
    "List all notes in your notebook",
    async () => {
      const cmd: string[] = ["nb", `${NOTEBOOK_NAME}:list`];
      const ps = Bun.spawn({
        cmd,
        stdio: ["ignore", "pipe", "inherit"],
      });
      const exitCode = await ps.exited;
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: "Failed to list notes" }] };
      }

      const text = await new Response(ps.stdout).text();
      const lines = text.trim().split('\n');
      const results: NotebookItem[] = [];
      // Example line: [1] 20250428173019.md · "asdfadsfasdfads"
      const regex = /^\[(\d+)\]\s+(.*?)\s+·\s+\"(.*?)\"$/;

      for (const line of lines) {
        const match = line.match(regex);
        if (match) {
          const [, idStr, filename, title] = match;
          if (idStr && filename !== undefined && title !== undefined) {
            results.push({
              id: parseInt(idStr, 10),
              filename: filename.trim(),
              title: title.trim(),
            });
          }
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(results),
        }],
      };
    },
  );

  mcp.tool(
    "notebook_add_note",
    "Add a new note to your notebook",
    {
      title: z.string().describe("The title for the new note"),
      content: z.string().describe("The content for the new note (markdown format)"),
      tags: z.array(z.string()).default([]).describe("Add tags to the new note"),
    },
    async ({ title, content, tags }) => {
      const cmd: string[] = ["nb", `${NOTEBOOK_NAME}:add`];
      if (tags.length > 0) cmd.push(...tags.map((t) => `--tag ${t}`));
      cmd.push("--title", title, "--content", content);
      
      const ps = Bun.spawn({
        cmd,
        stdio: ["ignore", "pipe", "inherit"],
      });

      const exitCode = await ps.exited;
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: "Failed to add note" }]};
      }
      return { content: [{ type: "text", text: "Note added successfully" }]};
    },
  );

  mcp.tool(
    "notebook_search",
    "Perform a full-text search of your notes.",
    {
      query: z.string()
        .describe("The query to search for"),
      not: z.array(z.string().describe("Exclude items matching this term")).default([])
        .describe("Add a NOT query for items to exclude"),
      and: z.array(z.string().describe("Include items matching this term")).default([])
        .describe("Include items matching this term"),
      or: z.array(z.string().describe("Include items matching this term")).default([])
        .describe("Add an OR query for items to include"),
      tags: z.array(z.string()).default([])
        .describe("Include notes matching specific tags"),
    },
    async ({ query, not, and, or, tags }) => {
      const cmd: string[] = ["nb", `${NOTEBOOK_NAME}:search`, "-l", query];
      if (and.length) cmd.push(...and.flatMap((a) => ["--and", a]));
      if (or.length) cmd.push(...or.flatMap((o) => ["--or", o]));
      if (not.length) cmd.push(...not.flatMap((n) => ["--not", n]));
      if (tags.length) cmd.push("--tags", tags.join(","));

      const ps = Bun.spawn({
        cmd,
        stdio: ["ignore", "pipe", "inherit"],
      });
      const exitCode = await ps.exited;
      if (exitCode !== 0) {
        return { content: [{ type: "text", text: "Failed to search notes" }] };
      }

      const text = await new Response(ps.stdout).text();
      const lines = text.trim().split('\n');
      const results: NotebookItem[] = [];
      const regex = /^\[([^:]+):(\d+)\]\s+(.*?)\s+·\s+\"(.*?)\"$/;

      for (const line of lines) {
        const match = line.match(regex);
        if (match) {
          const [, notebook, idStr, filename, title] = match;
          if (notebook && idStr && filename !== undefined && title !== undefined) {
            results.push({
              id: parseInt(idStr, 10),
              filename: filename.trim(),
              title,
            });
          }
        }
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify(results),
        }],
      };
    },
  );

  // Connect to transport
  console.log("Starting notebook tool...");
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

main();

interface NotebookItem {
  id: number;
  filename: string;
  title: string;
}
