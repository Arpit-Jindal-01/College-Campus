import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPreferences, UserLocation, FilterOptions, SortOption, SkillCategory } from '@/types/skillpulse';

interface SkillPulseContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  savedOpportunities: string[];
  theme: 'light' | 'dark' | 'system';
  filters: FilterOptions;
  sort: SortOption;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (preferences: UserPreferences, location?: UserLocation) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateLocation: (location: UserLocation) => void;
  toggleSaveOpportunity: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSort: (sort: SortOption) => void;
  clearFilters: () => void;
  resetOnboarding: () => void;
}

const defaultPreferences: UserPreferences = {
  domains: [],
  locationType: ['remote'],
  notifications: {
    newRemote: true,
    newLocal: true,
    deadlineSoon: true,
  },
};

const defaultFilters: FilterOptions = {
  types: [],
  locationTypes: [],
  domains: [],
  skillCategories: [],
  query: '',
};

const SkillPulseContext = createContext<SkillPulseContextType | undefined>(undefined);

export function SkillPulseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('skillpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('skillpulse_theme');
    return (saved as 'light' | 'dark' | 'system') || 'dark';
  });

  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters);
  const [sort, setSortState] = useState<SortOption>('newest');

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('skillpulse_theme', theme);
  }, [theme]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('skillpulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillpulse_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    const savedUser = localStorage.getItem('skillpulse_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === email) {
        setUser(parsed);
        return true;
      }
    }
    // Create mock user for demo
    setUser({
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      preferences: defaultPreferences,
      savedOpportunities: [],
      isOnboarded: false,
    });
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      preferences: defaultPreferences,
      savedOpportunities: [],
      isOnboarded: false,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillpulse_user');
  };

  const completeOnboarding = (preferences: UserPreferences, location?: UserLocation) => {
    // Create or update user with onboarding complete
    const newUser: User = user ? {
      ...user,
      preferences,
      location,
      isOnboarded: true,
    } : {
      id: crypto.randomUUID(),
      name: 'Guest',
      email: '',
      preferences,
      location,
      savedOpportunities: [],
      isOnboarded: true,
    };
    setUser(newUser);
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (user) {
      setUser({
        ...user,
        preferences: { ...user.preferences, ...preferences },
      });
    }
  };

  const updateLocation = (location: UserLocation) => {
    if (user) {
      setUser({ ...user, location });
    }
  };

  const toggleSaveOpportunity = (id: string) => {
    if (user) {
      const saved = user.savedOpportunities.includes(id)
        ? user.savedOpportunities.filter(o => o !== id)
        : [...user.savedOpportunities, id];
      setUser({ ...user, savedOpportunities: saved });
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  const setFilters = (newFilters: Partial<FilterOptions>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const setSort = (newSort: SortOption) => {
    setSortState(newSort);
  };

  const clearFilters = () => {
    setFiltersState(defaultFilters);
  };

  const resetOnboarding = () => {
    if (user) {
      setUser({ ...user, isOnboarded: false });
    }
  };

  // Check if onboarded (either user exists and is onboarded, or check localStorage for guest onboarding)
  const isOnboarded = user?.isOnboarded ?? false;

  return (
    <SkillPulseContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboarded,
        savedOpportunities: user?.savedOpportunities ?? [],
        theme,
        filters,
        sort,
        login,
        signup,
        logout,
        completeOnboarding,
        updatePreferences,
        updateLocation,
        toggleSaveOpportunity,
        setTheme,
        setFilters,
        setSort,
        clearFilters,
        resetOnboarding,
      }}
    >
      {children}
    </SkillPulseContext.Provider>
  );
}

export function useSkillPulse() {
  const context = useContext(SkillPulseContext);
  if (!context) {
    throw new Error('useSkillPulse must be used within a SkillPulseProvider');
  }
  return context;
}
