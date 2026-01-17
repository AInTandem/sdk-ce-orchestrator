/**
 * Settings Hook
 *
 * React hook for managing application settings.
 */

import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAInTandem } from '../providers/AInTandemProvider';
import type {
  Settings,
  UpdateSettingsRequest,
} from '@aintandem/sdk-core';

/**
 * Use Settings Hook
 *
 * Fetches and manages application settings.
 *
 * @example
 * ```tsx
 * import { useSettings } from '@aintandem/sdk-react';
 *
 * function SettingsPage() {
 *   const { settings, loading, error, updateSettings, refresh } = useSettings();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Settings</h1>
 *       <p>Git Display Name: {settings.gitDisplayName}</p>
 *       <p>Git Email: {settings.gitEmail}</p>
 *       <p>Docker Image: {settings.dockerImage}</p>
 *       <button onClick={() => updateSettings({ gitDisplayName: 'New Name' })}>
 *         Update Name
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSettings() {
  const { client } = useAInTandem();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    client.settings
      .getSettings()
      .then(setSettings)
      .catch((err: unknown) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSettings = useCallback(async (request: UpdateSettingsRequest) => {
    setLoading(true);
    setError(null);

    return client.settings
      .updateSettings(request)
      .then((updated: Settings) => {
        setSettings(updated);
        return updated;
      })
      .catch((err: unknown) => {
        setError(err as Error);
        throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  // getSettings fetches settings and returns them directly (for test compatibility)
  const getSettings = useCallback(async () => {
    return client.settings.getSettings();
  }, [client]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh,
    getSettings,
  };
}
