"""CLI interface for clod utilities."""

import click
from pathlib import Path
from .tmux import TmuxController
from .hooks import HookManager
from .desktop import ClaudeDesktopParser


@click.group()
@click.version_option()
def main():
    """Claude Code utilities and hacks."""
    pass


@main.command(context_settings=dict(ignore_unknown_options=True, allow_extra_args=True))
@click.option("--safe", is_flag=True, help="Run claude without --dangerously-skip-permissions")
@click.pass_context
def code(ctx, safe):
    """Alias for 'claude --dangerously-skip-permissions'."""
    import os
    import sys

    cmd = ["claude"]
    if not safe:
        cmd.append("--dangerously-skip-permissions")
    cmd.extend(ctx.args)
    os.execvp("claude", cmd)


@main.group()
def tmux():
    """Tmux workspace management commands."""
    pass


@main.group()
def hooks():
    """Claude Code hook management commands."""
    pass


@main.group()
def desktop():
    """Claude Desktop chat history commands."""
    pass


@tmux.command()
@click.option("--session", "-s", default="claude-workspace", help="Session name")
@click.option(
    "--working-dir",
    "-C",
    type=click.Path(exists=True, path_type=Path),
    help="Working directory",
)
def setup(session: str, working_dir: Path):
    """Set up Claude tmux workspace."""
    controller = TmuxController(session)
    controller.setup(working_dir)


@tmux.command()
@click.argument("command")
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def send(command: str, session: str):
    """Send command to Claude pane."""
    controller = TmuxController(session)
    controller.send_keys(command)


@tmux.command()
@click.option("--lines", "-n", default=20, help="Number of lines to read")
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def read(lines: int, session: str):
    """Read output from Claude pane."""
    controller = TmuxController(session)
    output = controller.read_output(lines)
    if output:
        click.echo(output)


@tmux.command()
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def status(session: str):
    """Check Claude session status."""
    controller = TmuxController(session)
    status_info = controller.status()

    if status_info["exists"]:
        click.echo(f"✓ Claude session '{status_info['session_name']}' is running")
        click.echo(f"  Panes: {status_info['panes']}")
        click.echo(f"  Windows: {status_info['windows']}")
    else:
        click.echo("✗ Claude session not found")


@tmux.command()
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def kill(session: str):
    """Kill Claude session."""
    controller = TmuxController(session)
    controller.kill_session()


# REPL-specific commands
@tmux.command()
@click.argument("command")
@click.option("--session", "-s", default="claude-repl", help="Session name")
@click.option(
    "--working-dir",
    "-C",
    type=click.Path(exists=True, path_type=Path),
    help="Working directory",
)
def start_repl(command: str, session: str, working_dir: Path):
    """Start a REPL session with the specified command."""
    controller = TmuxController(session)
    controller.start_repl(command, working_dir)


@tmux.command()
@click.argument("text")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def send_input(text: str, session: str):
    """Send text input without pressing Enter."""
    controller = TmuxController(session)
    if controller.send_input(text):
        click.echo(f"Sent input: {text}")


@tmux.command()
@click.option("--mode", "-m", default="standard", type=click.Choice(["standard", "vim"]), help="Submission mode")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def submit(mode: str, session: str):
    """Submit current input with different submission modes."""
    controller = TmuxController(session)
    if controller.submit(mode):
        click.echo(f"Submitted using {mode} mode")


@tmux.command()
@click.option("--lines", "-n", default=20, help="Number of lines to show")
@click.option("--history", "-H", default=0, help="Number of history lines to include")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def view_output(lines: int, history: int, session: str):
    """View current REPL output."""
    controller = TmuxController(session)
    output = controller.read_output_with_history(lines, history)
    if output:
        click.echo(output)


@tmux.command()
@click.argument("keys", nargs=-1, required=True)
@click.option("--session", "-s", default="claude-repl", help="Session name")
def send_keys(keys: tuple, session: str):
    """Send raw key combinations (e.g., 'C-c', 'C-d', 'Escape')."""
    controller = TmuxController(session)
    if controller.send_raw_keys(*keys):
        click.echo(f"Sent keys: {' '.join(keys)}")


@tmux.command()
@click.option("--session", "-s", default="claude-repl", help="Session name")
def stop_repl(session: str):
    """Stop REPL session."""
    controller = TmuxController(session)
    controller.kill_session()


# Hook management commands
@hooks.command()
def list():
    """List all configured hooks."""
    manager = HookManager()
    hooks = manager.list_hooks()
    
    if not hooks:
        click.echo("No hooks configured.")
        return
    
    for i, hook in enumerate(hooks):
        status = "✓" if hook["enabled"] else "✗"
        click.echo(f"{i:2d}. {status} {hook['event']:<20} {hook['matcher']:<15} {hook['command']}")


@hooks.command()
@click.argument("hook_type", type=click.Choice(HookManager.HOOK_TYPES))
@click.option("--matcher", "-m", default="*", help="Tool pattern to match")
@click.option("--command", "-c", help="Shell command to execute")
@click.option("--script", "-s", help="Path to existing script")
@click.option("--template", "-t", is_flag=True, help="Create cchooks Python template")
@click.option("--name", "-n", help="Hook name (for templates)")
def add(hook_type: str, matcher: str, command: str, script: str, template: bool, name: str):
    """Add a new hook."""
    manager = HookManager()
    
    try:
        result = manager.add_hook(
            hook_type=hook_type,
            matcher=matcher,
            command=command,
            script_path=script,
            template=template,
            name=name
        )
        
        if template:
            click.echo(f"✓ Created template hook: {result}")
        else:
            click.echo(f"✓ Added hook: {result}")
            
    except ValueError as e:
        click.echo(f"✗ Error: {e}", err=True)


@hooks.command()
@click.argument("identifier")
def remove(identifier: str):
    """Remove a hook by index."""
    manager = HookManager()
    
    if manager.remove_hook(identifier):
        click.echo(f"✓ Removed hook: {identifier}")
    else:
        click.echo(f"✗ Hook not found: {identifier}", err=True)


@hooks.command()
@click.argument("identifier")
@click.option("--input", "-i", help="Test input data (JSON)")
@click.option("--dry-run", "-d", is_flag=True, help="Show what would happen")
def run(identifier: str, input: str, dry_run: bool):
    """Run/test a hook."""
    manager = HookManager()
    manager.run_hook(identifier, input, dry_run)


@hooks.command()
@click.argument("identifier")
def edit(identifier: str):
    """Edit a hook script."""
    import os
    import subprocess
    
    manager = HookManager()
    hooks = manager.list_hooks()
    
    try:
        index = int(identifier)
        if 0 <= index < len(hooks):
            hook = hooks[index]
            command = hook["command"]
            
            # Extract script path from command if it's a Python script
            if command.startswith("python "):
                script_path = command.split(" ", 1)[1]
                if os.path.exists(script_path):
                    editor = os.environ.get("EDITOR", "nano")
                    subprocess.run([editor, script_path])
                    return
            
            click.echo("Hook is not a script file or script not found.")
        else:
            click.echo(f"Invalid hook index: {identifier}")
    except ValueError:
        click.echo(f"Invalid hook identifier: {identifier}")


# Desktop chat history commands
@desktop.command()
@click.option("--limit", "-n", default=20, help="Number of messages to show")
@click.option("--conversation", "-c", help="Filter by conversation ID")
def list(limit: int, conversation: str):
    """List recent chat messages."""
    parser = ClaudeDesktopParser()
    
    if conversation:
        conversations = parser.get_conversations()
        if conversation in conversations:
            messages = conversations[conversation].messages
        else:
            click.echo(f"Conversation '{conversation}' not found.")
            return
    else:
        messages = parser.get_recent_messages(limit)
    
    if not messages:
        click.echo("No messages found.")
        return
    
    for i, msg in enumerate(messages, 1):
        status = "📝" if msg.is_draft else "💬"
        conv_short = msg.conversation_id[:8] if msg.conversation_id != "unknown" else "unknown"
        click.echo(f"{i:2d}. {status} [{conv_short}] {msg.text}")


@desktop.command()
@click.argument("query")
@click.option("--case-sensitive", "-c", is_flag=True, help="Case sensitive search")
@click.option("--limit", "-n", default=50, help="Maximum results to show")
def search(query: str, case_sensitive: bool, limit: int):
    """Search chat messages for text."""
    parser = ClaudeDesktopParser()
    results = parser.search_messages(query, case_sensitive)
    
    if not results:
        click.echo(f"No messages found containing '{query}'.")
        return
    
    # Limit results
    if len(results) > limit:
        results = results[:limit]
        click.echo(f"Showing first {limit} of {len(parser.search_messages(query, case_sensitive))} results:")
    
    for i, msg in enumerate(results, 1):
        status = "📝" if msg.is_draft else "💬"
        conv_short = msg.conversation_id[:8] if msg.conversation_id != "unknown" else "unknown"
        
        # Highlight the search term
        text = msg.text
        if not case_sensitive:
            # Simple highlighting for case-insensitive search
            import re
            pattern = re.compile(re.escape(query), re.IGNORECASE)
            text = pattern.sub(lambda m: f"**{m.group()}**", text)
        else:
            text = text.replace(query, f"**{query}**")
        
        click.echo(f"{i:2d}. {status} [{conv_short}] {text}")


@desktop.command()
def conversations():
    """List all conversation IDs."""
    parser = ClaudeDesktopParser()
    convs = parser.get_conversations()
    
    if not convs:
        click.echo("No conversations found.")
        return
    
    click.echo(f"Found {len(convs)} conversations:")
    for conv_id, conv in convs.items():
        msg_count = len(conv.messages)
        click.echo(f"  {conv_id}: {msg_count} messages")


@desktop.command()
@click.option("--format", "-f", type=click.Choice(["text", "json"]), default="text", help="Output format")
def export(format: str):
    """Export all chat messages."""
    parser = ClaudeDesktopParser()
    messages = parser.get_all_messages()
    
    if format == "json":
        import json
        data = []
        for msg in messages:
            data.append({
                "conversation_id": msg.conversation_id,
                "text": msg.text,
                "is_draft": msg.is_draft,
                "message_type": msg.message_type
            })
        click.echo(json.dumps(data, indent=2))
    else:
        for msg in messages:
            status = "📝" if msg.is_draft else "💬"
            click.echo(f"{status} [{msg.conversation_id[:8]}] {msg.text}")


if __name__ == "__main__":
    main()
