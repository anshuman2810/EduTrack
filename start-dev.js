KOconst { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('===============================================================');
console.log('  STARTING EDUTRACK QR - STUDENT & ACADEMIC RECORDS PORTAL');
console.log('===============================================================\n');

// 1. Start Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true,
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[36m[Backend]\x1b[0m ${line.trim()}`);
  });
});

backend.stderr.on('data', (data) => {
  console.error(`\x1b[31m[Backend Error]\x1b[0m ${data.toString().trim()}`);
});

// 2. Start Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true,
});

frontend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[32m[Frontend]\x1b[0m ${line.trim()}`);
  });
});

frontend.stderr.on('data', (data) => {
  console.error(`\x1b[31m[Frontend Error]\x1b[0m ${data.toString().trim()}`);
});

const cleanup = () => {
  console.log('\nShutting down services...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
