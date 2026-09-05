import { test } from "node:test";
import assert from "node:assert/strict";
import { getProject } from "../content/projects.ts";
import { profile } from "../content/profile.ts";

test("Fruit Collector links to its verified Play Store release and developer account", () => {
  const store = getProject("fruit-collector")?.playStore;
  assert.ok(store);
  assert.equal(new URL(store.url).hostname, "play.google.com");
  assert.equal(
    new URL(store.url).searchParams.get("id"),
    "com.kynmmarshall.fruitcollector",
  );
  assert.equal(store.developer, profile.name);
  assert.equal(store.developerUrl, profile.playStore);
  assert.equal(
    new URL(store.developerUrl).searchParams.get("id"),
    profile.name,
  );
  assert.equal(getProject("trip-io")?.playStore, undefined);
});
