import { definirAmbienteTeste } from "../../scripts/ambiente-teste.mjs";
import { loadEnvFile } from "node:process";
loadEnvFile(".env.local");
definirAmbienteTeste();
if (!new URL(process.env.DATABASE_URL!).pathname.endsWith("_teste"))
  throw new Error("Testes exigem banco isolado.");
