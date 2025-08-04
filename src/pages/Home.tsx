import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import TaskCard from '../components/TaskCard';
import LevelProgress from '../components/LevelProgress';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
  const {
    tasks,
    getTodayCompletions,
    getTaskCompletionStatus,
    getDailyPoints,
    selectedDate
  } = useAppStore();
  
  const [todayPoints, setTodayPoints] = useState(0);
  const todayCompletions = getTodayCompletions();
  
  useEffect(() => {
    setTodayPoints(getDailyPoints());
  }, [getDailyPoints, todayCompletions]);

  // 按类型分组任务
  const requiredTasks = tasks.filter(task => task.type === 'required');
  const optionalTasks = tasks.filter(task => task.type === 'optional');
  
  // 计算完成统计
  const completedRequired = requiredTasks.filter(task => 
    getTaskCompletionStatus(task.id)
  ).length;
  const completedOptional = optionalTasks.filter(task => 
    getTaskCompletionStatus(task.id)
  ).length;
  
  const getTaskCompletionCount = (taskId: string) => {
    return todayCompletions.filter(completion => completion.taskId === taskId).length;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 等级进度和血量条 */}
      <LevelProgress />
      
      {/* 今日概览 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Calendar size={20} className="text-blue-500" />
            <span>{formatDate(selectedDate)}</span>
          </h2>
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp size={16} />
            <span className="font-bold">+{todayPoints}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {completedRequired}/{requiredTasks.length}
            </div>
            <div className="text-xs text-gray-500">必做任务</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {completedOptional}/{optionalTasks.length}
            </div>
            <div className="text-xs text-gray-500">可选任务</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {todayPoints}
            </div>
            <div className="text-xs text-gray-500">今日积分</div>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        {/* 必做任务 */}
        {requiredTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">必做任务</h3>
              <span className="text-sm text-red-500 font-medium">
                {completedRequired}/{requiredTasks.length}
              </span>
            </div>
            <AnimatePresence>
              <div className="space-y-3">
                {requiredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={getTaskCompletionStatus(task.id)}
                    completionCount={getTaskCompletionCount(task.id)}
                  />
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}

        {/* 可选任务 */}
        {optionalTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">可选任务</h3>
              <span className="text-sm text-blue-500 font-medium">
                {completedOptional}/{optionalTasks.length}
              </span>
            </div>
            <AnimatePresence>
              <div className="space-y-3">
                {optionalTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={getTaskCompletionStatus(task.id)}
                    completionCount={getTaskCompletionCount(task.id)}
                  />
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有任务</h3>
          <p className="text-gray-500 mb-6">创建你的第一个习惯任务，开始你的成长之旅！</p>
          <Link to="/tasks">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus size={20} />
              <span>创建任务</span>
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* 快速添加按钮 */}
      {tasks.length > 0 && (
        <Link to="/tasks">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
          >
            <Plus size={24} />
          </motion.button>
        </Link>
      )}
    </div>
  );
};

export default Home;