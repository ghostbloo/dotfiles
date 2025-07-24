"""CLI interface for clod utilities."""

from pathlib import Path
from typing import Optional, Tuple

import click

from .desktop import ClaudeDesktopParser
from .hooks import HookManager
from .sfx import SoundEffectsManager, run_tui
from .tmux import TmuxController


@click.group()
@click.version_option()
def main() -> None:
    """Claude Code utilities and hacks."""
    pass


@main.command(context_settings=dict(
    ignore_unknown_options=True,
    allow_extra_args=True,
    allow_interspersed_args=False,
    help_option_names=[]  # Disable Click's help handling
))
@click.option("--safe", is_flag=True, help="Run claude without --dangerously-skip-permissions")
@click.pass_context
def code(ctx: click.Context, safe: bool) -> None:
    """Alias for 'claude --dangerously-skip-permissions'."""
    import os
    import shutil
    import sys
    from pathlib import Path

    # Try to find claude executable in various locations
    claude_path = None

    # Check if claude is in PATH (excluding shell aliases)
    claude_path = shutil.which("claude")

    # If not found in PATH, check common Claude Code installation locations
    if not claude_path:
        possible_paths = [
            Path.home() / ".claude" / "local" / "claude",
            Path.home() / ".claude" / "local" / "node_modules" / ".bin" / "claude",
        ]

        for path in possible_paths:
            if path.exists() and path.is_file():
                claude_path = str(path)
                break

    if not claude_path:
        click.echo("Error: claude command not found. Please ensure Claude Code CLI is installed.", err=True)
        sys.exit(1)

    cmd = [claude_path]
    if not safe:
        cmd.append("--dangerously-skip-permissions")
    cmd.extend(ctx.args)
    os.execvp(claude_path, cmd)


@main.group()
def tmux() -> None:
    """Tmux workspace management commands."""
    pass


@main.group()
def hooks() -> None:
    """Claude Code hook management commands."""
    pass


@main.group()
def desktop() -> None:
    """Claude Desktop chat history commands."""
    pass


@main.group()
def sfx() -> None:
    """Sound effects management commands."""
    pass


@tmux.command()
@click.option("--session", "-s", default="claude-workspace", help="Session name")
@click.option(
    "--working-dir",
    "-C",
    type=click.Path(exists=True, path_type=Path),
    help="Working directory",
)
def setup(session: str, working_dir: Optional[Path]) -> None:
    """Set up Claude tmux workspace."""
    controller = TmuxController(session)
    controller.setup(working_dir)


@tmux.command()
@click.argument("command")
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def send(command: str, session: str) -> None:
    """Send command to Claude pane."""
    controller = TmuxController(session)
    controller.send_keys(command)


@tmux.command()
@click.option("--lines", "-n", default=20, help="Number of lines to read")
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def read(lines: int, session: str) -> None:
    """Read output from Claude pane."""
    controller = TmuxController(session)
    output = controller.read_output(lines)
    if output:
        click.echo(output)


@tmux.command()
@click.option("--session", "-s", default="claude-workspace", help="Session name")
def status(session: str) -> None:
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
def kill(session: str) -> None:
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
def start_repl(command: str, session: str, working_dir: Optional[Path]) -> None:
    """Start a REPL session with the specified command."""
    controller = TmuxController(session)
    controller.start_repl(command, working_dir)


@tmux.command()
@click.argument("text")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def send_input(text: str, session: str) -> None:
    """Send text input without pressing Enter."""
    controller = TmuxController(session)
    if controller.send_input(text):
        click.echo(f"Sent input: {text}")


@tmux.command()
@click.option("--mode", "-m", default="standard", type=click.Choice(["standard", "vim"]), help="Submission mode")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def submit(mode: str, session: str) -> None:
    """Submit current input with different submission modes."""
    controller = TmuxController(session)
    if controller.submit(mode):
        click.echo(f"Submitted using {mode} mode")


@tmux.command()
@click.option("--lines", "-n", default=20, help="Number of lines to show")
@click.option("--history", "-H", default=0, help="Number of history lines to include")
@click.option("--session", "-s", default="claude-repl", help="Session name")
def view_output(lines: int, history: int, session: str) -> None:
    """View current REPL output."""
    controller = TmuxController(session)
    output = controller.read_output_with_history(lines, history)
    if output:
        click.echo(output)


@tmux.command()
@click.argument("keys", nargs=-1, required=True)
@click.option("--session", "-s", default="claude-repl", help="Session name")
def send_keys(keys: Tuple[str, ...], session: str) -> None:
    """Send raw key combinations (e.g., 'C-c', 'C-d', 'Escape')."""
    controller = TmuxController(session)
    if controller.send_raw_keys(*keys):
        click.echo(f"Sent keys: {' '.join(keys)}")


@tmux.command()
@click.option("--session", "-s", default="claude-repl", help="Session name")
def stop_repl(session: str) -> None:
    """Stop REPL session."""
    controller = TmuxController(session)
    controller.kill_session()


# Hook management commands
@hooks.command()
def list() -> None:
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
def add(hook_type: str, matcher: str, command: Optional[str], script: Optional[str], template: bool, name: Optional[str]) -> None:
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
def remove(identifier: str) -> None:
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
def run(identifier: str, input: Optional[str], dry_run: bool) -> None:
    """Run/test a hook."""
    manager = HookManager()
    manager.run_hook(identifier, input, dry_run)


@hooks.command()
@click.argument("identifier")
def edit(identifier: str) -> None:
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
@desktop.command("list")
@click.option("--limit", "-n", default=20, help="Number of messages to show")
@click.option("--conversation", "-c", help="Filter by conversation ID")
def list_desktop(limit: int, conversation: Optional[str]) -> None:
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
def search(query: str, case_sensitive: bool, limit: int) -> None:
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
def conversations() -> None:
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
def export(format: str) -> None:
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


# Sound effects management commands
@sfx.command()
def tui() -> None:
    """Open interactive TUI for configuring sound effects."""
    run_tui()


@sfx.command("list")
def list_sfx() -> None:
    """List current sound effect mappings."""
    manager = SoundEffectsManager()
    mappings = manager.get_current_mappings()

    if not mappings:
        click.echo("No sound effects configured.")
        return

    click.echo("Current sound effect mappings:")
    for key, mapping in mappings.items():
        hook_type = mapping["hook_type"]
        matcher = mapping["matcher"] or "(empty)"
        sound = mapping["sound"]
        click.echo(f"  {hook_type} | {matcher} -> {sound}")


@sfx.command()
@click.argument("hook_type", type=click.Choice(SoundEffectsManager.HOOK_TYPES))
@click.argument("matcher", default="*")
@click.argument("sound_file")
def set(hook_type: str, matcher: str, sound_file: str) -> None:
    """Set sound effect for a hook type and matcher."""
    manager = SoundEffectsManager()

    if manager.set_sound_mapping(hook_type, matcher, sound_file):
        click.echo(f"✓ Set {sound_file} for {hook_type} | {matcher}")
    else:
        click.echo(f"✗ Failed to set sound effect. Check that {sound_file} exists in ~/.claude/sounds/")


@sfx.command("remove")
@click.argument("hook_type", type=click.Choice(SoundEffectsManager.HOOK_TYPES))
@click.argument("matcher", default="*")
def remove_sfx(hook_type: str, matcher: str) -> None:
    """Remove sound effect for a hook type and matcher."""
    manager = SoundEffectsManager()

    if manager.remove_sound_mapping(hook_type, matcher):
        click.echo(f"✓ Removed sound effect for {hook_type} | {matcher}")
    else:
        click.echo(f"✗ No sound effect found for {hook_type} | {matcher}")


@sfx.command()
@click.argument("sound_file")
def play(sound_file: str) -> None:
    """Play a sound file for testing."""
    from .sfx import SoundPlayer

    manager = SoundEffectsManager()
    sound_path = manager.sounds_path / sound_file

    if not sound_path.exists():
        click.echo(f"✗ Sound file not found: {sound_file}")
        return

    player = SoundPlayer()
    if player.play(sound_path):
        click.echo(f"♪ Playing {sound_file}")
    else:
        click.echo(f"✗ Failed to play {sound_file}")


@sfx.command()
def sounds() -> None:
    """List available sound files."""
    manager = SoundEffectsManager()
    sound_files = manager.get_sound_files()

    if not sound_files:
        click.echo("No sound files found in ~/.claude/sounds/")
        return

    click.echo(f"Available sound files ({len(sound_files)}):")
    for sound_path in sound_files:
        click.echo(f"  {sound_path.name}")


if __name__ == "__main__":
    main()
