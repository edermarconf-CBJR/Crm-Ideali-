import { loadEnvFile } from "node:process";
loadEnvFile(".env.local");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!new URL(process.env.DATABASE_URL!).pathname.endsWith("_teste"))
  throw new Error("Testes exigem banco isolado.");
