import { definirAmbienteTeste } from "./scripts/ambiente-teste.mjs";
import { defineConfig } from "@playwright/test";
import { loadEnvFile } from "node:process";
loadEnvFile(".env.local");
definirAmbienteTeste();
process.env.APP_ORIGIN = "http://127.0.0.1:3101";
export default defineConfig({
  testDir: "testes/telas",
  workers: 1,
  timeout: 30000,
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.APP_ORIGIN,
    channel: "chrome",
    headless: true,
    screenshot: "only-on-failure",
  },
  reporter: "list",
});
