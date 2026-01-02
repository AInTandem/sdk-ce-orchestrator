/**
 * AInTandem SDK - React Application Example
 *
 * This example demonstrates how to use the AInTandem SDK in a React application:
 * 1. AInTandemClient setup
 * 2. Authentication
 * 3. Workflow management
 * 4. Task execution
 * 5. Progress tracking
 */

import { useState } from 'react';
import { AInTandemClient } from '@aintandem/sdk-core';
import type {
  CreateWorkflowRequest,
  ExecuteAdhocTaskRequest,
  Workflow,
  TaskResponse,
} from '@aintandem/sdk-core';

// Configuration
const CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.aintandem.com',
  username: import.meta.env.VITE_API_USERNAME || 'admin',
  password: import.meta.env.VITE_API_PASSWORD || 'admin123',
  projectId: import.meta.env.VITE_PROJECT_ID || 'demo-project',
};

function App() {
  const [client] = useState(() => new AInTandemClient({ baseURL: CONFIG.baseURL }));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workflows' | 'tasks'>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.auth.login({
        username: CONFIG.username,
        password: CONFIG.password,
      });
      setIsAuthenticated(true);
      setUser(response.user || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    client.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    setWorkflows([]);
    setTasks([]);
  };

  // Load workflows
  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.workflows.listWorkflows('published');
      setWorkflows(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  // Create workflow
  const createWorkflow = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: CreateWorkflowRequest = {
        name: 'New Workflow',
        description: 'Created from React app',
        definition: {
          phases: [
            {
              id: 'phase-1',
              title: 'Phase 1',
              titleEn: 'Phase 1',
              description: 'First phase',
              color: '#3B82F6',
              steps: [
                {
                  id: 'step-1',
                  title: 'Step 1',
                  titleEn: 'Step 1',
                  description: 'First step',
                  type: 'process',
                  prompt: 'Complete this task',
                },
              ],
            },
          ],
          transitions: [],
        },
      };
      const workflow = await client.workflows.createWorkflow(request);
      setWorkflows([...workflows, workflow]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  // Execute task
  const executeTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: ExecuteAdhocTaskRequest = {
        title: 'React App Task',
        prompt: 'Complete this task from the React app',
        taskType: 'claude',
      };
      const task = await client.tasks.executeAdhocTask(CONFIG.projectId, request);
      setTasks([...tasks, task]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to execute task');
    } finally {
      setLoading(false);
    }
  };

  // Load task history
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.tasks.listTaskHistory(CONFIG.projectId, { limit: 10 });
      setTasks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">AInTandem Dashboard</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Using: {CONFIG.username}@{CONFIG.baseURL}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">AInTandem Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}!
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                currentView === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentView('workflows')}
            >
              Workflows
            </button>
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                currentView === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentView('tasks')}
            >
              Tasks
            </button>
          </div>
        </div>
      </nav>

      {/* Error display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-2">Workflows</h3>
                <p className="text-3xl font-bold text-blue-600">{workflows.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-2">Tasks</h3>
                <p className="text-3xl font-bold text-green-600">{tasks.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="flex gap-4">
                <button
                  onClick={loadWorkflows}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Load Workflows
                </button>
                <button
                  onClick={loadTasks}
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Load Tasks
                </button>
                <button
                  onClick={executeTask}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Executing...' : 'Execute Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Workflows</h2>
              <button
                onClick={createWorkflow}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Workflow'}
              </button>
            </div>

            {workflows.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No workflows loaded</p>
                <button
                  onClick={loadWorkflows}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Load Workflows
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-2">{workflow.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded ${
                        workflow.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                      <span className="text-gray-500">v{workflow.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <button
                onClick={loadTasks}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 mb-4">No tasks loaded</p>
                <button
                  onClick={executeTask}
                  className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Execute Task
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Task ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.taskId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.taskId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {task.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
