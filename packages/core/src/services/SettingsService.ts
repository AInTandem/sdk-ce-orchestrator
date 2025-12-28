/**
 * Settings Service
 *
 * Manages user settings.
 */

import type { UpdateSettingsRequest } from '../types/generated/index.js';
import { HttpClient } from '../client/HttpClient.js';

/**
 * Settings Service
 *
 * Provides methods for managing user settings.
 *
 * @example
 * ```typescript
 * const settingsService = new SettingsService(httpClient);
 *
 * // Get user settings
 * const settings = await settingsService.getSettings();
 *
 * // Update user settings
 * await settingsService.updateSettings({
 *   theme: 'dark',
 *   language: 'zh-TW',
 * });
 *
 * // Reset settings to defaults
 * await settingsService.resetSettings();
 * ```
 */
export class SettingsService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get user settings
   *
   * @returns User settings
   */
  async getSettings(): Promise<UserSettings> {
    return this.httpClient.get<UserSettings>('/api/settings');
  }

  /**
   * Update user settings
   *
   * @param request - Settings update request
   * @returns Updated settings
   */
  async updateSettings(request: UpdateSettingsRequest): Promise<UserSettings> {
    return this.httpClient.patch<UserSettings>('/api/settings', request);
  }

  /**
   * Reset settings to defaults
   *
   * @returns Default settings
   */
  async resetSettings(): Promise<UserSettings> {
    return this.httpClient.post<UserSettings>('/api/settings/reset', {});
  }

  /**
   * Get a specific setting value
   *
   * @param key - Setting key
   * @returns Setting value
   */
  async getSetting<T = unknown>(key: string): Promise<T> {
    const settings = await this.getSettings();
    return settings[key] as T;
  }

  /**
   * Update a specific setting value
   *
   * @param key - Setting key
   * @param value - Setting value
   * @returns Updated settings
   */
  async setSetting<T = unknown>(key: string, value: T): Promise<UserSettings> {
    return this.updateSettings({ [key]: value });
  }

  /**
   * Delete a specific setting
   *
   * @param key - Setting key
   * @returns Updated settings
   */
  async deleteSetting(key: string): Promise<UserSettings> {
    return this.httpClient.delete<UserSettings>(`/api/settings/${key}`);
  }
}

// ============================================================================
// Types
// ============================================================================

export interface UserSettings extends Record<string, unknown> {
  // Theme
  theme?: 'light' | 'dark' | 'auto';

  // Language
  language?: string;

  // Timezone
  timezone?: string;

  // Notifications
  notifications?: {
    enabled?: boolean;
    email?: boolean;
    push?: boolean;
    tasks?: boolean;
    workflows?: boolean;
  };

  // Editor
  editor?: {
    fontSize?: number;
    tabSize?: number;
    theme?: string;
    wordWrap?: boolean;
    minimap?: boolean;
  };

  // UI
  ui?: {
    sidebarCollapsed?: boolean;
    density?: 'comfortable' | 'compact' | 'spacious';
  };

  // API
  api?: {
    timeout?: number;
    retryCount?: number;
  };

  // Advanced
  advanced?: {
    debugMode?: boolean;
    enableLogging?: boolean;
  };

  // Custom preferences
  preferences?: Record<string, unknown>;
}
