# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a dotfiles repository focused on enhancing the Claude Code experience with custom MCP servers, sound effects, and development configurations.

## Commands

### Setup
- `./setup.sh` - Installs Claude configurations, builds MCP servers, and sets up the environment. **WARNING**: No confirmation or rollback mechanism.

### MCP Development
- `cd mcp && bun run --filter="*" build` - Build all MCP servers
- `cd mcp && bun run --filter="*" lint` - Type check all MCP servers
- Individual server commands (from `mcp/servers/[server-name]/`):
  - `bun run build` - Build the server
  - `bun run lint` - Type check with TypeScript

### Clod Package (Python)
- `~/.local/bin/clod` - Claude Code utilities and tmux integration (installed globally via uv)
- `clod tmux setup --session [name]` - Create shared tmux workspace (user: top 80%, Claude: bottom 20%)
- `clod tmux send "command" --session [name]` - Execute commands in Claude's pane without disrupting user focus
- `clod tmux read --session [name]` - Read output from Claude's pane for analysis
- `clod tmux status --session [name]` - Check session status and pane layout
- **REPL commands**: `start-repl`, `send-input`, `submit`, `view-output`, `send-keys`, `stop-repl` - Universal REPL interaction via tmux sessions
- **Desktop chat parser**: `clod desktop list`, `clod desktop search "query"`, `clod desktop conversations` - Read and search Claude Desktop chat history from LevelDB storage

## Architecture

### MCP Servers
The repository contains custom Model Context Protocol servers in `mcp/servers/`:
- **search**: AI-powered search agent using OpenAI's API for comprehensive web searches

All MCP servers:
- Use TypeScript with Bun as the runtime
- Follow the MCP TypeScript SDK patterns
- Are configured as Bun workspaces
- Use Zod v3 for schema validation (not compatible with v4)

### Claude Configuration
- `.claude/CLAUDE.md` - User's global Claude Code instructions (copied to `~/.claude/` by setup)
- `.claude/settings.json` - Claude Code settings with hooks and sound effects
- `.claude/hooks/` - Shell scripts for tool validation and notifications
- `.claude/sounds/` - Audio files for different Claude Code events

## Development Guidelines

### Package Management
- This repository uses **Bun** for JavaScript/TypeScript projects in `mcp/`
- This repository uses **uv** for Python projects (clod package)
- Install JS packages with `bun add [package]` in the appropriate directory
- Install Python packages with `uv add [package]` in root directory
- The MCP workspace is configured in `mcp/package.json`
- The clod package is configured in `pyproject.toml`

### Testing and Building
- No test framework is currently configured
- Build outputs go to `dist.js` for MCP servers
- Type checking is done via `tsc --noEmit`

### Key Technologies
- **Bun**: JavaScript runtime and package manager for MCP servers
- **uv**: Python package manager for clod utilities
- **TypeScript**: For all MCP server development
- **Python + Click**: For clod CLI utilities and tmux integration
- **MCP SDK**: `@modelcontextprotocol/sdk` v1.15.1
- **OpenAI SDK**: For the search agent server
- **Zod v3**: For schema validation in MCP servers