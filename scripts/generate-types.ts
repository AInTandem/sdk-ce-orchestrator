/**
 * Generate TypeScript types from OpenAPI specification using openapi-typescript
 *
 * Priority order for OpenAPI spec source:
 * 1. OPENAPI_SPEC_URL environment variable (remote URL)
 * 2. Local file at orchestrator/dist/swagger.json
 *
 * Usage:
 *   # From remote API (CI/CD)
 *   OPENAPI_SPEC_URL=https://api.example.com/openapi.json pnpm generate-types
 *
 *   # From local file (development)
 *   pnpm generate-types
 */

import { execSync } from 'child_process';
import { existsSync, unlinkSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SpecSource {
  type: 'remote' | 'local';
  location: string;
}

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

/**
 * Determine the OpenAPI spec source based on environment and file system
 */
function getSpecSource(): SpecSource {
  // Priority 1: Remote URL from environment variable
  const remoteUrl = process.env.OPENAPI_SPEC_URL;
  if (remoteUrl) {
    console.log(`📡 Using remote OpenAPI spec from: ${remoteUrl}`);
    return { type: 'remote', location: remoteUrl };
  }

  // Priority 2: Local file
  console.log('📁 OPENAPI_SPEC_URL not set, looking for local spec...');

  // Possible local paths to try (in order of preference)
  const possiblePaths = [
    // Current directory: orchestrator/dist/swagger.json
    join(process.cwd(), 'dist/swagger.json'),
    // Parent directory (if we're in orchestrator/sdk/)
    join(process.cwd(), '../dist/swagger.json'),
    // If SDK is sibling to orchestrator
    join(__dirname, '../../dist/swagger.json'),
    // orchestrator-sdk structure (from orchestrator-sdk/scripts/)
    join(__dirname, '../../../orchestrator/dist/swagger.json'),
    // orchestrator-sdk structure (from orchestrator-sdk/)
    join(process.cwd(), '../orchestrator/dist/swagger.json'),
    // Alternative path from default/ directory
    join(__dirname, '../../../../default/orchestrator/dist/swagger.json'),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      console.log(`✅ Found local OpenAPI spec at: ${path}`);
      return { type: 'local', location: path };
    }
  }

  // No spec found
  console.error('❌ OpenAPI spec not found!');
  console.error('');
  console.error('Searched paths:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  console.error('');
  console.error('Please do one of the following:');
  console.error('  1. Build the API: pnpm build:api (from orchestrator directory)');
  console.error('  2. Set remote URL: OPENAPI_SPEC_URL=https://api.example.com/openapi.json pnpm generate-types');
  process.exit(1);
}

/**
 * Verify remote URL is accessible (optional check)
 */
async function verifyRemoteUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔧 Generating types from OpenAPI spec...');
  console.log('');

  // Get spec source (remote or local)
  const specSource = getSpecSource();

  // Output path for generated types
  const outputPath = join(__dirname, '../packages/core/src/types/generated');

  // Ensure output directory exists
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  // Clean up existing generated schema
  const existingSchema = join(outputPath, 'schema.ts');
  if (existsSync(existingSchema)) {
    unlinkSync(existingSchema);
  }

  // Generate metadata about the source
  const metadata = {
    generatedAt: new Date().toISOString(),
    source: specSource.type,
    location: specSource.location,
  };

  try {
    // For remote URLs, optionally verify accessibility first
    if (specSource.type === 'remote') {
      console.log(`🔍 Verifying remote URL...`);
      const isAccessible = await verifyRemoteUrl(specSource.location);
      if (!isAccessible) {
        console.warn(`⚠️  Warning: Could not verify remote URL accessibility.`);
        console.warn(`⚠️  Proceeding anyway...`);
      } else {
        console.log(`✅ Remote URL is accessible`);
      }
    }

    // Generate types using openapi-typescript
    const cmd = `npx openapi-typescript "${specSource.location}" -o "${outputPath}/schema.ts"`;

    console.log('');
    console.log(`📝 Generating types...`);
    runCommand(cmd);

    // Write metadata file
    const metadataPath = join(outputPath, 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📄 Metadata written to: ${metadataPath}`);

    console.log('');
    console.log('✅ Types generated successfully!');
    console.log(`📁 Output: ${outputPath}/schema.ts`);
    console.log('');
    console.log('Source information:');
    console.log(`  Type: ${specSource.type}`);
    console.log(`  Location: ${specSource.location}`);
  } catch (error) {
    console.error('');
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
