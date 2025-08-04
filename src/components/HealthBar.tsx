import { motion } from 'framer-motion';
import { Heart, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getHealthPercentage, getHealthColor, isHealthCritical } from '../utils/points';

const HealthBar = () => {
  const userData = useAppStore(state => state.userData);
  const { health, maxHealth } = userData;
  
  const healthPercentage = getHealthPercentage(health, maxHealth);
  const healthColor = getHealthColor(health, maxHealth);
  const isCritical = isHealthCritical(health, maxHealth);
  
  return (
    <div className="space-y-2 mb-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Heart 
            className={`w-4 h-4 transition-colors duration-300 ${
              isCritical ? 'text-red-400 animate-pulse' : 'text-red-500'
            }`}
            fill={healthPercentage > 0 ? 'currentColor' : 'none'}
          />
          <span className="text-gray-600">血量</span>
          {isCritical && (
            <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />
          )}
        </div>
        <span className={`text-gray-500 ${
          isCritical ? 'text-red-400' : ''
        }`}>
          {health}/{maxHealth}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-colors duration-300"
            style={{ backgroundColor: healthColor }}
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {/* 血量百分比 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-800 drop-shadow-sm">
            {Math.round(healthPercentage)}%
          </span>
        </div>
      </div>
      
      {/* 危险状态提示 */}
      {isCritical && (
        <motion.div
          className="text-xs text-red-400 font-medium text-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          血量危险！
        </motion.div>
      )}
    </div>
  );
};

export default HealthBar;