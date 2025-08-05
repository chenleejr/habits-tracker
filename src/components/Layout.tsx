import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Target, BarChart3, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

const Layout = () => {
  const location = useLocation();
  const loadData = useAppStore(state => state.loadData);
  const userData = useAppStore(state => state.userData);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 监听惩罚事件
   useEffect(() => {
     const handlePenaltyApplied = (event: any) => {
       const { totalHealthLost, daysProcessed, penalizedDays } = event.detail;
       
       if (totalHealthLost > 0) {
         toast.error(
           `检测到 ${daysProcessed} 天未完成必做任务，生命值减少 ${totalHealthLost}`,
           {
             duration: 4000,
             description: penalizedDays.length > 0 ? 
               `影响日期: ${penalizedDays.join(', ')}` : undefined
           }
         );
       } else if (daysProcessed > 0) {
         toast.success(`检查了 ${daysProcessed} 天的任务，无需惩罚`);
       }
     };
 
     window.addEventListener('penaltyApplied', handlePenaltyApplied);
     return () => window.removeEventListener('penaltyApplied', handlePenaltyApplied);
   }, []);

  const navItems = [
    { path: '/home', icon: Home, label: '主页' },
    { path: '/tasks', icon: Target, label: '任务' },
    { path: '/statistics', icon: BarChart3, label: '统计' },
    { path: '/settings', icon: Settings, label: '设置' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 顶部状态栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{userData.level}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">习惯追踪</h1>
                <p className="text-xs text-gray-500">等级 {userData.level} · {userData.totalPoints} 积分</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{userData.totalPoints}</div>
              <div className="text-xs text-gray-500">总积分</div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-md mx-auto pb-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center py-2 px-3 relative"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <span className={`text-xs mt-1 transition-colors ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;