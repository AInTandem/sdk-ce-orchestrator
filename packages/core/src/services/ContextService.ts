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
} from '../types/generated/index.js';
import { HttpClient } from '../client/HttpClient.js';

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
    return this.httpClient.post<Memory>('/api/context/memories', request);
  }

  /**
   * Get a specific memory
   *
   * @param memoryId - Memory ID
   * @returns Memory details
   */
  async getMemory(memoryId: string): Promise<Memory> {
    return this.httpClient.get<Memory>(`/api/context/memories/${memoryId}`);
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
    return this.httpClient.patch<Memory>(
      `/api/context/memories/${memoryId}`,
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
    return this.httpClient.put<Memory>('/api/context/memories/upsert', request);
  }

  /**
   * Delete a memory
   *
   * @param memoryId - Memory ID
   */
  async deleteMemory(memoryId: string): Promise<void> {
    return this.httpClient.delete<void>(`/api/context/memories/${memoryId}`);
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
    const params = new URLSearchParams();
    if (request.query) params.append('query', request.query);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        params.append(`filter[${key}]`, String(value));
      });
    }

    const queryString = params.toString();
    return this.httpClient.get<MemorySearchResult>(
      `/api/context/memories/search${queryString ? `?${queryString}` : ''}`
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
      `/api/projects/${projectId}/memories${queryString ? `?${queryString}` : ''}`
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
    params.append('query', request.query);
    if (request.limit) params.append('limit', request.limit.toString());

    const queryString = params.toString();
    return this.httpClient.get<GetRelevantContextResponse>(
      `/api/context/relevant${queryString ? `?${queryString}` : ''}`
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
      `/api/projects/${projectId}/tasks/${taskId}/context`
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
    return this.httpClient.post<Memory[]>('/api/context/memories/batch', {
      memories,
    });
  }

  /**
   * Delete multiple memories in batch
   *
   * @param memoryIds - Array of memory IDs
   */
  async deleteMemoriesBatch(memoryIds: string[]): Promise<void> {
    return this.httpClient.post<void>('/api/context/memories/batch-delete', {
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
      `/api/projects/${projectId}/memories/stats`
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
