/**
 * Workspace Service
 *
 * Manages organizations, workspaces, and projects.
 */

import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  MoveProjectRequest,
} from '../types/index';
import { HttpClient } from '../client/HttpClient';

/**
 * Workspace Service
 *
 * Provides methods for managing the hierarchical structure:
 * Organization → Workspace → Project
 *
 * @example
 * ```typescript
 * const workspaceService = new WorkspaceService(httpClient);
 *
 * // List organizations
 * const orgs = await workspaceService.listOrganizations();
 *
 * // Create a workspace
 * const workspace = await workspaceService.createWorkspace('org-123', {
 *   name: 'My Workspace',
 * });
 *
 * // Create a project
 * const project = await workspaceService.createProject('workspace-456', {
 *   name: 'My Project',
 * });
 * ```
 */
export class WorkspaceService {
  constructor(private readonly httpClient: HttpClient) {}

  // ========================================================================
  // Organizations
  // ========================================================================

  /**
   * List all organizations
   *
   * @returns Array of organizations
   */
  async listOrganizations(): Promise<Organization[]> {
    return this.httpClient.get<Organization[]>('/organizations');
  }

  /**
   * Get a specific organization
   *
   * @param organizationId - Organization ID
   * @returns Organization details
   */
  async getOrganization(organizationId: string): Promise<Organization> {
    return this.httpClient.get<Organization>(
      `/organizations/${organizationId}`
    );
  }

  /**
   * Create a new organization
   *
   * @param request - Organization creation request
   * @returns Created organization
   */
  async createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
    return this.httpClient.post<Organization>('/organizations', request);
  }

  /**
   * Update an organization
   *
   * @param organizationId - Organization ID
   * @param request - Update request
   * @returns Updated organization
   */
  async updateOrganization(
    organizationId: string,
    request: UpdateOrganizationRequest
  ): Promise<Organization> {
    return this.httpClient.put<Organization>(
      `/organizations/${organizationId}`,
      request
    );
  }

  /**
   * Delete an organization
   *
   * @param organizationId - Organization ID
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    return this.httpClient.delete<void>(`/organizations/${organizationId}`);
  }

  // ========================================================================
  // Workspaces
  // ========================================================================

  /**
   * List all workspaces in an organization
   *
   * @param organizationId - Organization ID
   * @returns Array of workspaces
   */
  async listWorkspaces(organizationId: string): Promise<Workspace[]> {
    return this.httpClient.get<Workspace[]>(
      `/organizations/${organizationId}/workspaces`
    );
  }

  /**
   * Get a specific workspace
   *
   * @param workspaceId - Workspace ID
   * @returns Workspace details
   */
  async getWorkspace(workspaceId: string): Promise<Workspace> {
    return this.httpClient.get<Workspace>(`/workspaces/${workspaceId}`);
  }

  /**
   * Create a new workspace
   *
   * @param organizationId - Organization ID
   * @param request - Workspace creation request
   * @returns Created workspace
   */
  async createWorkspace(
    organizationId: string,
    request: CreateWorkspaceRequest
  ): Promise<Workspace> {
    return this.httpClient.post<Workspace>(
      `/organizations/${organizationId}/workspaces`,
      request
    );
  }

  /**
   * Update a workspace
   *
   * @param workspaceId - Workspace ID
   * @param request - Update request
   * @returns Updated workspace
   */
  async updateWorkspace(
    workspaceId: string,
    request: UpdateWorkspaceRequest
  ): Promise<Workspace> {
    return this.httpClient.put<Workspace>(
      `/workspaces/${workspaceId}`,
      request
    );
  }

  /**
   * Delete a workspace
   *
   * @param workspaceId - Workspace ID
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    return this.httpClient.delete<void>(`/workspaces/${workspaceId}`);
  }

  // ========================================================================
  // Projects
  // ========================================================================

  /**
   * List all projects in a workspace
   *
   * @param workspaceId - Workspace ID
   * @returns Array of projects
   */
  async listProjects(workspaceId: string): Promise<Project[]> {
    return this.httpClient.get<Project[]>(`/workspaces/${workspaceId}/projects`);
  }

  /**
   * Get a specific project
   *
   * @param projectId - Project ID
   * @returns Project details
   */
  async getProject(projectId: string): Promise<Project> {
    return this.httpClient.get<Project>(`/projects/${projectId}`);
  }

  /**
   * Create a new project
   *
   * @param workspaceId - Workspace ID
   * @param request - Project creation request
   * @returns Created project
   */
  async createProject(
    workspaceId: string,
    request: CreateProjectRequest
  ): Promise<Project> {
    return this.httpClient.post<Project>(
      `/workspaces/${workspaceId}/projects`,
      request
    );
  }

  /**
   * Update a project
   *
   * @param projectId - Project ID
   * @param request - Update request
   * @returns Updated project
   */
  async updateProject(
    projectId: string,
    request: UpdateProjectRequest
  ): Promise<Project> {
    return this.httpClient.put<Project>(`/projects/${projectId}`, request);
  }

  /**
   * Delete a project
   *
   * @param projectId - Project ID
   * @param deleteFolder - Whether to delete the project folder (default: false)
   */
  async deleteProject(projectId: string, deleteFolder?: boolean): Promise<void> {
    const url = deleteFolder !== undefined
      ? `/projects/${projectId}?deleteFolder=${String(deleteFolder)}`
      : `/projects/${projectId}`;
    return this.httpClient.delete<void>(url);
  }

  /**
   * Move a project to another workspace
   *
   * @param projectId - Project ID
   * @param request - Move request
   * @returns Updated project
   */
  async moveProject(
    projectId: string,
    request: MoveProjectRequest
  ): Promise<Project> {
    return this.httpClient.post<Project>(
      `/projects/${projectId}/move`,
      request
    );
  }

  // ========================================================================
  // Hierarchy Traversal
  // ========================================================================

  /**
   * Get full hierarchy for an organization
   *
   * @param organizationId - Organization ID
   * @returns Complete hierarchy with workspaces and projects
   */
  async getHierarchy(organizationId: string): Promise<OrganizationHierarchy> {
    return this.httpClient.get<OrganizationHierarchy>(
      `/organizations/${organizationId}/hierarchy`
    );
  }

  /**
   * Get project path (org → workspace → project)
   *
   * @param projectId - Project ID
   * @returns Project path
   */
  async getProjectPath(projectId: string): Promise<ProjectPath> {
    return this.httpClient.get<ProjectPath>(`/projects/${projectId}/path`);
  }
}

// ============================================================================
// Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export interface OrganizationHierarchy {
  organization: Organization;
  workspaces: Array<{
    workspace: Workspace;
    projects: Project[];
  }>;
}

export interface ProjectPath {
  organization: Organization;
  workspace: Workspace;
  project: Project;
}
