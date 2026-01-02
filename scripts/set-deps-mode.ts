#!/usr/bin/env tsx
/**
 * Switch between workspace and npm dependency modes
 *
 * Usage:
 *   tsx scripts/set-deps-mode.ts workspace  # Use workspace:* for development
 *   tsx scripts/set-deps-mode.ts npm        # Use version ranges for publishing
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEPENDENCY_MODES = ['workspace', 'npm'] as const
type DependencyMode = (typeof DEPENDENCY_MODES)[number]

interface PackageJson {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Map package names to their directory names
const PACKAGES_TO_UPDATE: Record<string, string> = {
  '@aintandem/sdk-react': 'react',
}

function getCoreVersion(): string {
  const corePath = resolve(__dirname, '../packages/core/package.json')
  const corePkg: PackageJson = JSON.parse(readFileSync(corePath, 'utf-8'))
  const version = corePkg.version
  // Convert version 0.5.1 to ^0.5.1
  return `^${version}`
}

function setDependencyMode(
  pkgPath: string,
  mode: DependencyMode,
  coreVersion: string
): boolean {
  const pkg: PackageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  let modified = false

  const updateDeps = (deps: Record<string, string> | undefined) => {
    if (!deps) return
    for (const [name, version] of Object.entries(deps)) {
      if (name === '@aintandem/sdk-core') {
        const targetVersion = mode === 'workspace' ? 'workspace:*' : coreVersion
        if (version !== targetVersion) {
          deps[name] = targetVersion
          modified = true
        }
      }
    }
  }

  updateDeps(pkg.dependencies)
  updateDeps(pkg.devDependencies)
  updateDeps(pkg.peerDependencies)

  if (modified) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  return modified
}

function main() {
  const args = process.argv.slice(2)
  const mode = args[0] as DependencyMode

  if (!DEPENDENCY_MODES.includes(mode)) {
    console.error(`Invalid mode: ${mode}`)
    console.error(`Usage: tsx scripts/set-deps-mode.ts [${DEPENDENCY_MODES.join('|')}]`)
    process.exit(1)
  }

  const coreVersion = getCoreVersion()
  let modifiedCount = 0

  for (const [pkgName, dirName] of Object.entries(PACKAGES_TO_UPDATE)) {
    const pkgPath = resolve(__dirname, `../packages/${dirName}/package.json`)

    try {
      const modified = setDependencyMode(pkgPath, mode, coreVersion)
      if (modified) {
        modifiedCount++
        console.log(`✓ Updated ${pkgName} to use ${mode} mode`)
      } else {
        console.log(`○ ${pkgName} already in ${mode} mode`)
      }
    } catch (error) {
      console.error(`✗ Failed to update ${pkgName}:`, error)
      process.exit(1)
    }
  }

  if (modifiedCount > 0) {
    console.log('\nRun `pnpm install` to update lockfile')
  } else {
    console.log('\nNo changes needed')
  }
}

main()
