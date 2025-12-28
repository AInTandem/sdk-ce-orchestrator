/**
 * Generate TypeScript types from OpenAPI specification
 */

import { generate } from 'openapi-typescript-codegen';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔧 Generating types from OpenAPI spec...');

  // Path to Orchestrator's OpenAPI spec
  const orchestratorPath = join(__dirname, '../../orchestrator');
  const openApiPath = join(orchestratorPath, 'dist/swagger.json');

  // Output path for generated types
  const outputPath = join(__dirname, '../packages/core/src/types/generated');

  // Check if OpenAPI spec exists
  if (!existsSync(openApiPath)) {
    console.error(`❌ OpenAPI spec not found at: ${openApiPath}`);
    console.error('Please run "pnpm build:api" in the orchestrator directory first.');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  try {
    // Generate types from OpenAPI spec
    await generate({
      input: openApiPath,
      output: outputPath,
      httpClient: 'fetch',
      useOptions: true,
      exportServices: true, // Enable services generation
      exportSchemas: true,
      indent: 2,
    });

    console.log('✅ Types generated successfully!');
    console.log(`📁 Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

main();
