import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";
import { serviceTargets, type ProbeResult } from "./targets.ts";

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(network, prefix, "ipv4");
export function isPublicAddress(address: string) {
  return isIP(address) === 4 && !blocked.check(address, "ipv4");
}
export function allowedTarget(url: URL) {
  return (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    (!url.port || url.port === "443") &&
    serviceTargets.some((target) => new URL(target.url).origin === url.origin)
  );
}

export async function probe(
  url: URL,
  redirects = 0,
  started = performance.now(),
): Promise<ProbeResult> {
  if (!allowedTarget(url) || redirects > 2)
    return { result: "unknown", statusCode: null, latencyMs: null };
  try {
    const addresses = await lookup(url.hostname, { all: true, family: 4 });
    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicAddress(address))
    )
      return { result: "unknown", statusCode: null, latencyMs: null };
    return await new Promise<ProbeResult>((resolve) => {
      const connection = request(
        url,
        {
          method: "GET",
          family: 4,
          signal: AbortSignal.timeout(5000),
          lookup: (_hostname, _options, callback) =>
            callback(null, addresses[0].address, 4),
          headers: {
            "User-Agent": "Kynmmarshall-Portfolio-Status",
            Range: "bytes=0-1023",
          },
        },
        (response) => {
          const statusCode = response.statusCode ?? 0;
          const location = response.headers.location;
          response.destroy();
          if (statusCode >= 300 && statusCode < 400 && location) {
            try {
              const next = new URL(location, url);
              if (next.origin !== url.origin || !allowedTarget(next)) {
                resolve({ result: "unknown", statusCode, latencyMs: null });
                return;
              }
              resolve(probe(next, redirects + 1, started));
            } catch {
              resolve({ result: "unknown", statusCode, latencyMs: null });
            }
            return;
          }
          resolve({
            result:
              statusCode >= 200 && statusCode < 300
                ? "reachable"
                : "unreachable",
            statusCode,
            latencyMs: Math.round(performance.now() - started),
          });
        },
      );
      connection.setTimeout(5000, () =>
        connection.destroy(new Error("timeout")),
      );
      connection.on("error", () =>
        resolve({ result: "unreachable", statusCode: null, latencyMs: null }),
      );
      connection.end();
    });
  } catch {
    return { result: "unknown", statusCode: null, latencyMs: null };
  }
}
