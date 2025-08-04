import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Target, Award, Flame } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calculateDailyPoints, calculateStreak } from '../utils/points';
import { formatPoints } from '../utils/points';

const Statistics = () => {
  const { tasks, completions, userData } = useAppStore();

  // 计算统计数据
  const statistics = useMemo(() => {
    const totalTasksCompleted = completions.length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (totalTasksCompleted / totalTasks) * 100 : 0;
    
    // 计算最近7天的数据
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyPoints = calculateDailyPoints(completions, tasks, dateStr);
      const dailyCompletions = completions.filter(c => 
        c.completedAt.split('T')[0] === dateStr
      ).length;
      
      last7Days.push({
        date: dateStr,
        points: dailyPoints,
        completions: dailyCompletions,
        label: date.toLocaleDateString('zh-CN', { 
          month: 'numeric', 
          day: 'numeric' 
        })
      });
    }
    
    // 计算平均积分
    const totalPoints = last7Days.reduce((sum, day) => sum + day.points, 0);
    const averagePointsPerDay = totalPoints / 7;
    
    // 计算最佳连续记录
    const bestStreak = calculateStreak(completions, tasks);
    
    return {
      totalTasksCompleted,
      completionRate,
      averagePointsPerDay,
      bestStreak,
      currentStreak: userData.streak,
      last7Days
    };
  }, [tasks, completions, userData.streak]);

  // 按任务类型统计
  const taskTypeStats = useMemo(() => {
    const requiredTasks = tasks.filter(t => t.type === 'required');
    const optionalTasks = tasks.filter(t => t.type === 'optional');
    
    const requiredCompletions = completions.filter(c => {
      const task = tasks.find(t => t.id === c.taskId);
      return task?.type === 'required';
    }).length;
    
    const optionalCompletions = completions.filter(c => {
      const task = tasks.find(t => t.id === c.taskId);
      return task?.type === 'optional';
    }).length;
    
    return [
      {
        name: '必做任务',
        completed: requiredCompletions,
        total: requiredTasks.length,
        color: '#EF4444'
      },
      {
        name: '可选任务',
        completed: optionalCompletions,
        total: optionalTasks.length,
        color: '#3B82F6'
      }
    ];
  }, [tasks, completions]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'text-blue-500 bg-blue-50',
      green: 'text-green-500 bg-green-50',
      purple: 'text-purple-500 bg-purple-50',
      orange: 'text-orange-500 bg-orange-50'
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-4"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
            {subtitle && (
              <div className="text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">数据统计</h1>
        <p className="text-gray-600">查看你的习惯养成进度</p>
      </div>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Target}
          title="完成任务"
          value={statistics.totalTasksCompleted}
          subtitle="总计"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="完成率"
          value={`${Math.round(statistics.completionRate)}%`}
          subtitle="整体表现"
          color="green"
        />
        <StatCard
          icon={Award}
          title="平均积分"
          value={Math.round(statistics.averagePointsPerDay)}
          subtitle="每日平均"
          color="purple"
        />
        <StatCard
          icon={Flame}
          title="连续天数"
          value={statistics.currentStreak}
          subtitle="当前连击"
          color="orange"
        />
      </div>

      {/* 最近7天积分趋势 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp size={20} className="text-blue-500" />
          <span>最近7天积分趋势</span>
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statistics.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value} 积分`, '积分']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最近7天完成次数 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar size={20} className="text-green-500" />
          <span>最近7天完成次数</span>
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value} 次`, '完成次数']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar 
                dataKey="completions" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 任务类型统计 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">任务类型统计</h3>
        <div className="space-y-4">
          {taskTypeStats.map((stat, index) => {
            const percentage = stat.total > 0 ? Math.min((stat.completed / stat.total) * 100, 100) : 0;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                  <span className="text-sm text-gray-500">
                    {stat.completed}/{stat.total} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-2 rounded-full max-w-full"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 成就展示 */}
      {statistics.bestStreak > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">最佳记录</h3>
            <p className="text-orange-600 font-medium">
              连续完成 {statistics.bestStreak} 天任务
            </p>
            <p className="text-sm text-gray-500 mt-1">
              继续保持，创造更好的记录！
            </p>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {statistics.totalTasksCompleted === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有数据</h3>
          <p className="text-gray-500">完成一些任务后，这里会显示你的统计数据</p>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;