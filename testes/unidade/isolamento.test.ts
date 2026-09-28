import { test, expect } from "vitest";
import { spawnSync } from "node:child_process";
test("Playwright recusa base operacional antes de executar cenários", () => {
  const r = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "await import('./playwright.config.ts')",
    ],
    {
      env: {
        ...process.env,
        TEST_DATABASE_URL: "postgresql://teste:teste@127.0.0.1:1/operacao",
        DATABASE_URL: "postgresql://teste:teste@127.0.0.1:1/operacao",
      },
      encoding: "utf8",
      windowsHide: true,
    },
  );
  expect(r.status).not.toBe(0);
  expect(r.stderr).toContain("isolado");
});
