import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { fitnessRepo } from "@/lib/week-log/fitness";
import {
  dispatchRepositoryEvent,
  listRepositoryDispatchRuns,
  opsGithubToken,
  readGithubFile,
} from "@/lib/week-log/github";
import { siblingRoot } from "@/lib/week-log/local";

const STUDIO_EVENT = "studio-apply-course";
const POLL_MS = 2_500;
const WAIT_MS = 105_000;

export function fitnessCoachPython(): string | null {
  const root = siblingRoot("fitness");
  const win = path.join(root, ".venv", "Scripts", "python.exe");
  const nix = path.join(root, ".venv", "bin", "python");
  if (fs.existsSync(win)) return win;
  if (fs.existsSync(nix)) return nix;
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runLocalPython(payload: unknown): Promise<{
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

function tokenHint(status: number, detail: string): string {
  if (status === 401 || /bad credentials/i.test(detail)) {
    return "OPS_GITHUB_TOKEN is missing, expired, or revoked. Update the Vercel env var (Contents: Read and write on fitness-coach) and retry.";
  }
  if (status === 403 || status === 404) {
    return "OPS_GITHUB_TOKEN cannot dispatch to fitness-coach. Grant Contents: Read and write on AlexTouvras/fitness-coach, then redeploy.";
  }
  return detail.slice(0, 800) || "Could not apply course on GitHub.";
}

async function waitForRemoteApply(
  nonce: string,
  startedAt: number,
  token: string,
): Promise<{ ok: boolean; stdout: string; stderr: string; code: number | null }> {
  const repo = fitnessRepo();
  if (!repo) {
    return {
      ok: false,
      stdout: "",
      stderr: "FITNESS_GITHUB_REPO is not configured.",
      code: null,
    };
  }
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const marker = await readGithubFile(repo, "data/studio-apply.json", token);
    if (marker.ok) {
      try {
        const row = JSON.parse(marker.text) as {
          ok?: boolean;
          nonce?: string;
          week_id?: string | null;
        };
        if (row.nonce === nonce && row.ok === true) {
          return {
            ok: true,
            stdout: JSON.stringify({ ok: true, week_id: row.week_id ?? null, via: "github" }),
            stderr: "",
            code: 0,
          };
        }
      } catch {
        /* keep polling */
      }
    }
    const runs = await listRepositoryDispatchRuns(repo, token);
    if (runs.ok) {
      const mine = runs.runs.filter((run) => {
        const created = Date.parse(run.created_at);
        return Number.isFinite(created) && created >= startedAt - 5_000;
      });
      const failed = mine.find(
        (run) => run.status === "completed" && run.conclusion && run.conclusion !== "success",
      );
      if (failed) {
        return {
          ok: false,
          stdout: "",
          stderr: `fitness-coach apply workflow ${failed.conclusion}. ${failed.html_url}`.trim(),
          code: 1,
        };
      }
    }
    await sleep(POLL_MS);
  }
  return {
    ok: false,
    stdout: "",
    stderr:
      "Timed out waiting for fitness-coach to apply the course. Check Actions on fitness-coach, then refresh Studio.",
    code: null,
  };
}

async function runRemoteGithub(payload: unknown): Promise<{
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
}> {
  const token = opsGithubToken();
  if (!token) {
    return {
      ok: false,
      stdout: "",
      stderr:
        "OPS_GITHUB_TOKEN is not configured. Studio cannot apply the fitness course on Vercel without Contents: Read and write on fitness-coach.",
      code: null,
    };
  }
  const repo = fitnessRepo();
  if (!repo) {
    return {
      ok: false,
      stdout: "",
      stderr: "FITNESS_GITHUB_REPO is not configured.",
      code: null,
    };
  }
  const nonce = randomUUID();
  const startedAt = Date.now();
  const body =
    payload && typeof payload === "object"
      ? { ...(payload as Record<string, unknown>), nonce }
      : { nonce };
  const dispatched = await dispatchRepositoryEvent(repo, STUDIO_EVENT, body, token);
  if (!dispatched.ok) {
    return {
      ok: false,
      stdout: "",
      stderr: tokenHint(dispatched.status, dispatched.detail),
      code: dispatched.status || null,
    };
  }
  return waitForRemoteApply(nonce, startedAt, token);
}

export function runFitnessApplyCourse(payload: unknown): Promise<{
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
}> {
  const onVercel = Boolean(process.env.VERCEL);
  if (!onVercel && fitnessCoachPython()) {
    return runLocalPython(payload);
  }
  return runRemoteGithub(payload);
}
