#!/usr/bin/env node
/**
 * Darevel Suite - Development Server Launcher
 * ------------------------------------------------------------
 * Starts all microservices and frontend apps in development mode
 * Uses concurrently to run multiple Next.js apps simultaneously
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const APPS = [
  { name: "auth", port: 3005, color: "cyan" },
  { name: "suite", port: 3002, color: "green" },
  { name: "mail", port: 3008, color: "yellow" },
  { name: "drive", port: 3006, color: "blue" },
  { name: "slides", port: 3000, color: "magenta" },
  { name: "excel", port: 3004, color: "red" },
  { name: "notify", port: 3007, color: "gray" },
  { name: "chat", port: 3003, color: "white" },
];

function checkSetup() {
  console.log("🔍 Checking if setup has been run...\n");

  // Check if Docker services are running
  try {
    execSync("docker compose ps --format json", { stdio: "pipe", cwd: ROOT });
  } catch {
    console.error("❌ Backend services are not running!");
    console.error("   Please run: npm run setup\n");
    process.exit(1);
  }

  // Check if auth app has .env.local
  const authEnv = path.join(ROOT, "apps", "auth", ".env.local");
  if (!fs.existsSync(authEnv)) {
    console.error("❌ Environment files not found!");
    console.error("   Please run: npm run setup\n");
    process.exit(1);
  }

  console.log("✅ Setup verified!\n");
}

function main() {
  console.log("\n🚀 Starting Darevel Development Servers\n");
  console.log("====================================================\n");

  checkSetup();

  // Check if concurrently is available
  try {
    execSync("npx concurrently --version", { stdio: "ignore" });
  } catch {
    console.log("📦 Installing concurrently...");
    execSync("npm install -D concurrently", { stdio: "inherit", cwd: ROOT });
  }

  // Build concurrently command
  const commands = APPS.map(app => {
    const appPath = path.join(ROOT, "apps", app.name);
    return `"cd ${appPath} && npm run dev"`;
  }).join(" ");

  const names = APPS.map(app => `"${app.name}:${app.port}"`).join(",");
  const colors = APPS.map(app => app.color).join(",");

  console.log("🎯 Starting all frontend apps...\n");
  console.log("Apps:");
  APPS.forEach(app => {
    console.log(`  • ${app.name.padEnd(8)} → http://localhost:${app.port}`);
  });
  console.log("\n====================================================");
  console.log("Press Ctrl+C to stop all servers");
  console.log("====================================================\n");

  // Run concurrently
  try {
    execSync(
      `npx concurrently --names ${names} --prefix-colors ${colors} ${commands}`,
      { stdio: "inherit", cwd: ROOT }
    );
  } catch (err) {
    // User pressed Ctrl+C
    console.log("\n\n✋ Stopping all development servers...");
    process.exit(0);
  }
}

main();
