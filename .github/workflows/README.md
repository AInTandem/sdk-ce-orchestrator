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

### Type Sync Check (`type-sync-check.yml`)

**Triggers**: Push to main/develop, Pull Requests, Manual

**Purpose**: Ensures SDK types are synchronized with Orchestrator's OpenAPI specification.

**Process**:
1. Checks out the SDK code
2. Checks out the Orchestrator repository
3. Builds Orchestrator API and generates OpenAPI spec
4. Generates SDK types from the local spec
5. Checks for differences in generated types
6. Fails if types are out of sync

**Usage**:
- Automatically runs on every push/PR
- Can be triggered manually from GitHub Actions tab
- Must pass before merging PRs

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
    repository: aintandem/orchestrator
    path: orchestrator
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
    repository: aintandem/sdk
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
