import { test } from "node:test";
import assert from "node:assert/strict";
import { pillars } from "../content/profile.ts";
import {
  githubStackSource,
  profileListedTools,
} from "../content/github-stack.ts";

test("every technology reviewed on the GitHub profile appears in portfolio expertise", () => {
  const available = new Set<string>(
    pillars.flatMap((pillar) => [...pillar.tools]),
  );
  for (const name of githubStackSource.technologies)
    assert.ok(
      available.has(name),
      `Missing GitHub profile technology: ${name}`,
    );
  for (const name of profileListedTools)
    assert.ok(
      available.has(name),
      `Unrendered profile-listed technology: ${name}`,
    );
  for (const pillar of pillars)
    assert.equal(
      new Set(pillar.tools).size,
      pillar.tools.length,
      `Duplicate tool in ${pillar.id}`,
    );
});
