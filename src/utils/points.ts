import { Task, TaskCompletion, POINTS_CONFIG, LEVELS, LevelInfo } from '../types';

// 根据任务难度计算积分
export const calculateTaskPoints = (difficulty: Task['difficulty']): number => {
  return POINTS_CONFIG.DIFFICULTY_MULTIPLIER[difficulty];
};

// 计算任务未完成的扣分
export const calculatePenalty = (difficulty: Task['difficulty']): number => {
  return Math.floor(calculateTaskPoints(difficulty) * POINTS_CONFIG.PENALTY_MULTIPLIER);
};

// 根据积分获取等级信息
export const getLevelInfo = (points: number): LevelInfo => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

// 计算升级所需积分
export const getPointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = getLevelInfo(currentPoints);
  const nextLevel = LEVELS.find(level => level.level === currentLevel.level + 1);
  
  if (!nextLevel) {
    return 0; // 已达到最高等级
  }
  
  return nextLevel.minPoints - currentPoints;
};

// 计算当前等级的进度百分比
export const getLevelProgress = (currentPoints: number): number => {
  const currentLevel = getLevelInfo(currentPoints);
  
  if (currentLevel.maxPoints === Infinity) {
    return 100; // 最高等级
  }
  
  const levelRange = currentLevel.maxPoints - currentLevel.minPoints + 1;
  const currentProgress = currentPoints - currentLevel.minPoints;
  
  return Math.min(100, Math.max(0, (currentProgress / levelRange) * 100));
};

// 检查是否升级
export const checkLevelUp = (oldPoints: number, newPoints: number): boolean => {
  const oldLevel = getLevelInfo(oldPoints).level;
  const newLevel = getLevelInfo(newPoints).level;
  return newLevel > oldLevel;
};

// 计算连续完成奖励
export const calculateStreakBonus = (streak: number): number => {
  if (streak <= 1) return 0;
  return Math.floor(streak / 7) * POINTS_CONFIG.STREAK_BONUS; // 每7天连续完成获得奖励
};

// 计算今日总积分
export const calculateDailyPoints = (
  completions: TaskCompletion[],
  tasks: Task[],
  date: string
): number => {
  const dateStr = date.split('T')[0];
  const dailyCompletions = completions.filter(completion => 
    completion.completedAt.split('T')[0] === dateStr
  );
  
  return dailyCompletions.reduce((total, completion) => total + completion.points, 0);
};

// 计算未完成必做任务的扣分
export const calculateDailyPenalty = (
  tasks: Task[],
  completions: TaskCompletion[],
  date: string
): number => {
  const dateStr = date.split('T')[0];
  const requiredTasks = tasks.filter(task => task.type === 'required');
  const dailyCompletions = completions.filter(completion => 
    completion.completedAt.split('T')[0] === dateStr
  );
  
  let penalty = 0;
  
  requiredTasks.forEach(task => {
    const isCompleted = dailyCompletions.some(completion => completion.taskId === task.id);
    if (!isCompleted) {
      penalty += calculatePenalty(task.difficulty);
    }
  });
  
  return penalty;
};

// 计算连续完成天数
export const calculateStreak = (
  completions: TaskCompletion[],
  tasks: Task[]
): number => {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  // 从今天开始往前检查
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const requiredTasks = tasks.filter(task => task.type === 'required');
    const dailyCompletions = completions.filter(completion => 
      completion.completedAt.split('T')[0] === dateStr
    );
    
    // 检查当天是否完成了所有必做任务
    const allRequiredCompleted = requiredTasks.every(task => 
      dailyCompletions.some(completion => completion.taskId === task.id)
    );
    
    if (allRequiredCompleted && requiredTasks.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    
    // 防止无限循环，最多检查365天
    if (streak >= 365) break;
  }
  
  return streak;
};

// 格式化积分显示
export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

// RPG血量系统相关函数

// 计算任务完成的回血量
export const calculateHealthRecovery = (difficulty: Task['difficulty']): number => {
  return POINTS_CONFIG.HEALTH.RECOVERY[difficulty];
};

// 计算任务未完成的扣血量
export const calculateHealthPenalty = (difficulty: Task['difficulty']): number => {
  return POINTS_CONFIG.HEALTH.PENALTY[difficulty];
};

// 计算未完成必做任务的总扣血量
export const calculateDailyHealthPenalty = (
  tasks: Task[],
  completions: TaskCompletion[],
  date: string
): number => {
  const dateStr = date.split('T')[0];
  const requiredTasks = tasks.filter(task => task.type === 'required');
  const dailyCompletions = completions.filter(completion => 
    completion.completedAt.split('T')[0] === dateStr
  );
  
  let penalty = 0;
  
  requiredTasks.forEach(task => {
    const isCompleted = dailyCompletions.some(completion => completion.taskId === task.id);
    if (!isCompleted) {
      penalty += calculateHealthPenalty(task.difficulty);
    }
  });
  
  return penalty;
};

// 确保血量在有效范围内
export const clampHealth = (health: number, maxHealth: number = POINTS_CONFIG.HEALTH.MAX): number => {
  return Math.max(0, Math.min(maxHealth, health));
};

// 检查血量是否处于危险状态
export const isHealthCritical = (health: number, maxHealth: number = POINTS_CONFIG.HEALTH.MAX): boolean => {
  const percentage = (health / maxHealth) * 100;
  return percentage <= POINTS_CONFIG.HEALTH.WARNING_THRESHOLD;
};

// 获取血量百分比
export const getHealthPercentage = (health: number, maxHealth: number = POINTS_CONFIG.HEALTH.MAX): number => {
  return Math.max(0, Math.min(100, (health / maxHealth) * 100));
};

// 获取血量状态颜色
export const getHealthColor = (health: number, maxHealth: number = POINTS_CONFIG.HEALTH.MAX): string => {
  const percentage = getHealthPercentage(health, maxHealth);
  
  if (percentage <= 20) return '#EF4444'; // 红色 - 危险
  if (percentage <= 40) return '#F59E0B'; // 橙色 - 警告
  if (percentage <= 60) return '#EAB308'; // 黄色 - 注意
  return '#10B981'; // 绿色 - 健康
};