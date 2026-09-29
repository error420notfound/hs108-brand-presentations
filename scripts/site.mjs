import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const action = process.argv[2] || 'build';
const selection = process.argv[3] || 'web15';
const editions = selection === 'all' ? ['web15', 'client20', 'client30'] : [selection];

if (!['build', 'dev', 'preview'].includes(action) || editions.some((id) => !['web15', 'client20', 'client30'].includes(id))) {
  console.error('Usage: node scripts/site.mjs <build|dev|preview> <web15|client20|client30|all>');
  process.exit(1);
}

function run(args, edition) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { ...process.env, PRESENTATION_EDITION: edition },
      stdio: 'inherit'
    });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolveRun() : reject(new Error(`${args.join(' ')} exited ${code}`)));
  });
}

try {
  for (const edition of editions) {
    if (action !== 'preview') {
      await run(['--import', 'tsx', 'scripts/validate.ts'], edition);
      await run(['--import', 'tsx', 'scripts/prepare-assets.ts', edition], edition);
    }
    await run([resolve('node_modules/astro/bin/astro.mjs'), action], edition);
    if (action === 'build') {
      await run(['--import', 'tsx', 'scripts/validate.ts', '--output', edition], edition);
    }
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
