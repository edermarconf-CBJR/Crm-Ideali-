import { loadEnvFile } from "node:process";
import { spawn } from "node:child_process";
loadEnvFile(".env.local");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.APP_ORIGIN = "http://127.0.0.1:3101";
const p = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3101",
  ],
  { env: process.env, stdio: "inherit", windowsHide: true },
);
p.on("exit", (c) => process.exit(c ?? 1));
