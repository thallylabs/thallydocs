/**
 * Selects the inexpensive content validation path for authored-only changes.
 * Runtime, dependency, workflow, and unknown paths retain the full test/build
 * gate. This script has no dependencies so planning never requires `npm ci`.
 */

import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const CONTENT_PATHS = [
  /^src\/content\//,
  /^public\//,
  /^docs\.json$/,
  /^openapi\.(?:json|ya?ml)$/,
  /^(?:README|CHANGELOG)\.md$/i,
];

export function isAuthoredContentPath(path) {
  return CONTENT_PATHS.some((pattern) => pattern.test(path));
}

export function createManagedCiPlan(paths) {
  const full =
    paths.length === 0 || paths.some((path) => !isAuthoredContentPath(path));
  return {
    changedCount: paths.length,
    full,
    mode: full ? "runtime" : "content",
  };
}

export function changedPaths(baseSha, run = execFileSync) {
  if (!/^[a-f0-9]{40}$/i.test(baseSha)) {
    return [];
  }
  try {
    // NUL delimiters preserve unusual filenames; missing history fails closed.
    return run("git", ["diff", "--name-only", "--no-renames", "-z", `${baseSha}...HEAD`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).split("\0").filter(Boolean);
  } catch {
    return [];
  }
}

/** Select onboarding and tool/source contracts for the public-package canary. */
export function needsFreshScaffoldCanary(paths) {
  return paths.length === 0 || paths.some((path) =>
    /^src\/content\/(?:[a-z]{2}\/)?(?:quickstart\.mdx|guides\/(?:getting-started|cli-[^/]+|troubleshooting|migrat[^/]*|migrate-[^/]+)\.mdx|components\/agent-prompt\.mdx)$/.test(path) ||
    /^\.github\/thally-tooling\//.test(path) ||
    /^\.github\/scripts\/.*(?:contract|plan-managed-ci).*\.mjs$/.test(path) ||
    /^\.github\/workflows\/(?:ci|scaffold-compatibility)\.yml$/.test(path) ||
    /^(?:package(?:-lock)?\.json|starter-release\.json|README\.md)$/.test(path));
}

export function main() {
  const paths = changedPaths(process.argv[2] ?? "");
  const plan = { ...createManagedCiPlan(paths), canary: needsFreshScaffoldCanary(paths) };
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `canary=${plan.canary}\nfull=${plan.full}\nmode=${plan.mode}\nchanged_count=${plan.changedCount}\n`,
    );
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Managed-site CI plan\n\n- Mode: ${plan.mode}\n- Changed paths: ${plan.changedCount}\n`,
    );
  }
  process.stdout.write(`${JSON.stringify(plan)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
