import { execSync } from "node:child_process";
import { getRepoRoot } from "../security/paths";

export type GitStatusEntry = {
  status: string;
  path: string;
};

export function getGitStatus(): { ok: boolean; entries: GitStatusEntry[]; error?: string } {
  try {
    const out = execSync("git status --porcelain", {
      cwd: getRepoRoot(),
      encoding: "utf8",
    });
    const entries = out
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => ({
        status: line.slice(0, 2).trim() || "??",
        path: line.slice(3).trim(),
      }));
    return { ok: true, entries };
  } catch (error) {
    return {
      ok: false,
      entries: [],
      error: error instanceof Error ? error.message : "git status falló",
    };
  }
}
