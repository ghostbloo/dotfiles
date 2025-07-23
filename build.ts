import { $ } from "bun";

await Promise.all([
    $`bun run build:all`,
    $`bun run copy-static`,
]);
await $`bun run mcp:install`;
