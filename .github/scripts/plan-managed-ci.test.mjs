/** Tests for the generated managed-site CI impact planner. */

import assert from "node:assert/strict";
import test from "node:test";

import { changedPaths, createManagedCiPlan, needsFreshScaffoldCanary } from "./plan-managed-ci.mjs";

test("content and navigation changes use the lightweight gate", () => {
  assert.deepEqual(
    createManagedCiPlan([
      "src/content/guides/quickstart.mdx",
      "docs.json",
      "public/logo.svg",
    ]),
    { changedCount: 3, full: false, mode: "content" },
  );
});

test("runtime and dependency changes retain the full gate", () => {
  for (const path of [
    "src/components/docs/doc-layout.tsx",
    "src/data/site.ts",
    "package-lock.json",
    ".github/workflows/ci.yml",
  ]) {
    assert.equal(createManagedCiPlan([path]).full, true, path);
  }
});

test("manual or ambiguous validation retains the full gate", () => {
  assert.equal(createManagedCiPlan([]).full, true);
});


test("unavailable comparison history fails closed", () => {
  assert.deepEqual(changedPaths("invalid"), []);
  assert.deepEqual(changedPaths("0".repeat(40)), []);
});


test("fresh-scaffold compatibility follows onboarding and tool contracts", () => {
  for (const path of ["src/content/quickstart.mdx", "src/content/es/quickstart.mdx",
    "src/content/guides/cli-reference.mdx", "src/content/guides/migrate-from-fern.mdx",
    ".github/thally-tooling/package-lock.json", ".github/scripts/cli-command-contract.test.mjs",
    ".github/workflows/ci.yml", "starter-release.json", "package.json"]) {
    assert.equal(needsFreshScaffoldCanary([path]), true, path);
  }
  assert.equal(needsFreshScaffoldCanary(["src/content/guides/search.mdx", "public/logo.svg"]), false);
  assert.equal(needsFreshScaffoldCanary([]), true);
});


test("runtime-to-content renames retain both sides of the impact comparison", () => {
  const paths = changedPaths("a".repeat(40), (command, arguments_) => {
    assert.equal(command, "git");
    assert.ok(arguments_.includes("--no-renames"));
    assert.ok(arguments_.includes("-z"));
    return "src/lib/runtime.ts\0src/content/runtime.mdx\0";
  });
  assert.deepEqual(paths, ["src/lib/runtime.ts", "src/content/runtime.mdx"]);
  assert.equal(createManagedCiPlan(paths).full, true);
});
