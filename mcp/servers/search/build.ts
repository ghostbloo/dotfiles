import path from "node:path";

const SERVER_NAME = Bun.env.SERVER_NAME || "search";
const OUT_PATH = Bun.env.OUT_PATH || path.join("~", ".claude", "mcp", "search.js");

console.log(`Building server '${SERVER_NAME}' to '${OUT_PATH}'`);

const OPENAI_API_KEY = Bun.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

await Bun.$`bun build index.ts --outfile ${OUT_PATH} --target node`;
