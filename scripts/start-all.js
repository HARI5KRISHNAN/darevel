#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const isWindows = platform() === 'win32';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = '') {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(50)}`, COLORS.cyan);
  log(`  ${message}`, COLORS.bright + COLORS.cyan);
  log(`${'='.repeat(50)}`, COLORS.cyan);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, COLORS.yellow);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(cmd, args, cwd, name) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${name} exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

function startBackgroundProcess(cmd, args, cwd, name) {
  const proc = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: true,
    detached: !isWindows
  });

  proc.stdout?.on('data', data => {
    process.stdout.write(`[${name}] ${data}`);
  });

  proc.stderr?.on('data', data => {
    process.stderr.write(`[${name}] ${data}`);
  });

  proc.on('error', err => {
    log(`[${name}] Error: ${err.message}`, COLORS.red);
  });

  return proc;
}

const processes = [];

async function main() {
  logHeader('Darevel Suite - Starting All Applications');

  // Step 1: Start Infrastructure
  logStep(1, 4, 'Starting Infrastructure (Keycloak, PostgreSQL)...');
  try {
    await runCommand('docker-compose', ['up', '-d'], join(rootDir, 'infrastructure'), 'Infrastructure');
    log('  Infrastructure started!', COLORS.green);
  } catch (err) {
    log('  Warning: Infrastructure may already be running', COLORS.yellow);
  }

  // Step 2: Wait for infrastructure
  logStep(2, 4, 'Waiting for infrastructure to be ready (30 seconds)...');
  await sleep(30000);
  log('  Infrastructure ready!', COLORS.green);

  // Step 3: Start Backends
  logStep(3, 4, 'Starting Backend Services...');

  const backends = [
    { name: 'Mail', port: 8081, cwd: join(rootDir, 'apps/mail/backend/mail-service'), mvnw: './mvnw' },
    { name: 'Chat', port: 8082, cwd: join(rootDir, 'apps/chat/backend-java/chat-service'), mvnw: '../mvnw' },
    { name: 'Sheet', port: 8083, cwd: join(rootDir, 'apps/sheet/backend'), mvnw: './mvnw' },
    { name: 'Slides', port: 8084, cwd: join(rootDir, 'apps/slides/backend'), mvnw: join(rootDir, 'apps/sheet/backend/mvnw') },
    { name: 'Suite', port: 8085, cwd: join(rootDir, 'apps/suite/backend'), mvnw: join(rootDir, 'apps/sheet/backend/mvnw') }
  ];

  for (const backend of backends) {
    log(`  - Starting ${backend.name} Backend (port ${backend.port})...`);
    const mvnwCmd = isWindows ? `${backend.mvnw}.cmd` : backend.mvnw;
    const proc = startBackgroundProcess(mvnwCmd, ['spring-boot:run'], backend.cwd, `${backend.name}-BE`);
    processes.push(proc);
  }

  log('  Waiting for backends to initialize (20 seconds)...', COLORS.yellow);
  await sleep(20000);

  // Step 4: Start Frontends
  logStep(4, 4, 'Starting Frontend Applications...');

  const frontends = [
    { name: 'Slides', port: 3000, cwd: join(rootDir, 'apps/slides') },
    { name: 'Suite', port: 3002, cwd: join(rootDir, 'apps/suite') },
    { name: 'Chat', port: 3003, cwd: join(rootDir, 'apps/chat') },
    { name: 'Sheet', port: 3004, cwd: join(rootDir, 'apps/sheet') },
    { name: 'Mail', port: 3008, cwd: join(rootDir, 'apps/mail') }
  ];

  for (const frontend of frontends) {
    log(`  - Starting ${frontend.name} (port ${frontend.port})...`);
    const proc = startBackgroundProcess('npm', ['run', 'dev'], frontend.cwd, `${frontend.name}-FE`);
    processes.push(proc);
  }

  // Print summary
  logHeader('All Applications Starting!');

  log('\n  Infrastructure:', COLORS.bright);
  log('    - Keycloak:    http://localhost:8180 (admin/admin)');
  log('    - PostgreSQL:  localhost:5432');

  log('\n  Frontend Applications:', COLORS.bright);
  log('    - Slides:      http://localhost:3000');
  log('    - Suite:       http://localhost:3002');
  log('    - Chat:        http://localhost:3003');
  log('    - Sheet:       http://localhost:3004');
  log('    - Mail:        http://localhost:3008');

  log('\n  Backend Services:', COLORS.bright);
  log('    - Mail API:    http://localhost:8081');
  log('    - Chat API:    http://localhost:8082');
  log('    - Sheet API:   http://localhost:8083');
  log('    - Slides API:  http://localhost:8084');
  log('    - Suite API:   http://localhost:8085');

  log('\n  Test Users: alice/password, bob/password, admin/admin123', COLORS.green);
  log('\n  Press Ctrl+C to stop all services\n', COLORS.yellow);

  // Open browser after a delay
  setTimeout(() => {
    const openCmd = isWindows ? 'start' : (platform() === 'darwin' ? 'open' : 'xdg-open');
    exec(`${openCmd} http://localhost:3002`);
  }, 5000);
}

// Handle shutdown
process.on('SIGINT', () => {
  log('\n\nShutting down all services...', COLORS.yellow);
  processes.forEach(proc => {
    try {
      if (isWindows) {
        exec(`taskkill /pid ${proc.pid} /T /F`);
      } else {
        process.kill(-proc.pid, 'SIGTERM');
      }
    } catch (e) {
      // Process may have already exited
    }
  });

  // Stop docker
  exec('docker-compose down', { cwd: join(rootDir, 'infrastructure') }, () => {
    log('All services stopped.', COLORS.green);
    process.exit(0);
  });
});

main().catch(err => {
  log(`Error: ${err.message}`, COLORS.red);
  process.exit(1);
});
