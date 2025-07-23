import { readdir } from "fs/promises";
import os from "os";
import path from "path";

const HOME_DIR = os.homedir();
const CLAUDE_DIR = Bun.env.CLAUDE_DIR || path.join(HOME_DIR, ".claude");

type Copy = [string | URL, string | URL]; // src, dest

const main = async () => {
  const files: Copy[] = [
    [".aliases", path.join(HOME_DIR, ".aliases")],
    [".zshrc", path.join(HOME_DIR, ".zshrc")],
    [".tmux.conf", path.join(HOME_DIR, ".tmux.conf")],
    [".hushlogin", path.join(HOME_DIR, ".hushlogin")],
    ["claude/CLAUDE.template.md", path.join(CLAUDE_DIR, "CLAUDE.template.md")],
    ["claude/settings.json", path.join(CLAUDE_DIR, "settings.json")],
  ];

  const dirs: [string, string][] = [
    ["claude/hooks", path.join(CLAUDE_DIR, "hooks")],
    ["claude/sounds", path.join(CLAUDE_DIR, "sounds")],
    ["claude/scripts", path.join(CLAUDE_DIR, "scripts")],
  ];

  // add dirs to files array
  const dirFiles = await Promise.all(
    dirs.map(async ([src, dest]) =>
      (
        await readdir(src, { recursive: true })
      ).map(
        (basename): Copy => [
          path.join(src, basename),
          path.join(dest, basename),
        ]
      )
    )
  );
  files.push(...dirFiles.flat());

  // copy files
  await Promise.all(
    files.map(async ([src, dest]) => {
      await Bun.write(Bun.file(dest), Bun.file(src), { createPath: true });
    })
  );

  if (process.argv.includes("--verbose") || process.argv.includes("-v")) {
    files.map(([src, dest]) => {
      console.log("Copied", src, "to", dest);
    });
  }

  console.log("Copied", files.length, "files");

  await Bun.$`tmux source-file ~/.tmux.conf`;
};

await main();
