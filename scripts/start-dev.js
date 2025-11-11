#!/usr/bin/env node

import { execSync, spawn } from "child_process";
import { platform } from "os";
import net from "net";

const isWindows = platform() === "win32";

const run = (cmd, options = {}) => {
  console.log(`\n🟢 Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", ...options });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
  }
};

const waitForPort = async (host, port, serviceName, timeout = 120000) => {
  console.log(`⏳ Waiting for ${serviceName} (${host}:${port})...`);
  const start = Date.now();
  let dots = 0;

  while (Date.now() - start < timeout) {
    const socket = new net.Socket();
    try {
      await new Promise((resolve, reject) => {
        socket.setTimeout(3000);
        socket.once("error", reject);
        socket.once("timeout", reject);
        socket.connect(port, host, resolve);
      });
      socket.end();
      console.log(`\n✅ ${serviceName} is ready!`);
      return;
    } catch {
      socket.destroy();
      process.stdout.write(".");
      dots++;
      if (dots % 20 === 0) process.stdout.write(` (${Math.floor((Date.now() - start) / 1000)}s)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error(`❌ Timeout waiting for ${serviceName} after ${timeout/1000}s`);
};

async function main() {
  try {
    console.log("🚀 Darevel Suite - Starting Development Environment\n");
    console.log("=".repeat(60));

    // 1️⃣ Check if Docker is running
    console.log("\n📦 Checking Docker...");
    try {
      execSync("docker --version", { stdio: "ignore" });
      console.log("✅ Docker is installed");
    } catch {
      console.error("❌ Docker is not installed or not running!");
      console.error("   Please install Docker Desktop: https://www.docker.com/products/docker-desktop");
      process.exit(1);
    }

    // Check if Docker daemon is running
    try {
      execSync("docker ps", { stdio: "ignore" });
      console.log("✅ Docker daemon is running");
    } catch {
      console.error("❌ Docker daemon is not running!");
      console.error("   Please start Docker Desktop");
      process.exit(1);
    }

    // 2️⃣ Start Docker services
    console.log("\n🐳 Starting Docker backend services...");
    console.log("   - PostgreSQL (port 5432)");
    console.log("   - Keycloak (port 8080)");
    console.log("   - Redis (port 6379)");

    run("docker compose up -d");

    // 3️⃣ Wait for services to be ready
    console.log("\n⏳ Waiting for services to be ready...\n");

    // Wait for Postgres
    await waitForPort("localhost", 5432, "PostgreSQL", 60000);

    // Wait for Redis
    await waitForPort("localhost", 6379, "Redis", 30000);

    // Wait for Keycloak (takes longer)
    await waitForPort("localhost", 8080, "Keycloak", 120000);

    console.log("\n" + "=".repeat(60));
    console.log("✅ All backend services are ready!\n");

    // 4️⃣ Show service URLs
    console.log("📍 Infrastructure Services:");
    console.log("   PostgreSQL (Keycloak):  localhost:5432 (user: keycloak, pass: keycloak)");
    console.log("   PostgreSQL (App):       localhost:5433 (user: postgres, pass: postgres)");
    console.log("   Keycloak:               http://localhost:8080 (admin/admin)");
    console.log("   Redis:                  localhost:6379");
    console.log("\n📍 Microservices (Spring Boot):");
    console.log("   API Gateway:     http://localhost:8081");
    console.log("   User Service:    http://localhost:8082");
    console.log("   Drive Service:   http://localhost:8083");
    console.log("   Mail Service:    http://localhost:8084");
    console.log("   Chat Service:    http://localhost:8085");
    console.log("   Notify Service:  http://localhost:8086");
    console.log("   Excel Service:   http://localhost:8087");
    console.log("   Slides Service:  http://localhost:8088");
    console.log("\n📍 Frontend Apps (Next.js):");
    console.log("   Slides App:      http://localhost:3001");
    console.log("   Suite App:       http://localhost:3002");
    console.log("   Auth App:        http://localhost:3005");
    console.log("   Drive App:       http://localhost:3006");
    console.log("   Notify App:      http://localhost:3007\n");

    console.log("=".repeat(60));
    console.log("\n🚀 Starting all Darevel apps with Turborepo...\n");

    // 5️⃣ Start all apps via Turborepo
    const turboProcess = spawn("turbo", ["run", "dev", "--parallel"], {
      stdio: "inherit",
      shell: true
    });

    // Handle process termination
    const cleanup = () => {
      console.log("\n\n⏹️  Shutting down apps...");
      turboProcess.kill();
      console.log("💡 Tip: Run 'npm run stop' to stop Docker services");
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    turboProcess.on("exit", (code) => {
      console.log(`\nTurborepo exited with code ${code}`);
      console.log("💡 Tip: Run 'npm run stop' to stop Docker services");
      process.exit(code || 0);
    });

  } catch (err) {
    console.error("\n❌ Error starting development environment:");
    console.error("   " + err.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check Docker Desktop is running");
    console.error("   - Try: docker compose down && docker compose up -d");
    console.error("   - Check logs: npm run logs");
    process.exit(1);
  }
}

main();
