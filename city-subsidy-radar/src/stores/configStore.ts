import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { APIConfig } from '../types';

interface ConfigState {
  apiConfig: APIConfig | null;
  isConfigured: boolean;
  setApiConfig: (config: APIConfig) => void;
  clearApiConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      apiConfig: null,
      isConfigured: false,
      setApiConfig: (apiConfig) => set({ apiConfig, isConfigured: true }),
      clearApiConfig: () => set({ apiConfig: null, isConfigured: false }),
    }),
    {
      name: 'subsidy-radar-config',
    }
  )
);
