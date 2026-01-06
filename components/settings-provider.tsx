"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface SiteSettings {
  id: string;
  newGameDays: number;
  maintenanceMode: boolean;
  welcomeMessage: string | null;
  showWelcomeMessage: boolean;
  minPlayStreak: number;
  enableCommunitySubmissions: boolean;
  defaultSort: string;
  maxCustomLists: number;
}

interface SettingsContextValue {
  settings: SiteSettings | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Poll for updates every 60 seconds (reduced from 30s in banner)
    const interval = setInterval(fetchSettings, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, refetch: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
