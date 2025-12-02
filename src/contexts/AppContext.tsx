import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lecture, AppSettings } from '@/types/lecture';
import { mockLectures } from '@/data/mockLectures';

interface AppContextType {
  lectures: Lecture[];
  settings: AppSettings;
  isOnboarded: boolean;
  addLecture: (lecture: Lecture) => void;
  updateLecture: (id: string, updates: Partial<Lecture>) => void;
  deleteLecture: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  completeOnboarding: () => void;
  updateTask: (lectureId: string, taskId: string, completed: boolean) => void;
}

const defaultSettings: AppSettings = {
  preferredLanguage: 'english',
  summaryLength: 'medium',
  darkMode: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem('classwhisperer_lectures');
    return saved ? JSON.parse(saved) : mockLectures;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('classwhisperer_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('classwhisperer_onboarded') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('classwhisperer_lectures', JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem('classwhisperer_settings', JSON.stringify(settings));
  }, [settings]);

  const addLecture = (lecture: Lecture) => {
    setLectures(prev => [lecture, ...prev]);
  };

  const updateLecture = (id: string, updates: Partial<Lecture>) => {
    setLectures(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLecture = (id: string) => {
    setLectures(prev => prev.filter(l => l.id !== id));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('classwhisperer_onboarded', 'true');
  };

  const updateTask = (lectureId: string, taskId: string, completed: boolean) => {
    setLectures(prev => prev.map(lecture => {
      if (lecture.id === lectureId && lecture.tasks) {
        return {
          ...lecture,
          tasks: lecture.tasks.map(task => 
            task.id === taskId ? { ...task, completed } : task
          ),
        };
      }
      return lecture;
    }));
  };

  return (
    <AppContext.Provider value={{
      lectures,
      settings,
      isOnboarded,
      addLecture,
      updateLecture,
      deleteLecture,
      updateSettings,
      completeOnboarding,
      updateTask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
