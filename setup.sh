#!/bin/bash
set -e

mkdir -p ~/.claude/mcp

# o3
bun run --cwd .claude/mcp/search build
cp ./.claude/mcp/search/dist.js ~/.claude/mcp/search.js
claude mcp add search bun ~/.claude/mcp/search.js

# deepwiki
claude mcp add deepwiki -t http https://mcp.deepwiki.com/mcp

# clod
cp -r .claude/CLAUDE.md ~/.claude/CLAUDE.md
cp -r .claude/settings.json ~/.claude/settings.json
cp -r .claude/hooks ~/.claude
cp -r .claude/sounds ~/.claude
