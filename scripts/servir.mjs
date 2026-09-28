import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
process.env.HOSTNAME = "127.0.0.1";
process.env.PORT = process.env.PORT ?? "3100";
process.env.NEXT_TELEMETRY_DISABLED = "1";
await import("../.next/standalone/server.js");
