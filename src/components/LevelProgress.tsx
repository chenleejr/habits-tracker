import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getLevelInfo, getPointsToNextLevel, getLevelProgress } from '../utils/points';
import { LEVELS } from '../types';
import HealthBar from './HealthBar';

const LevelProgress = () => {
  const userData = useAppStore(state => state.userData);
  const currentLevel = getLevelInfo(userData.totalPoints);
  const pointsToNext = getPointsToNextLevel(userData.totalPoints);
  const progress = getLevelProgress(userData.totalPoints);
  const isMaxLevel = currentLevel.level === LEVELS[LEVELS.length - 1].level;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: currentLevel.color }}
          >
            {userData.level}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{currentLevel.name}</h3>
            <p className="text-sm text-gray-500">境界 {userData.level}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-1 text-yellow-500">
            <Trophy size={16} />
            <span className="font-bold">{userData.totalPoints}</span>
          </div>
          <p className="text-xs text-gray-500">修为值</p>
        </div>
      </div>

      {/* 血量条 */}
      <HealthBar />

      {/* 经验进度条 */}
      {!isMaxLevel && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">突破进度</span>
            <span className="text-gray-500">
              还需 {pointsToNext} 修为值突破
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
              >
                {/* 进度条光效 */}
                <motion.div
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: 'linear' 
                  }}
                  className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            
            {/* 进度百分比 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-800 drop-shadow-sm">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 最高等级提示 */}
      {isMaxLevel && (
        <div className="flex items-center justify-center space-x-2 py-2">
          <Zap className="text-yellow-500" size={16} />
          <span className="text-sm font-medium text-gray-700">已登仙成功，修为圆满！</span>
          <Zap className="text-yellow-500" size={16} />
        </div>
      )}

      {/* 连续完成天数 */}
      {userData.streak > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-orange-500"
            >
              🔥
            </motion.div>
            <span className="text-sm font-medium text-gray-700">
              连续完成 <span className="text-orange-500 font-bold">{userData.streak}</span> 天
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelProgress;