#!/bin/sh
# Setup script for git hooks
# Run this after cloning the repository to enable git hooks

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${YELLOW}Setting up git hooks...${NC}"
git config core.hooksPath scripts/githooks
echo "${GREEN}✓ Git hooks configured to use scripts/githooks${NC}"
echo ""
echo "Git hooks enabled. The following checks will run:"
echo ""
echo "📝 Pre-commit (before each commit):"
echo "  - TypeScript type check"
echo "  - ESLint"
echo ""
echo "🚀 Pre-push (before each push):"
echo "  - TypeScript type check"
echo "  - ESLint"
echo "  - Build"
echo "  - Unit tests"
echo "  - E2E tests"
echo ""
echo "To skip checks temporarily:"
echo "  git commit --no-verify  # skip pre-commit"
echo "  git push --no-verify    # skip pre-push"
echo "  SKIP_E2E=true git push  # skip only E2E tests"
