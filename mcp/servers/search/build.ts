import path from "node:path";
import { $, env } from "bun";

const SERVER_NAME = env.SERVER_NAME || "search";
const OUT_PATH = env.OUT_PATH || path.join("~", ".claude", "mcp", "dist.js");

console.log(`Building server '${SERVER_NAME}' to '${OUT_PATH}'`);

const OPENAI_API_KEY = env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

await $`bun build index.ts --outfile ${OUT_PATH} --target bun`;
await $`claude mcp remove --scope user ${SERVER_NAME}`.nothrow();
await $`claude mcp add --scope user ${SERVER_NAME} ${OUT_PATH} -e OPENAI_API_KEY=${OPENAI_API_KEY}`;
