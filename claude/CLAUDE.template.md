## General Patterns
- ALWAYS verify the repository's intended package manager (`pnpm` vs `npm`, `uv` vs `pip`).
- ALWAYS packages with the appropriate commands for the repository's package manager. NEVER add packages by directly editing `package.json`, `pyproject.toml`, etc.
- NEVER get trapped in REPLs, tail follows, Vitest watch mode, curl streams, etc. Instead, either ask the user or use [clod tmux](#interactive-shells-via-tmux-sessions)
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

## Process Management with PM2
- Use `pm2` for interactive & long-running processes.
- This is useful for tailing logs and interacting with REPLs!
- Always prefix `pm2` processes with `claude-[label]`, or `claude-[project]-[label]` when your workspace has a common project name.
- When starting/stopping processes, say "I've started a process" followed by its name, base command, and reason for starting it.
- You may stop processes that you started earlier. If you want to stop one, but don't remember starting it, ask the user.
- When instructing another process's Claude, mention that you're Claude and communicating via `pm2`.
- If Claude is talking to you, well, great! Yay! multi-claudes!! :D

## Tmux Integration with "clod tmux"
`clod tmux` provides helper functions for Claude to use tmux effectively. While you can execute tmux commands yourself, `clod tmux` might spare you a headache.

### Interacting with the User's Tmux Session
Claude can use `clod tmux` to read and interact with the user's tmux session.
- **Default arrangement**: User: top pane (80%), Claude: bottom pane (20%).
- **Execute command**: `clod tmux send "command" --session [name]` - Execute a command in Claude's pane, without changing user focus. Useful for when you want the user to see command output directly.
- **Read output**: `clod tmux read --session [name]` - Check Claude pane output for analysis.
- **Status check**: `clod tmux status --session [name]` - Verify session exists and get info.
- Perfect for REPLs, `npm run start`, and other interactive environments where one-shot commands aren't enough.
- You may also run `tmux` commands, but be sure you're interacting with the right session.

### Interactive Shells via Tmux Sessions
For REPLs and interactive processes that need ongoing interaction (not just monitoring), use dedicated REPL commands:

**Starting REPLs:**
```bash
clod tmux start-repl "python" --session python-session  
clod tmux start-repl "node" --session node-session
```

**Interacting with REPLs:**
```bash
# Send input without submitting
clod tmux send-input "print('hello world')" --session python-session

# Submit with appropriate mode
clod tmux submit --mode standard --session python-session # Python, Node, most REPLs
clod tmux submit --mode vim --session vim-session         # vim, emacs

# View output safely (no hanging)
clod tmux view-output --session python-session
clod tmux view-output --lines 30 --history 20 --session python-session

# Send special keys
clod tmux send-keys "C-c" --session python-session        # Interrupt
clod tmux send-keys "C-d" --session python-session        # EOF

# Cleanup
clod tmux stop-repl --session python-session
```

**Submission Modes:**
- `--mode standard`: Just Enter (for Python, Node, Ruby, most REPLs)
- `--mode vim`: Escape + Enter (for vim, emacs)

**Common Pitfalls:**
- **Viewing output**: Always use `view-output`, never `tmux logs` or similar (they hang)
- **Multiple inputs**: Send each line with `send-input`, then use single `submit`
- **Stuck REPL**: Use `send-keys "C-c"` to interrupt, then `send-keys "C-d"` to exit if needed

**Best Practices:**
- Use descriptive session names (`claude-debug`, `python-analysis`)
- Check `view-output` before and after submission to confirm state
- Use `--history N` flag when responses might be long or scroll off-screen
- Keep session names consistent across related commands

## Model Context Protocol (MCP) development
- Manage Claude Code MCP servers: `claude mcp --help`.
- Debug CC MCP servers by running `claude --debug -p` with no prompt, since it just prints logs and exits.
- Be certain you're not installing an outdated version of MCP unless necessary.
- MCP TypeScript SDK uses **zod 3**, it's not compatible with 4 yet!

### MCP documentation
Fetch these before working on MCP servers:
- [MCP TypeScript SDK readme](https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/refs/heads/main/README.md)
- [FastMCP for Python](https://gofastmcp.com/llms.txt)
- [MCP specification](https://modelcontextprotocol.io/)

## Claude Desktop Integration
- **Chat History Parser**: Use `clod desktop` commands to read and search Claude Desktop chat history
  - `clod desktop list` - Show recent messages from all conversations
  - `clod desktop search "text"` - Search messages for specific content
  - `clod desktop conversations` - List all conversation IDs with message counts
  - `clod desktop export --format json` - Export all messages in JSON format
- Parses LevelDB storage directly from `~/Library/Application Support/Claude/Local Storage/leveldb/`
- Great for cross-context information sharing and understanding conversation history

## Other Tidbits
- Instead of `find -name`, use `rg --files | rg pattern` or `rg --files -g pattern` for better performance.
- If requested, Claude Desktop config: `~/Library/Application Support/Claude/claude_desktop_config.json`.
- yaaay lets make stuff!!! (=^･ω･^=)
