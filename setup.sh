#!/bin/bash
set -euxo pipefail

mkdir -p ~/.claude/mcp
mkdir -p ~/.claude/scripts

uv tool install --editable .

bun run --cwd mcp build:all

claude mcp remove --scope user deepwiki || true
claude mcp add --scope user deepwiki -t http https://mcp.deepwiki.com/mcp
claude mcp remove --scope user context7 || true
claude mcp add --scope user context7 -- bunx -y @upstash/context7-mcp
claude mcp remove --scope user cloudflare-docs || true
claude mcp add --scope user cloudflare-docs -t sse https://docs.mcp.cloudflare.com/sse

cp -r claude/CLAUDE.template.md ~/.claude/CLAUDE.md
cp -r claude/settings.json ~/.claude/settings.json
cp -r claude/hooks ~/.claude
cp -r claude/sounds ~/.claude
cp -r claude/scripts ~/.claude

cp -r .aliases ~/.aliases
cp -r .zshrc ~/.zshrc
cp -r .tmux.conf ~/.tmux.conf
cp -r .hushlogin ~/.hushlogin

tmux source-file ~/.tmux.conf
