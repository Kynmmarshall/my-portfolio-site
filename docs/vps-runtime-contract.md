# VPS Runtime Contract

This is a prerequisites document, not a deployment script. No VPS, DNS, NGINX, pipeline, scheduler, or remote service was modified.

- Node.js 24.x and npm. The application uses Node's built-in SQLite API; it currently emits an experimental warning. Pin and test the Node minor version before production upgrades.
- NGINX terminates TLS and proxies to a locally bound Next.js Node process. Set the actual public `SITE_URL` before building production social metadata and sitemap.
- Supply a minimum-access GitHub token as a server secret when contribution-calendar data is desired. Do not publish it or expose it via client-prefixed variables. `.env.local` is ignored and loaded by Next.js and the one-shot data scripts.
- Keep SQLite/WAL files in a writable persistent directory, outside immutable release output and outside `public/`. Use `PORTFOLIO_DB_PATH` for an absolute deployment path, or mount persistent storage at `.data/`.
- Back up SQLite consistently. For WAL databases, use SQLite's backup mechanism or a stopped/checkpointed database; do not copy only an actively written main file.
- Assign one scheduler to invoke GitHub refresh every six hours and reachability checks every five minutes. Jobs have expiring locks and idempotent sample slots; no timers run inside HTTP handlers or Next.js workers.
- `tsx` is retained as a runtime dependency for TypeScript job entrypoints. Browser tests, media conversion, fonts tooling and TypeScript development requirements are available during build; FFmpeg/Playwright are not needed to serve already-prepared media.
- Use `npm ci`, `npm run build`, and `npm start` for a reproducible Node deployment. No static-export-only host can execute these APIs or data jobs.
- API failures should remain visible as stale/unavailable data while the portfolio stays usable. Set log retention/security practices and update the privacy page to reflect actual hosting behavior.
- Automated Chromium checks run locally on Windows. Linux filesystem casing/native runtime and real-device Safari/Firefox checks remain deployment acceptance tasks, not claims of completed verification.
