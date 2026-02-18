#!/usr/bin/env node
// Helper for SKILL.md !` commands: runs a command and strips ANSI escape codes
// Usage: node run-no-ansi.mjs <command> [args...]
import { execSync } from "child_process";
const cmd = process.argv.slice(2).join(" ");
const strip = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
try {
  console.log(strip(execSync(cmd, { encoding: "utf8", stdio: "pipe" })));
} catch (e) {
  console.log(strip((e.stdout ?? "") + (e.stderr ?? "")));
  process.exit(1);
}
