#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting Darevel development environment...\n');

// Start Docker services
console.log('📦 Starting Docker services (PostgreSQL, Redis, Keycloak)...');
const dockerCompose = spawn('docker', ['compose', 'up', '-d'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

dockerCompose.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Docker compose exited with code ${code}`);
    process.exit(code);
  }

  console.log('\n✅ Docker services started successfully');
  console.log('⏳ Waiting 10 seconds for services to be ready...\n');

  // Wait for services to be ready
  setTimeout(() => {
    console.log('🎯 Starting application workspaces...\n');

    // Start all apps using turbo
    const turbo = spawn('npm', ['run', 'dev:apps'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });

    turbo.on('close', (code) => {
      console.log(`\n👋 Development environment stopped with code ${code}`);
      process.exit(code);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down...');
      turbo.kill('SIGINT');
      setTimeout(() => process.exit(0), 1000);
    });
  }, 10000);
});

dockerCompose.on('error', (err) => {
  console.error('❌ Failed to start Docker compose:', err.message);
  process.exit(1);
});
