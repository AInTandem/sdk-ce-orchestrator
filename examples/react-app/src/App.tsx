/**
 * AInTandem SDK - React Application Example
 *
 * This example demonstrates how to use the AInTandem SDK in a React application:
 * 1. AInTandemProvider setup
 * 2. Authentication with useAuth hook
 * 3. Workflow management with useWorkflows hook
 * 4. Task execution with useExecuteTask hook
 * 5. Progress tracking with useTaskProgress hook and ProgressTracker component
 */

import { useState } from 'react';
import { AInTandemProvider } from '@aintandem/sdk-react';
import { ErrorBoundary } from '@aintandem/sdk-react/components';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';

// Configuration
const CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.aintandem.com',
  projectId: import.meta.env.VITE_PROJECT_ID || 'demo-project',
};

function App() {
  return (
    <ErrorBoundary
      fallback={<div className="error-fallback">Something went wrong. Please refresh the page.</div>}
    >
      <AInTandemProvider
        config={CONFIG}
        onAuthSuccess={(user) => {
          console.log('Auth success:', user);
        }}
        onAuthError={(error) => {
          console.error('Auth error:', error);
        }}
      >
        <MainApp />
      </AInTandemProvider>
    </ErrorBoundary>
  );
}

function MainApp() {
  const { isAuthenticated, user } = useAInTandem();
  const [currentView, setCurrentView] = useState<'dashboard' | 'workflows' | 'tasks'>('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AInTandem Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <LogoutButton />
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={currentView === 'workflows' ? 'active' : ''}
          onClick={() => setCurrentView('workflows')}
        >
          Workflows
        </button>
        <button
          className={currentView === 'tasks' ? 'active' : ''}
          onClick={() => setCurrentView('tasks')}
        >
          Tasks
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'workflows' && <WorkflowList />}
        {currentView === 'tasks' && <TaskList />}
      </main>
    </div>
  );
}

export default App;
