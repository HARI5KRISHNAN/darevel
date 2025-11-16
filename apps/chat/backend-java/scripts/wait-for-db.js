#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('⏳ Waiting for PostgreSQL to be ready...');

const maxRetries = 30;
let retries = 0;

function checkDatabase() {
  try {
    execSync('docker exec darevel-postgres pg_isready -U darevel_chat', {
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function waitForDatabase() {
  while (retries < maxRetries) {
    if (checkDatabase()) {
      console.log('✅ PostgreSQL is ready!');
      return true;
    }

    retries++;
    process.stdout.write(`\r⏳ Waiting for PostgreSQL... (${retries}/${maxRetries})`);
    await wait();
  }

  console.error('\n❌ PostgreSQL failed to start within the timeout period');
  process.exit(1);
}

waitForDatabase().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
