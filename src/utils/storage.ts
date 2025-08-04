import { Task, TaskCompletion, UserData, AppState } from '../types';

const STORAGE_KEYS = {
  TASKS: 'habits_tasks',
  COMPLETIONS: 'habits_completions',
  USER_DATA: 'habits_user_data'
} as const;

// 默认用户数据
const DEFAULT_USER_DATA: UserData = {
  totalPoints: 0,
  level: 1,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  health: 100,
  maxHealth: 100,
  settings: {
    animationsEnabled: true,
    soundEnabled: true,
    theme: 'light',
    notifications: true
  }
};

// 保存任务列表
export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

// 获取任务列表
export const getTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
};

// 保存完成记录
export const saveCompletions = (completions: TaskCompletion[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (error) {
    console.error('Failed to save completions:', error);
  }
};

// 获取完成记录
export const getCompletions = (): TaskCompletion[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load completions:', error);
    return [];
  }
};

// 保存用户数据
export const saveUserData = (userData: UserData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// 获取用户数据
export const getUserData = (): UserData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return stored ? { ...DEFAULT_USER_DATA, ...JSON.parse(stored) } : DEFAULT_USER_DATA;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return DEFAULT_USER_DATA;
  }
};

// 清空所有数据
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

// 导出数据
export const exportData = (): string => {
  try {
    const data = {
      tasks: getTasks(),
      completions: getCompletions(),
      userData: getUserData(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    return '';
  }
};

// 导入数据
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.tasks) saveTasks(data.tasks);
    if (data.completions) saveCompletions(data.completions);
    if (data.userData) saveUserData(data.userData);
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// 获取完整应用状态
export const getAppState = (): Omit<AppState, 'selectedDate' | 'isLoading'> => {
  return {
    tasks: getTasks(),
    completions: getCompletions(),
    userData: getUserData()
  };
};