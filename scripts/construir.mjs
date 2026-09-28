import { spawnSync } from "node:child_process";
import { cp, access } from "node:fs/promises";
const r = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  },
);
if (r.status !== 0) process.exit(r.status ?? 1);
await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
try {
  await access("public");
  await cp("public", ".next/standalone/public", { recursive: true });
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
