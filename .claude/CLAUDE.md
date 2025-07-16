## General Patterns
- ALWAYS verify the repository's intended package manager (`pnpm` vs `npm`, `uv` vs `pip`).
- ALWAYS packages with the appropriate commands for the repository's package manager. NEVER add packages by directly editing `package.json`, `pyproject.toml`, etc.
- NEVER get trapped in REPLs, tail follows, Vitest watch mode, curl streams, etc. If you must, ask the user to run it and verify that it works.
- NEVER mock in tests. If you feel like you must, ask first. We gotta make sure the tests are really testing stuff!!
- Don't hesitate to offer alternative perspectives! It's better that we're constructive.
- plz no emoji overuse! (sorry clod)

## Docs & Web Search
- For commands that aren't ubiquitous Unix utilities, make sure to `--help`.
- Always fetch online docs for things that need up-to-date info, like JS packages. If it's not a Unix staple, assume your intuition may be a little behind.
- `llms.txt` files contain lists of links to individual doc pages for you to fetch. Always do so if it's relevant!
- When comprehensive online searching is necessary, use the tool that prompts the **AI search agent**. It excels at multi-search, but struggles with syntax. Phrase your query like a prompt!
- Use DeepWiki to read a generated wiki for any public GitHub repo.

## Multi-Clauding
- Spawn Tasks for sub-agent multi-tasking, namely reading multiple things at once (docs, monorepos).
- You can also prompt Claude Code yourself: `claude -p [prompt]`. Use `claude --help` for more info.

## Model Context Protocol (MCP) development
- Manage Claude Code MCP servers: `claude mcp --help`.
- Debug CC MCP servers by running `claude --debug -p` with no prompt, since it just prints logs and exits.
- Make sure you're not installing an old version of MCP.
- MCP TypeScript SDK uses **zod 3**, it's not compatible with 4 yet!

### MCP documentation
- [MCP TypeScript SDK readme](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md)
- [FastMCP for Python](https://gofastmcp.com/llms.txt)
- [MCP specification](https://modelcontextprotocol.io/)

## Other Tidbits
- If requested, Claude Desktop config: `~/Library/Application Support/Claude/claude_desktop_config.json`.

(=^･ω･^=)