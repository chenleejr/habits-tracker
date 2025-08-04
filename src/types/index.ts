// 任务类型定义
export interface Task {
  id: string;
  name: string;
  description?: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1-5星难度
  type: 'required' | 'optional'; // 必做或可选
  isRepeatable: boolean; // 是否可重复完成
  createdAt: string;
  updatedAt: string;
}

// 任务完成记录
export interface TaskCompletion {
  id: string;
  taskId: string;
  completedAt: string;
  points: number; // 获得的积分
}

// 用户数据
export interface UserData {
  totalPoints: number; // 总积分
  level: number; // 当前等级
  streak: number; // 连续完成天数
  lastActiveDate: string; // 最后活跃日期
  health: number; // 血量 (0-100)
  maxHealth: number; // 最大血量
  settings: UserSettings;
}

// 用户设置
export interface UserSettings {
  animationsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  notifications: boolean;
}

// 等级系统
export interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

// 统计数据
export interface Statistics {
  totalTasksCompleted: number;
  completionRate: number;
  averagePointsPerDay: number;
  bestStreak: number;
  currentStreak: number;
  pointsHistory: Array<{
    date: string;
    points: number;
  }>;
}

// 应用状态
export interface AppState {
  tasks: Task[];
  completions: TaskCompletion[];
  userData: UserData;
  selectedDate: string;
  isLoading: boolean;
}

// 积分计算规则
export const POINTS_CONFIG = {
  DIFFICULTY_MULTIPLIER: {
    1: 10,
    2: 20,
    3: 30,
    4: 50,
    5: 80
  },
  PENALTY_MULTIPLIER: 0.5, // 未完成必做任务的扣分倍数
  STREAK_BONUS: 5, // 连续完成奖励
  LEVEL_THRESHOLD: 100, // 每级所需基础积分
  // RPG血量系统
  HEALTH: {
    MAX: 100, // 最大血量
    PENALTY: { // 未完成任务扣血
      1: 5,
      2: 10,
      3: 15,
      4: 25,
      5: 40
    },
    RECOVERY: { // 完成任务回血
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 6
    },
    WARNING_THRESHOLD: 30 // 血量警告阈值
  }
} as const;

// 等级配置
export const LEVELS: LevelInfo[] = [
  { level: 1, name: '新手', minPoints: 0, maxPoints: 99, color: '#6B7280' },
  { level: 2, name: '学徒', minPoints: 100, maxPoints: 299, color: '#10B981' },
  { level: 3, name: '熟练者', minPoints: 300, maxPoints: 599, color: '#3B82F6' },
  { level: 4, name: '专家', minPoints: 600, maxPoints: 999, color: '#8B5CF6' },
  { level: 5, name: '大师', minPoints: 1000, maxPoints: 1999, color: '#F59E0B' },
  { level: 6, name: '传奇', minPoints: 2000, maxPoints: Infinity, color: '#EF4444' }
];