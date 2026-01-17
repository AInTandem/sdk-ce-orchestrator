/**
 * Context Service
 *
 * Manages memory/context operations.
 */

import type {
  CreateMemoryRequest,
  UpdateMemoryRequest,
  UpsertMemoryRequest,
  SearchMemoriesRequest,
  GetRelevantContextRequest,
  GetRelevantContextResponse,
} from '../types/index';
import { HttpClient } from '../client/HttpClient';

/**
 * Context Service
 *
 * Provides methods for managing memories and context.
 *
 * @example
 * ```typescript
 * const contextService = new ContextService(httpClient);
 *
 * // Create a memory
 * const memory = await contextService.createMemory({
 *   projectId: 'project-123',
 *   content: 'Important information',
 *   metadata: { type: 'note' },
 * });
 *
 * // Search memories
 * const results = await contextService.searchMemories({
 *   query: 'search term',
 *   limit: 10,
 * });
 *
 * // Get relevant context
 * const context = await contextService.getRelevantContext({
 *   query: 'What is the context?',
 *   limit: 5,
 * });
 * ```
 */
export class ContextService {
  constructor(private readonly httpClient: HttpClient) {}

  // ========================================================================
  // Memory CRUD
  // ========================================================================

  /**
   * Create a new memory
   *
   * @param request - Memory creation request
   * @returns Created memory
   */
  async createMemory(request: CreateMemoryRequest): Promise<Memory> {
    return this.httpClient.post<Memory>('/context/memories', request);
  }

  /**
   * Get a specific memory
   *
   * @param memoryId - Memory ID
   * @returns Memory details
   */
  async getMemory(memoryId: string): Promise<Memory> {
    return this.httpClient.get<Memory>(`/context/memories/${memoryId}`);
  }

  /**
   * Update an existing memory
   *
   * @param memoryId - Memory ID
   * @param request - Update request
   * @returns Updated memory
   */
  async updateMemory(
    memoryId: string,
    request: UpdateMemoryRequest
  ): Promise<Memory> {
    return this.httpClient.put<Memory>(
      `/context/memories/${memoryId}`,
      request
    );
  }

  /**
   * Upsert a memory (create or update)
   *
   * @param request - Upsert request
   * @returns Created or updated memory
   */
  async upsertMemory(request: UpsertMemoryRequest): Promise<Memory> {
    return this.httpClient.put<Memory>('/context/memories/upsert', request);
  }

  /**
   * Delete a memory
   *
   * @param memoryId - Memory ID
   */
  async deleteMemory(memoryId: string): Promise<void> {
    return this.httpClient.delete<void>(`/context/memories/${memoryId}`);
  }

  // ========================================================================
  // Memory Search
  // ========================================================================

  /**
   * Search memories by query
   *
   * @param request - Search request
   * @returns Search results
   */
  async searchMemories(request: SearchMemoriesRequest): Promise<MemorySearchResult> {
    return this.httpClient.post<MemorySearchResult>(
      '/context/search',
      request
    );
  }

  /**
   * Get memories for a project
   *
   * @param projectId - Project ID
   * @param options - List options
   * @returns Array of memories
   */
  async listMemories(
    projectId: string,
    options?: MemoryListOptions
  ): Promise<Memory[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.sort) params.append('sort', options.sort);

    const queryString = params.toString();
    return this.httpClient.get<Memory[]>(
      `/projects/${projectId}/memories${queryString ? `?${queryString}` : ''}`
    );
  }

  // ========================================================================
  // Context Retrieval
  // ========================================================================

  /**
   * Get relevant context for a query
   *
   * @param request - Context request
   * @returns Relevant context
   */
  async getRelevantContext(
    request: GetRelevantContextRequest
  ): Promise<GetRelevantContextResponse> {
    const params = new URLSearchParams();
    params.append('prompt', request.prompt);
    if (request.maxMemories !== undefined) params.append('maxMemories', request.maxMemories.toString());
    if (request.types) {
      request.types.forEach((type: string) => params.append('types', type));
    }
    if (request.includeWorkspace !== undefined) params.append('includeWorkspace', String(request.includeWorkspace));
    if (request.includeOrg !== undefined) params.append('includeOrg', String(request.includeOrg));

    const queryString = params.toString();
    return this.httpClient.get<GetRelevantContextResponse>(
      `/context/relevant${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get context for a task
   *
   * @param projectId - Project ID
   * @param taskId - Task ID
   * @returns Task context
   */
  async getTaskContext(projectId: string, taskId: string): Promise<TaskContext> {
    return this.httpClient.get<TaskContext>(
      `/projects/${projectId}/tasks/${taskId}/context`
    );
  }

  // ========================================================================
  // Batch Operations
  // ========================================================================

  /**
   * Create multiple memories in batch
   *
   * @param memories - Array of memory creation requests
   * @returns Created memories
   */
  async createMemoriesBatch(
    memories: CreateMemoryRequest[]
  ): Promise<Memory[]> {
    return this.httpClient.post<Memory[]>('/context/memories/batch', {
      memories,
    });
  }

  /**
   * Delete multiple memories in batch
   *
   * @param memoryIds - Array of memory IDs
   */
  async deleteMemoriesBatch(memoryIds: string[]): Promise<void> {
    return this.httpClient.post<void>('/context/memories/batch-delete', {
      memoryIds,
    });
  }

  // ========================================================================
  // Memory Stats
  // ========================================================================

  /**
   * Get memory statistics for a project
   *
   * @param projectId - Project ID
   * @returns Memory statistics
   */
  async getMemoryStats(projectId: string): Promise<MemoryStats> {
    return this.httpClient.get<MemoryStats>(
      `/projects/${projectId}/memories/stats`
    );
  }

  // ========================================================================
  // Scope-based Memory Operations
  // ========================================================================

  /**
   * Get memories for a specific scope with optional hierarchical inheritance
   *
   * @param scope - Scope (e.g., 'organization', 'workspace', 'project')
   * @param scopeId - Scope ID
   * @param options - Optional filters
   * @returns Array of memories
   */
  async getScopeMemories(
    scope: string,
    scopeId: string,
    options?: {
      memory_type?: string;
      tags?: string[];
      limit?: number;
      include_inherited?: boolean;
    }
  ): Promise<Memory[]> {
    const params = new URLSearchParams();
    if (options?.memory_type) params.append('memory_type', options.memory_type);
    if (options?.tags) {
      options.tags.forEach(tag => params.append('tags', tag));
    }
    if (options?.limit !== undefined) params.append('limit', options.limit.toString());
    if (options?.include_inherited !== undefined) params.append('include_inherited', String(options.include_inherited));

    const queryString = params.toString();
    return this.httpClient.get<Memory[]>(
      `/context/${scope}/${scopeId}/memories${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get similar memories based on a memory's content
   *
   * @param memoryId - Memory ID
   * @param limit - Maximum number of similar memories to return (default: 10)
   * @returns Array of similar memories
   */
  async getSimilarMemories(memoryId: string, limit = 10): Promise<Memory[]> {
    return this.httpClient.get<Memory[]>(
      `/context/memories/${memoryId}/similar?limit=${limit}`
    );
  }

  // ========================================================================
  // Statistics & Health
  // ========================================================================

  /**
   * Get overall memory statistics
   *
   * @returns Memory statistics
   */
  async getStats(): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>('/context/stats');
  }

  /**
   * Get memory statistics for a specific scope
   *
   * @param scope - Scope (e.g., 'organization', 'workspace', 'project')
   * @param scopeId - Scope ID
   * @returns Memory statistics
   */
  async getScopeStats(scope: string, scopeId: string): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>(
      `/context/stats/${scope}/${scopeId}`
    );
  }

  /**
   * Health check for the context system
   *
   * @returns Health status
   */
  async healthCheck(): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>('/context/health');
  }

  /**
   * Get context system information
   *
   * @returns Context system info
   */
  async getContextInfo(): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>('/context/info');
  }

  // ========================================================================
  // Document Import
  // ========================================================================

  /**
   * Import a document file to the context system
   *
   * @param request - Import request with file path
   * @returns Import result
   */
  async importDocument(request: {
    file_path: string;
    scope: string;
    scope_id: string;
    memory_type?: string;
    visibility?: string;
    tags?: string[];
    chunk_content?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/import/document',
      request
    );
  }

  /**
   * Import document content directly (no filesystem access needed)
   *
   * @param request - Import request with content
   * @returns Import result
   */
  async importDocumentContent(request: {
    content: string;
    file_path: string;
    scope: string;
    scope_id: string;
    memory_type?: string;
    visibility?: string;
    tags?: string[];
    chunk_content?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/import/document/content',
      request
    );
  }

  /**
   * Import all documents from a folder
   *
   * @param request - Import folder request
   * @returns Import result
   */
  async importFolder(request: {
    folder_path: string;
    scope: string;
    scope_id: string;
    recursive?: boolean;
    file_extensions?: string[];
    tags?: string[];
  }): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/import/folder',
      request
    );
  }

  // ========================================================================
  // File Sync Operations
  // ========================================================================

  /**
   * Sync a single file (re-import if changed)
   *
   * @param request - Sync file request
   * @returns Sync result
   */
  async syncFile(request: {
    file_path: string;
    scope: string;
    scope_id: string;
    tags?: string[];
  }): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/sync/file',
      request
    );
  }

  /**
   * Sync all files in a folder
   *
   * @param request - Sync folder request
   * @returns Sync result
   */
  async syncFolder(request: {
    folder_path: string;
    scope: string;
    scope_id: string;
    recursive?: boolean;
    file_extensions?: string[];
  }): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/sync/folder',
      request
    );
  }

  /**
   * Get file sync statistics
   *
   * @param scope - Scope (e.g., 'organization', 'workspace', 'project')
   * @param scopeId - Scope ID
   * @returns Sync statistics
   */
  async getSyncStats(scope: string, scopeId: string): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>(
      `/context/sync/stats?scope=${scope}&scope_id=${scopeId}`
    );
  }

  /**
   * Get list of tracked files
   *
   * @param scope - Scope (e.g., 'organization', 'workspace', 'project')
   * @param scopeId - Scope ID
   * @returns List of tracked files
   */
  async getTrackedFiles(scope: string, scopeId: string): Promise<Record<string, unknown>> {
    return this.httpClient.get<Record<string, unknown>>(
      `/context/sync/files?scope=${scope}&scope_id=${scopeId}`
    );
  }

  // ========================================================================
  // Task Dialog Capture
  // ========================================================================

  /**
   * Auto-capture task dialog to context
   *
   * @param taskId - Task ID
   * @param request - Dialog capture request
   * @returns Capture result
   */
  async captureTaskDialog(
    taskId: string,
    request: {
      projectId: string;
      content: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      `/context/capture/task/${taskId}`,
      request
    );
  }

  /**
   * Trigger full hierarchy resync to context-manager
   *
   * @returns Resync result
   */
  async syncHierarchy(): Promise<Record<string, unknown>> {
    return this.httpClient.post<Record<string, unknown>>(
      '/context/sync/hierarchy',
      {}
    );
  }
}

// ============================================================================
// Additional Types
// ============================================================================

export interface Memory {
  id: string;
  projectId: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MemorySearchResult {
  memories: Array<
    Memory & {
      similarity?: number;
      score?: number;
    }
  >;
  total: number;
  query: string;
}

export interface MemoryListOptions {
  limit?: number;
  offset?: number;
  sort?: 'createdAt' | 'updatedAt' | '-createdAt' | '-updatedAt';
}

export interface TaskContext {
  taskId: string;
  context?: {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }[];
  total?: number;
}

export interface MemoryStats {
  totalMemories: number;
  totalSize: number;
  averageSize: number;
  lastUpdated: string;
}
