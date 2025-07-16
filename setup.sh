#!/bin/bash
set -e

echo "Installing dotfiles..."

mkdir -p ~/.claude/mcp

bun run --cwd mcp build:all

echo "Adding third-party MCP servers..."
claude mcp add deepwiki -t http https://mcp.deepwiki.com/mcp

echo "Copying Claude settings..."
# clod
cp -r .claude/CLAUDE.md ~/.claude/CLAUDE.md
cp -r .claude/settings.json ~/.claude/settings.json
cp -r .claude/hooks ~/.claude
cp -r .claude/sounds ~/.claude

echo "Done"