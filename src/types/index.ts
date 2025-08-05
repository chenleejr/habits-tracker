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

// 修仙境界配置 - 参考鬼谷八荒
export const LEVELS: LevelInfo[] = [
  // 炼气期 (1-3层)
  { level: 1, name: '炼气初期', minPoints: 0, maxPoints: 199, color: '#9CA3AF' },
  { level: 2, name: '炼气中期', minPoints: 200, maxPoints: 499, color: '#6B7280' },
  { level: 3, name: '炼气后期', minPoints: 500, maxPoints: 999, color: '#4B5563' },
  
  // 筑基期 (4-6层)
  { level: 4, name: '筑基初期', minPoints: 1000, maxPoints: 1999, color: '#059669' },
  { level: 5, name: '筑基中期', minPoints: 2000, maxPoints: 3499, color: '#047857' },
  { level: 6, name: '筑基后期', minPoints: 3500, maxPoints: 5499, color: '#065F46' },
  
  // 金丹期 (7-9层)
  { level: 7, name: '金丹初期', minPoints: 5500, maxPoints: 7999, color: '#D97706' },
  { level: 8, name: '金丹中期', minPoints: 8000, maxPoints: 11499, color: '#B45309' },
  { level: 9, name: '金丹后期', minPoints: 11500, maxPoints: 15999, color: '#92400E' },
  
  // 元婴期 (10-12层)
  { level: 10, name: '元婴初期', minPoints: 16000, maxPoints: 22999, color: '#7C3AED' },
  { level: 11, name: '元婴中期', minPoints: 23000, maxPoints: 31999, color: '#6D28D9' },
  { level: 12, name: '元婴后期', minPoints: 32000, maxPoints: 43999, color: '#5B21B6' },
  
  // 化神期 (13-15层)
  { level: 13, name: '化神初期', minPoints: 44000, maxPoints: 59999, color: '#DC2626' },
  { level: 14, name: '化神中期', minPoints: 60000, maxPoints: 79999, color: '#B91C1C' },
  { level: 15, name: '化神后期', minPoints: 80000, maxPoints: 104999, color: '#991B1B' },
  
  // 合体期 (16-18层)
  { level: 16, name: '合体初期', minPoints: 105000, maxPoints: 139999, color: '#BE185D' },
  { level: 17, name: '合体中期', minPoints: 140000, maxPoints: 184999, color: '#9D174D' },
  { level: 18, name: '合体后期', minPoints: 185000, maxPoints: 239999, color: '#831843' },
  
  // 大乘期 (19-21层)
  { level: 19, name: '大乘初期', minPoints: 240000, maxPoints: 319999, color: '#1E40AF' },
  { level: 20, name: '大乘中期', minPoints: 320000, maxPoints: 419999, color: '#1D4ED8' },
  { level: 21, name: '大乘后期', minPoints: 420000, maxPoints: 549999, color: '#2563EB' },
  
  // 渡劫期 (22-24层)
  { level: 22, name: '渡劫初期', minPoints: 550000, maxPoints: 719999, color: '#7C2D12' },
  { level: 23, name: '渡劫中期', minPoints: 720000, maxPoints: 939999, color: '#A16207' },
  { level: 24, name: '渡劫后期', minPoints: 940000, maxPoints: 1219999, color: '#CA8A04' },
  
  // 登仙期 (25-27层)
  { level: 25, name: '登仙初期', minPoints: 1220000, maxPoints: 1579999, color: '#C026D3' },
  { level: 26, name: '登仙中期', minPoints: 1580000, maxPoints: 2039999, color: '#A21CAF' },
  { level: 27, name: '登仙后期', minPoints: 2040000, maxPoints: Infinity, color: '#86198F' }
];