# SDK GitHub Actions Workflows

This directory contains CI/CD workflows for the AInTandem SDK project.

## Workflows

### CI (`ci.yml`)

**Triggers**: Push to main/develop, Pull Requests

**Jobs**:
- `lint` - Runs ESLint
- `typecheck` - TypeScript type checking
- `test` - Runs unit tests with coverage
- `build` - Builds all packages

### Release & Publish (`release.yml`)

**Triggers**:
- Push to `main` branch (automatic)
- Manual workflow dispatch

**Purpose**: Build, test, and publish packages to npm registry using Changesets and OIDC (Trusted Publishing).

**How It Works**:

This workflow uses [Changesets](https://github.com/changesets/changesets) for version management:

1. When changesets exist, the workflow creates a PR "Version Packages"
2. Merging that PR updates package.json versions
3. The next push to `main` publishes packages to npm automatically
4. Git tags and GitHub Releases are created automatically

**Jobs**:
1. `version` - Creates version PR or publishes (on push to main)
2. `publish-manual` - Manual publishing trigger
3. `release-notification` - Notification after successful publish

**Published Packages**:
- `@aintandem/sdk-core`
- `@aintandem/sdk-react`

**Usage**:

```bash
# 1. After completing features, create a changeset
pnpm changeset
# Select packages and version type (major/minor/patch)

# 2. Commit the changeset file
git add .changeset/*.md
git commit -m "feat: add new feature"

# 3. Push to main branch
git push origin main

# 4. Review and merge the "Version Packages" PR
# Publishing happens automatically on merge

# Manual publishing (if needed)
gh workflow run release.yml -f publish=true
```

**OIDC/Trusted Publishing Setup**:

One-time setup required on [npmjs.com](https://www.npmjs.com):

1. Go to **Your Organization** → **Publishing**
2. Click **Add organization** → **GitHub Actions**
3. Configure:
   - **Organization name**: `aintandem`
   - **GitHub repository**: `AInTandem/sdk-ce-orchestrator`
   - **Workflow name**: `release.yml` (or `*` for all workflows)
   - **Environment name**: leave empty
4. Click **Create** and **Save**

No `NPM_TOKEN` secret needed in GitHub!

**Workspace Dependencies**:

During development, packages use `workspace:*` for local dependencies. When publishing, pnpm automatically replaces these with actual version numbers:

```json
// Development (packages/react/package.json)
{
  "dependencies": {
    "@aintandem/sdk-core": "workspace:*"  // Local link
  }
}

// Published (on npm)
{
  "dependencies": {
    "@aintandem/sdk-core": "^0.5.2"  // Actual version
  }
}
```

**Permissions**:
```yaml
permissions:
  contents: read
  id-token: write  # Required for OIDC token exchange
```

### Handle API Changes (`handle-api-changes.yml`)

**Triggers**: Push to main/develop, Pull Requests, Manual

**Purpose**: Handles automated type generation when API changes are detected.

**Process**:
1. Checks out the SDK code
2. Checks out the Orchestrator repository
3. Builds Orchestrator API and generates OpenAPI spec
4. Generates SDK types from the local spec
5. Creates PR with type changes if detected

**Usage**:
- Automatically runs on every push/PR
- Can be triggered manually from GitHub Actions tab

### Sync from Orchestrator (`sync-from-orchestrator.yml`)

**Triggers**:
- Manual trigger (with options)
- Schedule: Daily at 2 AM UTC
- Repository dispatch: When Orchestrator publishes updates

**Purpose**: Automatically sync SDK types from Orchestrator API.

**Options**:
- `source`: `local` (build from source) or `remote` (fetch from deployed API)
- `orchestrator_ref`: Branch/tag for local source (default: `main`)
- `api_url`: URL for remote source
- `environment`: `staging` or `production` (for default URLs)

**Process**:
1. Checks out the SDK code
2. For local source: Checks out Orchestrator and builds OpenAPI spec
3. For remote source: Fetches OpenAPI spec from deployed API
4. Generates SDK types
5. Creates a PR if changes are detected

**Usage**:

```bash
# Via GitHub CLI
gh workflow run sync-from-orchestrator.yml -f source=local

# Sync from staging
gh workflow run sync-from-orchestrator.yml -f source=remote -f environment=staging

# Sync from production
gh workflow run sync-from-orchestrator.yml -f source=remote -f environment=production

# From custom URL
gh workflow run sync-from-orchestrator.yml -f source=remote -f api_url=https://custom.api.com/openapi.json
```

## Integration with Orchestrator

The SDK workflows integrate with the Orchestrator project in two ways:

### 1. Local Build (Recommended for Development)

The SDK checks out the Orchestrator repository and builds the OpenAPI spec from source:

```yaml
- uses: actions/checkout@v4
  with:
    repository: aintandem/ce-orchestrator
    path: ce-orchestrator
    ref: main
```

**Advantages**:
- Always uses the latest source code
- No need for deployed API
- Faster than network requests

### 2. Remote Fetch (For Production Sync)

The SDK fetches the OpenAPI spec from a deployed API:

```yaml
env:
  OPENAPI_SPEC_URL: https://api.aintandem.com/openapi.json
```

**Advantages**:
- Syncs with deployed API versions
- Supports staging/production environments
- Can detect API changes before SDK update

## Repository Dispatch Integration

Orchestrator can trigger SDK type sync by sending a repository dispatch event:

```yaml
# In Orchestrator's .github/workflows/notify-sdk.yml
- name: Trigger SDK sync
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.SDK_REPO_TOKEN }}
    repository: aintandem/sdk-ce-orchestrator
    event-type: orchestrator-updated
    client-payload: |
      {
        "version": "${{ github.event.release.tag_name }}",
        "openapi_url": "https://api.aintandem.com/openapi.json"
      }
```

## Type Generation Scripts

The SDK uses the following scripts for type generation:

```bash
# Generate from local spec (path or default)
pnpm generate-types

# Generate from remote URL
OPENAPI_SPEC_URL=https://... pnpm generate-types
```

See `scripts/generate-types.ts` for implementation details.

## Worklogs

Documentation of type sync implementation can be found in `worklogs/`:
- `sdk-type-generation-fix-2025-12-29.md` - Type generation fix
- `sdk-cicd-type-sync-2025-12-29.md` - CI/CD setup
