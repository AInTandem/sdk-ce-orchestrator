# Git Hooks

This directory contains Git hooks for maintaining code quality and preventing broken builds.

## Available Hooks

### `pre-commit`
Runs before each commit to ensure code quality:

- **TypeScript Type Check** - Validates TypeScript types
- **ESLint** - Checks code style

If any check fails, the commit will be aborted.

### `pre-push`
Runs before each push to ensure code quality and passing tests:

- **TypeScript Type Check** - Validates TypeScript types
- **ESLint** - Checks code style
- **Build** - Verifies that all packages build successfully
- **Unit Tests** - Runs all unit tests
- **E2E Tests** - Runs end-to-end tests (can be skipped with `SKIP_E2E=true`)

If any check fails, the push will be aborted.

## Installation

Run the following command to install the hooks:

```bash
pnpm hooks:install
```

This configures `core.hooksPath` to point to `scripts/githooks/`.

## Skipping Hooks

### Bypass pre-commit
```bash
git commit --no-verify -m "message"
```

### Bypass pre-push E2E tests (only)
```bash
SKIP_E2E=true git push
```

### Bypass pre-push entirely
```bash
git push --no-verify
```

## Manual Execution

You can manually run the checks:

```bash
# Pre-commit checks
pnpm typecheck
pnpm lint

# Pre-push checks
pnpm build
pnpm test:unit
pnpm test:e2e
```

## Troubleshooting

If hooks are not executing:

1. Verify hooks path is configured:
   ```bash
   git config core.hooksPath
   # Should output: scripts/githooks
   ```

2. Reinstall hooks:
   ```bash
   pnpm hooks:install
   ```

3. Check file permissions:
   ```bash
   ls -l scripts/githooks/pre-commit
   ls -l scripts/githooks/pre-push
   ```

## How it Works

This setup uses `git config core.hooksPath` to tell Git to look for hooks in the `scripts/githooks/` directory instead of `.git/hooks/`. This means:

- The hook files are version-controlled
- All team members use the same hooks
- Simply run `pnpm hooks:install` after cloning the repository
