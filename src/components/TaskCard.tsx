import { motion } from 'framer-motion';
import { Check, Star, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Task } from '../types';
import { useAppStore } from '../store/useAppStore';
import { calculateTaskPoints } from '../utils/points';
import { soundManager } from '../utils/sounds';
import { useGlobalAnimation } from './GlobalAnimationManager';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  completionCount?: number;
}

const TaskCard = ({ task, isCompleted, completionCount = 0 }: TaskCardProps) => {
  const completeTask = useAppStore(state => state.completeTask);
  const userData = useAppStore(state => state.userData);
  const { triggerParticleEffect, triggerPointsAnimation } = useGlobalAnimation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const points = calculateTaskPoints(task.difficulty);
  
  const handleComplete = () => {
    // 如果任务不可重复且已经完成，则显示提示并返回
    if (!task.isRepeatable && isCompleted) {
      toast.info('该任务已完成，不能重复完成', {
        description: '此任务只能完成一次',
        duration: 2000,
      });
      
      // 播放错误音效
      if (userData.settings.soundEnabled) {
        soundManager.playError();
      }
      return;
    }
    
    // 获取按钮位置用于动画（相对于视口）
    let buttonX = 0;
    let buttonY = 0;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      buttonX = rect.left + rect.width / 2;
      buttonY = rect.top + rect.height / 2;
    }
    
    // 完成任务并获取结果
    const result = completeTask(task.id);
    
    // 播放音效
    if (userData.settings.soundEnabled) {
      soundManager.resumeAudioContext(); // 确保音频上下文已激活
      soundManager.playTaskComplete();
      soundManager.playPointsGain();
      
      // 如果升级了，播放升级音效
      if (result?.wasLevelUp) {
        setTimeout(() => {
          soundManager.playLevelUp();
        }, 300);
      }
      
      // 如果是连击，播放连击音效
      if (task.isRepeatable && completionCount > 0) {
        setTimeout(() => {
          soundManager.playStreak(completionCount + 1);
        }, 200);
      }
    }
    
    // 触发动画
    if (userData.settings.animationsEnabled) {
      // 触发粒子效果
      triggerParticleEffect('success', buttonX, buttonY);
      // 触发积分动画
      triggerPointsAnimation(points, buttonX, buttonY);
    }
    
    // 添加触觉反馈（如果支持）
    if ('vibrate' in navigator) {
      // 升级时更强烈的触觉反馈
      if (result?.wasLevelUp) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      } else {
        navigator.vibrate([50, 30, 50]);
      }
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'text-gray-400',
      2: 'text-green-400',
      3: 'text-blue-400',
      4: 'text-purple-400',
      5: 'text-yellow-400'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getTypeColor = (type: Task['type']) => {
    return type === 'required' 
      ? 'border-l-red-400 bg-red-50/50' 
      : 'border-l-blue-400 bg-blue-50/50';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        getTypeColor(task.type)
      } ${isCompleted ? 'opacity-75' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <motion.button
                ref={buttonRef}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={handleComplete}
                className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white shadow-green-200'
                    : 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 text-blue-600 shadow-blue-100'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-3 h-3 rounded-full border-2 border-current opacity-60"
                    whileHover={{ opacity: 1, scale: 1.2 }}
                  />
                )}
              </motion.button>
              
              <div className="flex-1">
                <h3 className={`font-medium text-gray-900 ${
                  isCompleted ? 'line-through text-gray-500' : ''
                }`}>
                  {task.name}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-2">
                  {/* 难度显示 */}
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        className={`${
                          index < task.difficulty
                            ? `${getDifficultyColor(task.difficulty)} fill-current`
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* 积分显示 */}
                  <span className="text-xs font-medium text-blue-600">+{points}分</span>
                  
                  {/* 任务类型 */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.type === 'required'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {task.type === 'required' ? '必做' : '可选'}
                  </span>
                  
                  {/* 可重复标识 */}
                  {task.isRepeatable && (
                    <div className="flex items-center space-x-1">
                      <RotateCcw size={12} className="text-gray-400" />
                      {completionCount > 0 && (
                        <span className="text-xs text-gray-500">×{completionCount}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 完成动画效果 */}
      {isCompleted && userData.settings.animationsEnabled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-b-xl"
          style={{ originX: 0 }}
        />
      )}
      

    </motion.div>
  );
};

export default TaskCard;