import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { siblingRoot } from "@/lib/week-log/local";

export function fitnessCoachPython(): string | null {
  const root = siblingRoot("fitness");
  const win = path.join(root, ".venv", "Scripts", "python.exe");
  const nix = path.join(root, ".venv", "bin", "python");
  if (fs.existsSync(win)) return win;
  if (fs.existsSync(nix)) return nix;
  return null;
}

export function runFitnessApplyCourse(payload: unknown): Promise<{
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
}> {
  const python = fitnessCoachPython();
  if (!python) {
    return Promise.resolve({
      ok: false,
      stdout: "",
      stderr: "fitness-coach venv python not found",
      code: null,
    });
  }
  const root = siblingRoot("fitness");
  return new Promise((resolve) => {
    const child = spawn(python, ["-m", "fitness_coach.scripts.apply_course"], {
      cwd: root,
      env: { ...process.env, PYTHONUTF8: "1" },
    });
    const timer = setTimeout(() => {
      child.kill();
    }, 90_000);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, stdout, stderr: err.message, code: null });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, stdout, stderr, code });
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
