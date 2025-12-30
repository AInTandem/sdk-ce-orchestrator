/**
 * AInTandem API Client
 *
 * Main client class for interacting with the AInTandem Orchestrator API.
 *
 * @example
 * ```typescript
 * const client = new AInTandemClient({
 *   baseURL: 'https://api.aintandem.com',
 * });
 *
 * // Login
 * await client.auth.login({ username: 'user', password: 'pass' });
 *
 * // Use Workflow API
 * const workflows = await client.workflows.listWorkflows();
 *
 * // Execute a task
 * const task = await client.tasks.executeTask({
 *   projectId: 'project-123',
 *   task: 'my-task',
 * });
 *
 * // Logout
 * client.auth.logout();
 * ```
 */

import type { AInTandemClientConfig } from '../types/manual/client.types.js';
import { LocalStorageTokenStorage } from '../types/manual/client.types.js';
import { HttpClient } from './HttpClient.js';
import { AuthManager } from './AuthManager.js';
import { createAuthInterceptor } from '../interceptors/auth.interceptor.js';

// Import types
import type { LoginRequest, LoginResponse } from '../types/generated/index.js';

// Import services
import { WorkflowService } from '../services/WorkflowService.js';
import { TaskService } from '../services/TaskService.js';
import { SandboxService } from '../services/SandboxService.js';
import { ContextService } from '../services/ContextService.js';
import { SettingsService } from '../services/SettingsService.js';
import { WorkspaceService } from '../services/WorkspaceService.js';

// Import WebSocket functionality
import { ProgressClient } from '../websocket/ProgressClient.js';

/**
 * AInTandem Client
 *
 * Main entry point for all SDK operations.
 */
export class AInTandemClient {
  private readonly httpClient: HttpClient;
  private readonly authManager: AuthManager;
  private readonly config: AInTandemClientConfig;
  private progressClient: ProgressClient | null = null;

  /**
   * Auth service for authentication operations
   */
  public readonly auth: AuthService;

  /**
   * Workflow service for workflow management
   */
  public readonly workflows: WorkflowService;

  /**
   * Task service for task execution
   */
  public readonly tasks: TaskService;

  /**
   * Sandbox service for sandbox operations
   */
  public readonly sandboxes: SandboxService;

  /**
   * Context service for memory management
   */
  public readonly context: ContextService;

  /**
   * Settings service for user settings
   */
  public readonly settings: SettingsService;

  /**
   * Workspace service for organization/workspace/project management
   */
  public readonly workspaces: WorkspaceService;

  constructor(config: AInTandemClientConfig) {
    // Store config
    this.config = config;

    // Initialize token storage
    const storage = config.storage || new LocalStorageTokenStorage();

    // Initialize HTTP client (without auth)
    const baseHttpClient = new HttpClient({
      baseURL: config.baseURL,
      timeout: config.timeout,
      retryCount: config.retryCount,
      retryDelay: config.retryDelay,
      enableLogging: config.enableLogging,
      interceptors: config.interceptors,
    });

    // Initialize auth manager
    this.authManager = new AuthManager({
      storage: storage,
      httpClient: baseHttpClient,
    });

    // Create auth interceptor
    const authInterceptor = createAuthInterceptor(this.authManager);

    // Initialize HTTP client (with auth)
    this.httpClient = new HttpClient({
      baseURL: config.baseURL,
      timeout: config.timeout,
      retryCount: config.retryCount,
      retryDelay: config.retryDelay,
      enableLogging: config.enableLogging,
      interceptors: {
        request: [authInterceptor, ...(config.interceptors?.request || [])],
        response: config.interceptors?.response || [],
      },
    });

    // Initialize auth service
    this.auth = new AuthService(this.authManager, this.httpClient);

    // Initialize all services
    this.workflows = new WorkflowService(this.httpClient);
    this.tasks = new TaskService(this.httpClient);
    this.sandboxes = new SandboxService(this.httpClient);
    this.context = new ContextService(this.httpClient);
    this.settings = new SettingsService(this.httpClient);
    this.workspaces = new WorkspaceService(this.httpClient);
  }

  /**
   * Get client configuration
   */
  getConfiguration(): Readonly<AInTandemClientConfig> {
    return {
      baseURL: this.httpClient['config'].baseURL,
      timeout: this.httpClient['config'].timeout,
      retryCount: this.httpClient['config'].retryCount,
      retryDelay: this.httpClient['config'].retryDelay,
      enableLogging: this.httpClient['config'].enableLogging,
    };
  }

  /**
   * Get underlying HTTP client (for advanced usage)
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get auth manager (for advanced usage)
   */
  getAuthManager(): AuthManager {
    return this.authManager;
  }

  // ========================================================================
  // WebSocket / Progress Tracking
  // ========================================================================

  /**
   * Get progress client for real-time updates
   *
   * Creates a new ProgressClient instance on first call, then reuses it.
   *
   * @returns Progress client instance
   *
   * @example
   * ```typescript
   * const client = new AInTandemClient({ baseURL: '...' });
   * await client.auth.login({ username: 'user', password: 'pass' });
   *
   * // Get progress client
   * const progress = client.getProgress();
   *
   * // Subscribe to task progress (auto-connects with projectId)
   * await progress.subscribeToTask({
   *   projectId: 'project-123',
   *   taskId: 'task-456',
   *   onEvent: (event) => console.log('Progress:', event),
   *   onComplete: (event) => console.log('Done:', event.output),
   * });
   * ```
   */
  getProgress(): ProgressClient {
    if (!this.progressClient) {
      // Build WebSocket URL from base URL
      const wsUrl = this.buildWebSocketURL();

      this.progressClient = new ProgressClient({
        url: wsUrl,
        token: this.authManager.getToken() || undefined,
        autoConnect: false,
      });
    }

    return this.progressClient;
  }

  /**
   * Subscribe to task progress (convenience method)
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @param onEvent - Event callback
   * @param onComplete - Completion callback (optional)
   * @param onFailed - Failure callback (optional)
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = await client.subscribeToTask(
   *   'project-123',
   *   'task-456',
   *   (event) => console.log('Progress:', event),
   *   (event) => console.log('Completed:', event.output),
   *   (event) => console.log('Failed:', event.error)
   * );
   *
   * // Later: unsubscribe();
   * ```
   */
  async subscribeToTask(
    projectId: string,
    taskId: string,
    onEvent: (event: import('../websocket/events.js').TaskEvent) => void,
    onComplete?: (event: import('../websocket/events.js').TaskCompletedEvent) => void,
    onFailed?: (event: import('../websocket/events.js').TaskFailedEvent) => void
  ): Promise<() => void> {
    const progress = this.getProgress();

    const subscription = await progress.subscribeToTask({
      projectId,
      taskId,
      onEvent,
      onComplete,
      onFailed,
    });

    return subscription.unsubscribe;
  }

  /**
   * Subscribe to workflow progress (convenience method)
   *
   * @param projectId - Project ID
   * @param workflowId - Workflow ID (optional)
   * @param onEvent - Event callback
   * @param executionId - Execution ID (optional)
   * @param onComplete - Completion callback (optional)
   * @param onFailed - Failure callback (optional)
   * @returns Unsubscribe function
   */
  async subscribeToWorkflow(
    projectId: string,
    onEvent: (event: import('../websocket/events.js').WorkflowEvent) => void,
    workflowId?: string,
    executionId?: string,
    onComplete?: (event: import('../websocket/events.js').WorkflowExecutionCompletedEvent) => void,
    onFailed?: (event: import('../websocket/events.js').WorkflowExecutionFailedEvent) => void
  ): Promise<() => void> {
    const progress = this.getProgress();

    const subscription = await progress.subscribeToWorkflow({
      projectId,
      workflowId,
      executionId,
      onEvent,
      onComplete,
      onFailed,
    });

    return subscription.unsubscribe;
  }

  /**
   * Subscribe to sandbox events (convenience method)
   *
   * @param projectId - Project ID
   * @param onEvent - Event callback
   * @param sandboxId - Sandbox ID (optional)
   * @returns Unsubscribe function
   */
  async subscribeToSandbox(
    projectId: string,
    onEvent: (event: import('../websocket/events.js').SandboxEvent) => void,
    sandboxId?: string
  ): Promise<() => void> {
    const progress = this.getProgress();

    const subscription = await progress.subscribeToSandbox({
      projectId,
      sandboxId,
      onEvent,
    });

    return subscription.unsubscribe;
  }

  /**
   * Build WebSocket URL from base URL
   */
  private buildWebSocketURL(): string {
    const baseURL = this.config.baseURL;

    // Convert HTTP to WebSocket protocol
    let wsUrl = baseURL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

    // Remove trailing slash and add /api/progress/subscribe path
    // The actual projectId will be added when subscribing
    wsUrl = wsUrl.replace(/\/$/, '') + '/api/progress/subscribe';

    return wsUrl;
  }
}

/**
 * Auth Service
 *
 * Provides methods for authentication operations.
 */
export class AuthService {
  constructor(
    private readonly authManager: AuthManager,
    _httpClient: HttpClient
  ) {}

  /**
   * Login with credentials
   *
   * @param credentials - Login credentials
   * @returns Login response with user info and token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.authManager.login(credentials);
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.authManager.logout();
  }

  /**
   * Refresh access token
   *
   * @returns Refresh response with new token
   */
  async refresh(): Promise<{ token: string }> {
    const response = await this.authManager.refresh();
    return { token: response.token };
  }

  /**
   * Verify current token
   *
   * @returns True if token is valid
   */
  async verify(): Promise<boolean> {
    return this.authManager.verify();
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Get current access token
   *
   * @returns Current access token or null
   */
  getToken(): string | null {
    return this.authManager.getToken();
  }
}
