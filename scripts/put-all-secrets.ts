import { spawnSync } from 'child_process';

const secrets = [
  'FACEBOOK_APP_SECRET',
  'AUTH_COOKIE_SECRET',
  // Add other secrets here in future
];

for (const secret of secrets) {
  console.log(`\n--- Uploading ${secret} ---`);
  const result = spawnSync('bun', ['scripts/put-secret.ts', secret], {
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`Failed to upload ${secret}`);
    process.exit(result.status || 1);
  }
}

console.log('\nAll secrets processed successfully.');
