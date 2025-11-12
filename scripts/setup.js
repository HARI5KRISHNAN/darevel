#!/usr/bin/env node
/**
 * Darevel Suite - Universal One-Click Setup
 * ------------------------------------------------------------
 * ✅ Starts Docker (if not running)
 * ✅ Waits for Keycloak, Redis, Postgres
 * ✅ Auto-creates nextauth-client in Keycloak
 * ✅ Syncs NEXTAUTH_SECRET and .env.local across all apps
 * ✅ Fully idempotent - safe to rerun anytime
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync, spawnSync } from "child_process";
import net from "net";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const KEYCLOAK_URL = "http://localhost:8080";
const REALM = "pilot180";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";
const CLIENT_ID = "darevel-auth";

const APPS = [
  { name: "auth", port: 3005 },
  { name: "suite", port: 3002 },
  { name: "mail", port: 3008 },
  { name: "drive", port: 3006 },
  { name: "slides", port: 3000 },
  { name: "excel", port: 3004 },
  { name: "notify", port: 3007 },
  { name: "chat", port: 3003 },
];

// ------------------------------------------------------------

function randomSecret() {
  return crypto.randomBytes(32).toString("base64");
}

function parseEnv(filePath) {
  const vars = {};
  if (!fs.existsSync(filePath)) return vars;

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const val = trimmed.substring(eqIndex + 1).trim();
      vars[key] = val;
    }
  }
  return vars;
}

function writeEnv(filePath, vars) {
  const text = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.writeFileSync(filePath, text);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForPort(port, name, timeout = 120000) {
  const start = Date.now();
  process.stdout.write(`⏳ Waiting for ${name} on port ${port}`);
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.once("error", rej);
        socket.once("timeout", rej);
        socket.connect(port, "127.0.0.1", () => {
          socket.destroy();
          res();
        });
      });
      console.log(` ✅`);
      return;
    } catch {
      process.stdout.write(".");
      await sleep(2000);
    }
  }
  throw new Error(`❌ Timeout waiting for ${name} (port ${port})`);
}

async function getAdminToken() {
  try {
    const fetch = (await import("node-fetch")).default;
    const res = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "admin-cli",
        username: ADMIN_USER,
        password: ADMIN_PASS,
        grant_type: "password",
      }).toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cannot authenticate with Keycloak: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    throw new Error(`❌ Failed to get Keycloak admin token: ${err.message}`);
  }
}

async function ensureKeycloakClient(token, clientSecret) {
  const fetch = (await import("node-fetch")).default;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Check if client exists
  const res = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${CLIENT_ID}`, { headers });
  const clients = await res.json();

  if (clients.length > 0) {
    console.log(`✅ Keycloak client "${CLIENT_ID}" already exists`);
    return clients[0];
  }

  console.log(`⚙️  Creating Keycloak client "${CLIENT_ID}"...`);
  const create = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}/clients`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      clientId: CLIENT_ID,
      name: "Darevel Auth Client",
      secret: clientSecret,
      serviceAccountsEnabled: true,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      redirectUris: [
        "http://localhost:3005/*",
        "http://localhost:3005/api/auth/*",
        "http://localhost:3005/api/auth/callback/keycloak",
      ],
      webOrigins: [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:3007",
        "http://localhost:3008",
      ],
      publicClient: false,
      protocol: "openid-connect",
    }),
  });

  if (!create.ok) {
    const text = await create.text();
    throw new Error(`❌ Failed to create Keycloak client: ${create.status} ${text}`);
  }
  console.log("✅ Keycloak client created successfully");
}

function ensureDocker() {
  console.log("\n🐳 Checking Docker...");
  try {
    execSync("docker --version", { stdio: "ignore" });
  } catch {
    console.error("❌ Docker not installed or not in PATH!");
    console.error("   Install Docker Desktop: https://www.docker.com/products/docker-desktop");
    process.exit(1);
  }

  try {
    execSync("docker info", { stdio: "ignore" });
    console.log("✅ Docker is running");
  } catch {
    console.log("⚙️  Starting Docker...");
    if (process.platform === "win32") {
      spawnSync("powershell.exe", ["-Command", "Start-Process", "'Docker Desktop'"], {
        stdio: "ignore",
        shell: true
      });
      console.log("⏳ Waiting for Docker to start (this may take 30-60 seconds)...");
      let retries = 0;
      while (retries++ < 60) {
        try {
          execSync("docker info", { stdio: "ignore" });
          console.log("✅ Docker started successfully");
          return;
        } catch {
          process.stdout.write(".");
          execSync("timeout /t 2 /nobreak", { stdio: "ignore", shell: true });
        }
      }
      console.error("\n❌ Docker failed to start. Please start Docker Desktop manually.");
      process.exit(1);
    } else if (process.platform === "darwin") {
      console.log("   Starting Docker Desktop on macOS...");
      spawnSync("open", ["-a", "Docker"], { stdio: "ignore" });
      console.log("⏳ Waiting for Docker to start (this may take 30-60 seconds)...");
      let retries = 0;
      while (retries++ < 60) {
        try {
          execSync("docker info", { stdio: "ignore" });
          console.log("✅ Docker started successfully");
          return;
        } catch {
          process.stdout.write(".");
          execSync("sleep 2", { stdio: "ignore", shell: true });
        }
      }
      console.error("\n❌ Docker failed to start. Please start Docker Desktop manually.");
      process.exit(1);
    } else {
      console.error("❌ Please start Docker manually:");
      console.error("   sudo systemctl start docker");
      process.exit(1);
    }
  }
}

async function main() {
  console.log("\n🚀 Darevel One-Click Setup Started\n");
  console.log("====================================================");

  // Ensure Docker is running
  ensureDocker();

  // Start backend services
  console.log("\n📦 Starting backend services with Docker Compose...");
  try {
    execSync("docker compose up -d", { stdio: "inherit", cwd: ROOT });
  } catch (err) {
    console.error("❌ Failed to start Docker Compose services");
    throw err;
  }

  // Wait for services
  console.log("\n⏳ Waiting for backend services to be ready...");
  await waitForPort(5433, "PostgreSQL", 120000);
  await waitForPort(8080, "Keycloak", 180000);
  await waitForPort(6379, "Redis", 120000);

  console.log("\n✅ All backend services are ready!\n");

  // Prepare Auth env
  const authEnvPath = path.join(ROOT, "apps", "auth", ".env.local");
  let envVars = parseEnv(authEnvPath);

  // Generate secrets if they don't exist
  if (!envVars.NEXTAUTH_SECRET || envVars.NEXTAUTH_SECRET === "darevel-nextauth-super-secret-2025") {
    envVars.NEXTAUTH_SECRET = randomSecret();
    console.log("🔑 Generated new NEXTAUTH_SECRET");
  }

  if (!envVars.KEYCLOAK_CLIENT_SECRET || envVars.KEYCLOAK_CLIENT_SECRET === "<SECRET_FROM_KEYCLOAK_AUTH>") {
    envVars.KEYCLOAK_CLIENT_SECRET = randomSecret();
    console.log("🔑 Generated new KEYCLOAK_CLIENT_SECRET");
  }

  // Set base configuration
  envVars.NEXT_PUBLIC_KEYCLOAK_URL = KEYCLOAK_URL;
  envVars.NEXT_PUBLIC_KEYCLOAK_REALM = REALM;
  envVars.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID = CLIENT_ID;
  envVars.KEYCLOAK_CLIENT_ID = CLIENT_ID;
  envVars.NEXT_PUBLIC_APP_URL = "http://localhost:3005";
  envVars.NEXTAUTH_COOKIE_DOMAIN = "localhost";
  envVars.KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${REALM}`;
  envVars.REDIS_URL = "redis://localhost:6379";
  envVars.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/darevel";
  envVars.NEXTAUTH_URL = "http://localhost:3005";
  envVars.SUITE_URL = "http://localhost:3002";
  envVars.DRIVE_URL = "http://localhost:3006";
  envVars.MAIL_URL = "http://localhost:3008";
  envVars.SLIDES_URL = "http://localhost:3000";
  envVars.CHAT_URL = "http://localhost:3003";
  envVars.NOTIFY_URL = "http://localhost:3007";
  envVars.EXCEL_URL = "http://localhost:3004";
  envVars.API_GATEWAY_URL = "http://localhost:8081";
  envVars.NODE_ENV = "development";
  envVars.TZ = "Asia/Kolkata";

  writeEnv(authEnvPath, envVars);
  console.log(`✅ Created/updated ${path.relative(ROOT, authEnvPath)}`);

  // Sync to other apps (simplified version with key auth variables)
  console.log("\n🔄 Syncing authentication config to other apps...");
  for (const app of APPS) {
    if (app.name === "auth") continue; // Already handled

    const envFile = path.join(ROOT, "apps", app.name, ".env.local");
    const existingVars = parseEnv(envFile);

    // Merge with existing, only updating auth-related vars
    const vars = {
      ...existingVars,
      NEXTAUTH_SECRET: envVars.NEXTAUTH_SECRET,
      NEXTAUTH_URL: "http://localhost:3005", // All apps point to auth app
      KEYCLOAK_ISSUER: envVars.KEYCLOAK_ISSUER,
      KEYCLOAK_CLIENT_ID: envVars.KEYCLOAK_CLIENT_ID,
      KEYCLOAK_CLIENT_SECRET: envVars.KEYCLOAK_CLIENT_SECRET,
      NEXT_PUBLIC_KEYCLOAK_URL: KEYCLOAK_URL,
      NEXT_PUBLIC_KEYCLOAK_REALM: REALM,
      NEXT_PUBLIC_AUTH_URL: "http://localhost:3005",
    };

    writeEnv(envFile, vars);
    console.log(`   ✓ ${app.name}`);
  }

  // Keycloak Client Setup
  console.log("\n🔑 Configuring Keycloak...");
  try {
    const token = await getAdminToken();
    console.log("✅ Authenticated with Keycloak Admin API");
    await ensureKeycloakClient(token, envVars.KEYCLOAK_CLIENT_SECRET);
  } catch (err) {
    console.error(`\n⚠️  Warning: Could not configure Keycloak automatically: ${err.message}`);
    console.error("   You may need to configure the client manually at:");
    console.error(`   ${KEYCLOAK_URL}/admin/master/console/#/pilot180/clients`);
  }

  console.log("\n====================================================");
  console.log("🎉 Darevel Setup Complete!");
  console.log("====================================================\n");
  console.log("Backend Services:");
  console.log(`  🧠 Keycloak → ${KEYCLOAK_URL} (admin/admin)`);
  console.log("  🗃️  PostgreSQL → localhost:5433");
  console.log("  ⚡ Redis → localhost:6379\n");
  console.log("Frontend Apps:");
  APPS.forEach((a) => console.log(`  💻 ${a.name.padEnd(8)} → http://localhost:${a.port}`));
  console.log("\n====================================================");
  console.log("✅ You can now run:");
  console.log("   👉 npm run dev");
  console.log("====================================================\n");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  console.error("\nStack trace:", err.stack);
  process.exit(1);
});
