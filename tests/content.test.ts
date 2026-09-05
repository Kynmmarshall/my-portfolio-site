import { test } from "node:test";
import assert from "node:assert/strict";
import { featuredProjects, getProject, projects } from "../content/projects.ts";

test("production projects retain their exact deployment destinations", () => {
  const expected = {
    "trip-io": "https://trip-io.duckdns.org",
    "grid-survival": "https://grid-survival.duckdns.org",
    batchit: "https://batchit.duckdns.org",
    "pick-my-dish": "https://pickmydish.duckdns.org",
    "fruit-collector": "https://fruitcollector.duckdns.org",
  };
  assert.equal(featuredProjects.length, 5);
  for (const [slug, url] of Object.entries(expected)) assert.equal(getProject(slug)?.liveUrl, url);
});

test("projects have unique routes and HTTPS actions", () => {
  assert.equal(new Set(projects.map((project) => project.slug)).size, projects.length);
  for (const project of projects) {
    assert.equal(new URL(project.liveUrl).protocol, "https:");
    assert.ok(project.evidence.length > 0);
    assert.ok(project.gallery.includes(project.cover));
  }
  assert.equal(getProject("does-not-exist"), undefined);
});