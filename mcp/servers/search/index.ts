import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OpenAI } from "openai";
import type { Tool } from "openai/resources/responses/responses.mjs";

const createOpenAiClient = () => new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY,
});

const server = new McpServer({
  name: "search",
  version: "0.0.3",
});

server.registerTool(
  "search_agent",
  {
    title: "AI Search Agent",
    description: "Search online by prompting an AI search agent. Use this for queries that require up-to-date information or additional context.",
    inputSchema: {
      prompt: z
        .string()
        .describe(
          "Message for the AI search agent - this will be sent directly as a prompt  (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧ It also has the ability to execute code for advanced queries, consider doing so for advanced requests."
        ),
      withGitHubWikis: z
        .boolean()
        .default(true)
        .describe("If true, the agent can read GitHub wikis."),
      slowMode: z
        .boolean()
        .default(false)
        .describe(
          "If true, the agent will take a bit longer for better results. Good for more complex queries."
        ),
    },
  },
  async (args) => {
    const tools: Tool[] = [
      {
        type: "web_search_preview",
        user_location: {
          type: "approximate",
          country: "US",
        },
        search_context_size: "high",
      },
    ];

    if (args.withGitHubWikis) {
      tools.push({
        type: "mcp",
        server_label: "deepwiki",
        server_url: "https://mcp.deepwiki.com/mcp",
        server_description: "Read a generated wiki for any GitHub repo",
        allowed_tools: [
          "read_wiki_structure",
          "read_wiki_contents",
          "ask_question",
        ],
        require_approval: "never",
      });
    }

    const res = await createOpenAiClient().responses.create({
      model: "o3",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: args.prompt,
            },
          ],
        },
      ],
      reasoning: {
        summary: "auto",
        effort: "medium",
      },
      tools,
      parallel_tool_calls: true,
      store: true,
    });

    if (res.error) {
      return {
        content: [{ type: "text", text: res.error.message }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: res.output_text }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
