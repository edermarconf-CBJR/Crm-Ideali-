import { spawnSync } from "node:child_process";
for (const args of [
  [
    "--conditions=react-server",
    "--import",
    "tsx",
    "scripts/migrar.ts",
    "--teste",
  ],
  ["node_modules/vitest/vitest.mjs", "run", ...process.argv.slice(2)],
]) {
  const r = spawnSync(process.execPath, args, {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
