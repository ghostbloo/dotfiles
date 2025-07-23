import { $, env } from "bun";
import path from "path";
import os from "os";
import type { McpServerConfig } from "@anthropic-ai/claude-code";

const HOME_DIR = os.homedir();
const CLAUDE_DIR = env.CLAUDE_DIR || path.join(HOME_DIR, ".claude");
const args = process.argv as ["--force", "--check"];

const isInstalled = async (name: string): Promise<boolean> => {
  // check if server is installed in user scope (there's no --scope flag on this command as of writing this)
  const { stdout, exited } = Bun.spawn({
    cmd: ["claude", "mcp", "get", name],
    cwd: CLAUDE_DIR,
    stdout: "pipe",
    stderr: "ignore",
  });

  return (await exited) === 0 && (await stdout.text()).includes("Status: ✓");
};

const installMcpServers = async () => {
  let mcpServers: Record<string, McpServerConfig> = {
    deepwiki: {
      type: "http",
      url: "https://mcp.deepwiki.com/mcp",
    },
    context7: {
      type: "stdio",
      command: "bunx",
      args: ["-y", "@upstash/context7-mcp"],
    },
    "cloudflare-docs": {
      type: "sse",
      url: "https://docs.mcp.cloudflare.com/sse",
    },
  };

  if (env.OPENAI_API_KEY) {
    mcpServers["search"] = {
      type: "stdio",
      command: "bun",
      args: ["run", path.resolve(path.join(CLAUDE_DIR, "mcp", "search.js"))],
      env: {
        OPENAI_API_KEY: env.OPENAI_API_KEY,
      },
    };
  }

  if (env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    mcpServers["github"] = {
      type: "stdio",
      command: "docker",
      args: [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server",
      ],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: env.GITHUB_PERSONAL_ACCESS_TOKEN,
      },
    };
  }

  const serverNames = Object.keys(mcpServers);
  const serversToAdd: string[] = [];

  if (args.includes("--force")) {
    serversToAdd.push(...serverNames);
  } else {
    await Promise.all(
      serverNames.map(async (name) => {
        const installed = await isInstalled(name);
        if (!installed) {
          serversToAdd.push(name);
        }
      })
    );
  }

  for (const name of serversToAdd) {
    const config = mcpServers[name];
    console.log(`Adding MCP server: ${name}`);
    await $`claude mcp remove --scope user ${name}`.catch();
    await $`claude mcp add-json --scope user ${name} ${JSON.stringify(config)}`;
    if (args.includes("--check")) {
      const installed = await isInstalled(name);
      if (!installed) {
        throw new Error(`${name} not installed`);
      }
    }
  }
};

export default installMcpServers;
