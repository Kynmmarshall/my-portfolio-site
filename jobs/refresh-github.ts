import { collectGithub } from "../lib/integrations/github.ts";
import { saveSnapshot, withJobLock } from "../lib/storage/database.ts";

await withJobLock("github", async () => {
  try {
    const result = await collectGithub();
    saveSnapshot("github", result, result.collectedAt);
    console.log(
      `GitHub: ${result.repositories} repositories, ${result.languages.length} language groups; activity ${result.activitySource}; partial=${result.partial}`,
    );
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
});
