# AInTandem TypeScript SDK

[![npm version](https://badge.fury.io/js/%40aintandem%2Fsdk-core.svg)](https://www.npmjs.com/package/@aintandem/sdk-core)
[![npm version](https://badge.fury.io/js/%40aintandem%2Fsdk-react.svg)](https://www.npmjs.com/package/@aintandem/sdk-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript SDK for AInTandem CE Orchestrator API.

## Features

- 🚀 **Type-safe**: Complete TypeScript type support
- ⚡ **Lightweight**: Uses native Fetch API with no additional dependencies
- 🔄 **Real-time**: WebSocket progress tracking
- 🎣 **React Hooks**: Pre-built React integration (18+ Hooks)
- 📦 **Tree-shaking**: Import on demand, minimal bundle size
- 🎨 **UI Components**: Pre-built React components

## Packages

This monorepo contains the following packages:

- `@aintandem/sdk-core` - Core SDK (~69 KB minified)
- `@aintandem/sdk-react` - React integration (~54 KB minified)

## Quick Start

### Installation

```bash
# Core SDK
pnpm add @aintandem/sdk-core

# React integration
pnpm add @aintandem/sdk-react
```

### Basic Usage

```typescript
import { AInTandemClient } from '@aintandem/sdk-core';

const client = new AInTandemClient({
  baseURL: 'https://api.aintandem.com',
});

// Login
await client.auth.login({ username: 'user', password: 'pass' });

// Get workflows
const workflows = await client.workflows.listWorkflows();

// Execute task
const task = await client.tasks.executeTask(
  'project-123',
  {
    task: 'data-analysis',
    input: { dataset: 'sales-2024' },
  }
);

// Subscribe to real-time progress
await client.subscribeToTask(
  'project-123',
  task.taskId,
  (event) => console.log('Progress:', event),
  (event) => console.log('Completed:', event.output),
  (event) => console.error('Failed:', event.error)
);
```

### React Integration

```tsx
import { AInTandemProvider } from '@aintandem/sdk-react';
import { useWorkflows, useTaskProgress, ProgressTracker } from '@aintandem/sdk-react';

function App() {
  return (
    <AInTandemProvider config={{ baseURL: 'https://api.aintandem.com' }}>
      <Dashboard />
    </AInTandemProvider>
  );
}

function Dashboard() {
  const { workflows, loading, create } = useWorkflows('published');

  return (
    <div>
      {workflows.map(wf => (
        <WorkflowCard key={wf.id} workflow={wf} />
      ))}
      <button onClick={() => create({ name: 'New Workflow' })}>
        Create Workflow
      </button>
    </div>
  );
}

function TaskMonitor({ projectId, taskId }) {
  return (
    <ProgressTracker projectId={projectId} taskId={taskId} showEvents />
  );
}
```

## Documentation

### API Reference

- [Core SDK API](./packages/core/docs/api.md)
- [React Hooks API](./packages/react/docs/api.md)

### Guides

- [Getting Started](./docs/guides/getting-started.md)
- [Authentication](./docs/guides/authentication.md)
- [Workflow Management](./docs/guides/workflows.md)
- [Task Execution](./docs/guides/tasks.md)
- [Real-time Progress Tracking](./docs/guides/real-time-progress.md)

### Examples

- [Basic Usage](./examples/basic-usage/)
- [React Application](./examples/react-app/)
- [Progress Tracking](./examples/progress-tracking/)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Test
pnpm test

# Generate types
pnpm generate-types

# Local development
pnpm dev
```

## Contribution Guide

Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT © 2024 AInTandem
