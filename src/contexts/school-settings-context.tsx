'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SchoolSettings {
  schoolName: string;
  schoolLogoUrl: string | null;
  primaryColor: string;
}

interface SchoolSettingsContextType {
  settings: SchoolSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SchoolSettings = {
  schoolName: 'School',
  schoolLogoUrl: null,
  primaryColor: '#3B82F6'
};

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: async () => {}
});

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SchoolSettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
}

export function useSchoolSettings() {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    throw new Error('useSchoolSettings must be used within SchoolSettingsProvider');
  }
  return context;
}
