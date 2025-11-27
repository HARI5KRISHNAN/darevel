#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Setting up Darevel development environment...\n');

// Check if Docker is installed
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker is installed');
} catch (error) {
  console.error('❌ Docker is not installed. Please install Docker first.');
  process.exit(1);
}

// Check if Docker is running
try {
  execSync('docker ps', { stdio: 'ignore' });
  console.log('✅ Docker is running');
} catch (error) {
  console.error('❌ Docker is not running. Please start Docker first.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
const install = spawn('npm', ['install'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

install.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ npm install failed with code ${code}`);
    process.exit(code);
  }

  console.log('\n✅ Dependencies installed successfully');
  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   npm run dev     - Start development environment');
  console.log('   npm run build   - Build all applications');
  console.log('   npm run stop    - Stop Docker services');
  console.log('   npm run clean   - Remove all Docker volumes');
});

install.on('error', (err) => {
  console.error('❌ Failed to install dependencies:', err.message);
  process.exit(1);
});
