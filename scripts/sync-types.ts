/**
 * Sync OpenAPI types from Orchestrator
 *
 * This script builds the orchestrator (if needed) and regenerates types.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function runCommand(command: string, cwd?: string) {
  console.log(`🔄 Running: ${command}`);
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    throw error;
  }
}

async function main() {
  console.log('🔄 Syncing types from Orchestrator...');

  const orchestratorPath = join(__dirname, '../../orchestrator');
  const openApiPath = join(orchestratorPath, 'dist/swagger.json');

  // Check if OpenAPI spec exists, if not, build orchestrator
  if (!existsSync(openApiPath)) {
    console.log('⚠️  OpenAPI spec not found, building orchestrator...');
    runCommand('pnpm install', orchestratorPath);
    runCommand('pnpm build:api', orchestratorPath);
  }

  // Generate types
  console.log('🔧 Generating types...');
  runCommand('pnpm generate-types', join(__dirname, '..'));

  console.log('✅ Types synced successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review the generated types in packages/core/src/types/generated/');
  console.log('  2. Commit the changes: git add . && git commit -m "chore: sync types from OpenAPI"');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
