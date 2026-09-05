# Metrics Definitions

## GitHub

- Public repository count and stars: paginated GitHub REST repository metadata for Kynmmarshall. Stars are summed across the returned public repositories, including forks; this is not a profile achievement score.
- Language shares: sum of GitHub Linguist bytes for owned, public, non-fork, non-archived repositories. Top six plus Other sum to 100%. Empty repositories contribute zero bytes. Tool-generated platform scaffolding may affect the distribution; bytes do not represent skill or coding hours.
- Contribution calendar: GitHub GraphQL contributionsCollection. It follows GitHub's rules, not an exhaustive work log; anonymized private contributions can appear if the profile enables them. No private repository details are requested. Missing token/data yields an unavailable panel, not fake activity.
- Language inventories are cached for one day; recommended metadata refresh is six-hourly. Provider failures retain the last successful snapshot with its original timestamp. First-run partial language results are explicitly labeled partial. Quota failures stop additional language requests rather than hammering the API.
- Snapshots older than 24 hours are stale. API responses have short public caches, and visitors cannot trigger upstream refresh.

## Reachability

- Target: the public HTTPS landing page of each of the five configured projects. A 2xx response indicates reachability, not complete application or database health.
- Requests resolve public IPv4 addresses and pin the chosen address for TLS connection. Unsafe addresses and redirects are unknown; HTTP or connection failures are unreachable from this observer.
- Recommended schedule: one job every five minutes; max two concurrent probes. Same slot/service writes are idempotent. Recent history retains up to 30 days.
- Observed availability = successful classified probes / all classified probes. It is withheld until twelve observations exist. Coverage = classified probes / expected five-minute slots since the first retained sample. Missing/unknown observations never become successful samples.
- Public status becomes stale after ten minutes without a new observation. Missing history remains gray. A lone successful check is not 100% uptime.
- Checks run from the portfolio host. They cannot independently report its own complete outage. Use an independent external observer before making SLA or externally measured uptime claims.
