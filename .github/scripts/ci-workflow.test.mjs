/** Workflow policy coverage using the pinned content toolchain's YAML parser. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(new URL("../thally-tooling/package.json", import.meta.url));
const { parse } = require("yaml");
const workflow = parse(readFileSync(".github/workflows/ci.yml", "utf8"));

const compatibility = parse(readFileSync(".github/workflows/scaffold-compatibility.yml", "utf8"));

test("candidate impact uses the merge-group base and gates only the fresh-package canary", () => {
  assert.equal(workflow.jobs.plan.outputs.full, "${{ steps.plan.outputs.full }}");
  const plan = workflow.jobs.plan.steps.find((step) => step.id === "plan");
  assert.equal(plan.env.BASE_SHA, "${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}");
  assert.equal(workflow.jobs['cli-contract'].if, "needs.plan.outputs.canary == 'true'");
  assert.equal(workflow.jobs['cli-contract'].needs, "plan");
});

test("candidate content and documentation contracts always validate the checked-out source", () => {
  const verify = workflow.jobs.verify;
  assert.equal(verify.needs, "plan");
  assert.equal(verify.if, "always()");
  const requiredPlan = verify.steps.find((step) => step.name === "Require a successful validation plan");
  assert.equal(requiredPlan.env.PLAN_RESULT, "${{ needs.plan.result }}");
  assert.match(requiredPlan.run, /test "\$PLAN_RESULT" = success/);
  for (const name of ["Check authored content", "Verify CLI documentation contract", "Verify Knowledge-surface documentation contract", "Verify CI planning policy"]) {
    assert.equal(verify.steps.find((step) => step.name === name).if, undefined, name);
  }
  for (const name of ["Verify generated runtime snapshot", "Test", "Build managed runtime and content assets", "Verify managed content artifact"]) {
    assert.equal(verify.steps.find((step) => step.name === name).if, "needs.plan.outputs.full == 'true'", name);
  }
});

test("published package compatibility has weekly, release-dispatch, and manual coverage", () => {
  assert.equal(compatibility.on.schedule.length, 1);
  assert.deepEqual(compatibility.on.repository_dispatch.types, ["published-package-compatibility"]);
  assert.equal(compatibility.on.workflow_dispatch, null);
  assert.deepEqual(compatibility.permissions, { contents: "read" });
  const source = readFileSync(".github/workflows/scaffold-compatibility.yml", "utf8");
  assert.doesNotMatch(source, /secrets\.|client_payload|download-artifact/);
  const steps = compatibility.jobs['cli-contract'].steps;
  assert.match(steps.find((step) => step.name === "Create a clean project").run, /create-thally-docs@latest/);
  assert.match(steps.find((step) => step.name === "Run the documented first check").run, /@thallylabs\/cli@latest check --ci/);
});
