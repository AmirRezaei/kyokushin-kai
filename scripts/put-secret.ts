import { join } from 'path';
import { readFileSync } from 'fs';
import { spawn } from 'child_process';

const secretName = process.argv[2];

if (!secretName) {
  console.error('Usage: bun scripts/put-secret.ts <SECRET_NAME>');
  process.exit(1);
}

// 1. Read .dev.vars (or .env)
const envPath = join(process.cwd(), '.dev.vars');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch {
  console.error('Could not read .dev.vars. Trying .env...');
  try {
    envContent = readFileSync(join(process.cwd(), '.env'), 'utf-8');
  } catch {
    console.error('Could not read .dev.vars or .env');
    process.exit(1);
  }
}

// 2. Parse for the specific key
const lines = envContent.split('\n');
let secretValue = '';
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith(`${secretName}=`)) {
    secretValue = trimmed.substring(secretName.length + 1);
    // Remove quotes if present
    if (
      (secretValue.startsWith('"') && secretValue.endsWith('"')) ||
      (secretValue.startsWith("'") && secretValue.endsWith("'"))
    ) {
      secretValue = secretValue.slice(1, -1);
    }
    break;
  }
}

if (!secretValue) {
  console.error(`Secret ${secretName} not found in .dev.vars or .env`);
  process.exit(1);
}

console.log(`Uploading ${secretName} to Cloudflare...`);

// 3. Pipe to wrangler
const child = spawn('bun', ['x', 'wrangler', 'secret', 'put', secretName], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true,
});

child.stdin.write(secretValue);
child.stdin.end();

child.on('close', (code) => {
  if (code === 0) {
    console.log(`Successfully uploaded ${secretName}.`);
  } else {
    console.error(`Failed to upload ${secretName}. Exit code: ${code}`);
    process.exit(code || 1);
  }
});
