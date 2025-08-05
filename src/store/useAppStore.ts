import { create } from 'zustand';
import { Task, TaskCompletion, UserData, AppState } from '../types';
import {
  getTasks,
  getCompletions,
  getUserData,
  saveTasks,
  saveCompletions,
  saveUserData
} from '../utils/storage';
import {
  calculateTaskPoints,
  calculateDailyPenalty,
  calculateStreak,
  checkLevelUp,
  getLevelInfo,
  calculateHealthRecovery,
  calculateDailyHealthPenalty,
  clampHealth
} from '../utils/points';
import {
  getTodayLocalString,
  getLocalDateString,
  getYesterdayLocalString
} from '../utils/timezone';

interface AppStore extends AppState {
  // Actions
  loadData: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (taskId: string) => { points: number; wasLevelUp: boolean; newLevel: number; healthRecovered: number } | undefined;
  setSelectedDate: (date: string) => void;
  updateUserSettings: (settings: Partial<UserData['settings']>) => void;
  updateUserData: (updates: Partial<UserData>) => void;
  resetData: () => void;
  applyDailyPenalty: (date: string) => { penalty: number; penalizedTasks: string[]; healthLost: number };
  checkAndApplyPenalties: () => { totalPenalty: number; daysProcessed: number; totalHealthLost: number; penalizedDays: string[] };
  testPenaltySystem: () => { penalty: number; penalizedTasks: string[]; healthLost: number };
  
  // Computed values
  getTodayTasks: () => Task[];
  getTodayCompletions: () => TaskCompletion[];
  getTaskCompletionStatus: (taskId: string, date?: string) => boolean;
  getDailyPoints: (date?: string) => number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  tasks: [],
  completions: [],
  userData: {
    totalPoints: 0,
    level: 1,
    streak: 0,
    lastActiveDate: getTodayLocalString(),
    health: 100,
    maxHealth: 100,
    settings: {
      animationsEnabled: true,
      soundEnabled: true,
      theme: 'light',
      notifications: true
    }
  },
  selectedDate: getTodayLocalString(),
  isLoading: false,

  // Actions
  loadData: () => {
    set({ isLoading: true });
    try {
      const tasks = getTasks();
      const completions = getCompletions();
      const userData = getUserData();
      
      // 重置selectedDate为当前真实日期，确保每次应用启动时都从真实日期开始
      const currentRealDate = getTodayLocalString();
      
      set({
        tasks,
        completions,
        userData,
        selectedDate: currentRealDate,
        isLoading: false
      });
      
      // 自动检查并应用惩罚
      setTimeout(() => {
        const result = get().checkAndApplyPenalties();
        
        // 如果有惩罚，显示通知
        if (result.totalHealthLost > 0 || result.daysProcessed > 0) {
          // 使用自定义事件来通知UI显示惩罚结果
          const penaltyEvent = new CustomEvent('penaltyApplied', {
            detail: {
              totalHealthLost: result.totalHealthLost,
              daysProcessed: result.daysProcessed,
              penalizedDays: result.penalizedDays || []
            }
          });
          window.dispatchEvent(penaltyEvent);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTasks = [...get().tasks, newTask];
    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
  },

  updateTask: (id, updates) => {
    const updatedTasks = get().tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    
    set({ tasks: updatedTasks });
    saveTasks(updatedTasks);
  },

  deleteTask: (id) => {
    const updatedTasks = get().tasks.filter(task => task.id !== id);
    const updatedCompletions = get().completions.filter(completion => completion.taskId !== id);
    
    set({ 
      tasks: updatedTasks,
      completions: updatedCompletions
    });
    
    saveTasks(updatedTasks);
    saveCompletions(updatedCompletions);
  },

  completeTask: (taskId) => {
    const { tasks, completions, userData, selectedDate } = get();
    
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return;
    }
    
    const points = calculateTaskPoints(task.difficulty);
    const healthRecovered = calculateHealthRecovery(task.difficulty);
    
    // 使用selectedDate创建完成记录，确保日期格式一致性
    const completionDate = selectedDate + 'T' + new Date().toTimeString().split(' ')[0];
    
    const newCompletion: TaskCompletion = {
      id: crypto.randomUUID(),
      taskId,
      completedAt: completionDate,
      points
    };

    
    const updatedCompletions = [...completions, newCompletion];
    const newTotalPoints = userData.totalPoints + points;
    const oldLevel = userData.level;
    const newLevel = getLevelInfo(newTotalPoints).level;
    const wasLevelUp = newLevel > oldLevel;
    const newStreak = calculateStreak(updatedCompletions, tasks);
    
    // 计算新的血量（恢复血量但不超过最大值）
    const newHealth = clampHealth(userData.health + healthRecovered, userData.maxHealth);
    

    
    const updatedUserData: UserData = {
      ...userData,
      totalPoints: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      health: newHealth,
      lastActiveDate: selectedDate.split('T')[0]
    };
    
    set({
      completions: updatedCompletions,
      userData: updatedUserData
    });
    
    saveCompletions(updatedCompletions);
    saveUserData(updatedUserData);
    
    // 触发升级动画（如果升级了）
    if (wasLevelUp && userData.settings.animationsEnabled) {
      // 触发全局升级事件
      const levelUpEvent = new CustomEvent('levelUp', {
        detail: { oldLevel, newLevel }
      });
      window.dispatchEvent(levelUpEvent);
    }
    
    return { points, wasLevelUp, newLevel, healthRecovered };
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  updateUserSettings: (settings) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      settings: { ...userData.settings, ...settings }
    };
    
    set({ userData: updatedUserData });
    saveUserData(updatedUserData);
  },

  updateUserData: (updates) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      ...updates
    };
    
    set({ userData: updatedUserData });
    saveUserData(updatedUserData);
  },

  resetData: () => {
    const defaultUserData: UserData = {
      totalPoints: 0,
      level: 1,
      streak: 0,
      lastActiveDate: getTodayLocalString(),
      health: 100,
      maxHealth: 100,
      settings: {
        animationsEnabled: true,
        soundEnabled: true,
        theme: 'light',
        notifications: true
      }
    };
    
    set({
      tasks: [],
      completions: [],
      userData: defaultUserData
    });
    
    saveTasks([]);
    saveCompletions([]);
    saveUserData(defaultUserData);
  },

  applyDailyPenalty: (date) => {
    const { tasks, completions, userData } = get();
    const dateStr = date.split('T')[0];
    
    // 获取当天的必做任务
    const requiredTasks = tasks.filter(task => task.type === 'required');
    
    // 获取当天已完成的任务
    const completedTaskIds = completions
      .filter(completion => completion.completedAt.split('T')[0] === dateStr)
      .map(completion => completion.taskId);
    
    // 找出未完成的必做任务
    const incompleteTasks = requiredTasks.filter(task => !completedTaskIds.includes(task.id));
    
    if (incompleteTasks.length === 0) {
      return { penalty: 0, penalizedTasks: [], healthLost: 0 };
    }
    
    // 计算惩罚积分（保留原有逻辑）
    const penalty = calculateDailyPenalty(tasks, completions, dateStr);
    
    // 计算血量惩罚
    const healthLost = calculateDailyHealthPenalty(tasks, completions, dateStr);
    
    // 扣除血量，但不能低于0
    const newHealth = clampHealth(userData.health - healthLost, userData.maxHealth);
    
    // 只有当血量真的发生变化时才更新
    if (newHealth !== userData.health) {
      const updatedUserData: UserData = {
        ...userData,
        health: newHealth
      };
      
      set({ userData: updatedUserData });
      saveUserData(updatedUserData);
    }
    
    return {
      penalty,
      penalizedTasks: incompleteTasks.map(task => task.name),
      healthLost
    };
  },

  checkAndApplyPenalties: () => {
    const { userData } = get();
    const today = getTodayLocalString();
    const lastActiveDate = userData.lastActiveDate;
    
    let totalPenalty = 0;
    let totalHealthLost = 0;
    let daysChecked = 0;
    let daysWithPenalties = 0;
    let penalizedDays: string[] = [];
    
    console.log('🔍 开始检查惩罚:', { today, lastActiveDate });
    
    // 如果lastActiveDate就是今天，说明今天已经检查过了，无需再检查
    if (lastActiveDate === today) {
      console.log('✅ 今天已经检查过惩罚，跳过');
      return { totalPenalty: 0, daysProcessed: 0, totalHealthLost: 0, penalizedDays: [] };
    }
    
    // 检查从上次活跃日期的下一天到昨天的所有日期
    const lastActive = new Date(userData.lastActiveDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const currentDate = new Date(lastActive);
    currentDate.setDate(currentDate.getDate() + 1); // 从下一天开始
    
    // 如果没有需要检查的日期，直接返回
    if (currentDate > yesterday) {
      // 仍然需要更新lastActiveDate
      const { userData: currentUserData } = get();
      const updatedUserData = {
        ...currentUserData,
        lastActiveDate: today
      };
      set({ userData: updatedUserData });
      saveUserData(updatedUserData);
      return { totalPenalty: 0, daysProcessed: 0, totalHealthLost: 0, penalizedDays: [] };
    }
    
    while (currentDate <= yesterday) {
      const dateStr = getLocalDateString(currentDate);
      daysChecked++;
      
      const result = get().applyDailyPenalty(dateStr);
      totalPenalty += result.penalty;
      totalHealthLost += result.healthLost;
      
      if (result.penalty > 0 || result.healthLost > 0) {
        daysWithPenalties++;
        penalizedDays.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 更新最后活跃日期为今天
    const { userData: currentUserData } = get();
    const updatedUserData = {
      ...currentUserData,
      lastActiveDate: today
    };
    
    set({ userData: updatedUserData });
    saveUserData(updatedUserData);
    
    return { 
      totalPenalty, 
      daysProcessed: daysChecked, 
      totalHealthLost, 
      penalizedDays,
      daysWithPenalties 
    };
  },

  testPenaltySystem: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    return get().applyDailyPenalty(yesterdayStr);
  },

  // Computed values
  getTodayTasks: () => {
    return get().tasks;
  },

  getTodayCompletions: () => {
    const { completions, selectedDate } = get();
    const dateStr = selectedDate.split('T')[0];
    return completions.filter(completion => 
      completion.completedAt.split('T')[0] === dateStr
    );
  },

  getTaskCompletionStatus: (taskId, date) => {
    const { completions, selectedDate } = get();
    const targetDate = (date || selectedDate).split('T')[0];
    return completions.some(completion => 
      completion.taskId === taskId && 
      completion.completedAt.split('T')[0] === targetDate
    );
  },

  getDailyPoints: (date) => {
    const { completions, selectedDate } = get();
    const targetDate = (date || selectedDate).split('T')[0];
    const dailyCompletions = completions.filter(completion => 
      completion.completedAt.split('T')[0] === targetDate
    );
    return dailyCompletions.reduce((total, completion) => total + completion.points, 0);
  }
}));