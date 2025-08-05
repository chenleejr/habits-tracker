import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bug, 
  SkipForward, 
  RotateCcw,
  Clock,
  Target
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const {
    userData,
    tasks,
    completions,
    checkAndApplyPenalties,
    applyDailyPenalty,
    updateUserData,
    setSelectedDate,
    selectedDate
  } = useAppStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 计算当前模拟的天数偏移
  const getCurrentDayOffset = () => {
    const today = new Date().toISOString().split('T')[0];
    const selected = new Date(selectedDate);
    const todayDate = new Date(today);
    const diffTime = selected.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // 获取真实的今天日期
  const getRealToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 模拟跳转到下一天（累积推移）
  const simulateNextDay = async () => {
    setIsProcessing(true);
    try {
      // 先检查当前日期的任务完成情况
      const currentDateStr = selectedDate.split('T')[0];
      const currentPenalty = applyDailyPenalty(currentDateStr);
      
      // 基于当前选中日期推移一天
      const currentSelected = new Date(selectedDate);
      currentSelected.setDate(currentSelected.getDate() + 1);
      const nextDayStr = currentSelected.toISOString().split('T')[0];
      
      // 更新选中日期和最后活跃日期
      setSelectedDate(nextDayStr);
      updateUserData({ lastActiveDate: nextDayStr });
      
      // 再次检查并应用惩罚（处理可能的多日跳跃）
      const penaltyResult = checkAndApplyPenalties();
      
      const dayOffset = getCurrentDayOffset();
      const offsetText = dayOffset === 0 ? '今天' : 
                        dayOffset > 0 ? `未来第${dayOffset}天` : 
                        `过去第${Math.abs(dayOffset)}天`;
      
      const totalHealthLost = currentPenalty.healthLost + penaltyResult.totalHealthLost;
      
      if (totalHealthLost > 0) {
        toast.warning('模拟跳转完成，发现未完成任务', {
          description: `已跳转到${offsetText}（${currentSelected.toLocaleDateString('zh-CN')}），扣除${totalHealthLost}血量`,
          duration: 4000,
        });
      } else {
        toast.success('模拟跳转完成', {
          description: `已跳转到${offsetText}（${currentSelected.toLocaleDateString('zh-CN')}），任务状态已重置`,
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('模拟跳转失败', {
        description: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 回到真实时间
  const resetToRealTime = () => {
    const realToday = getRealToday();
    setSelectedDate(realToday);
    updateUserData({ lastActiveDate: realToday });
    
    toast.success('已回到真实时间', {
      description: `当前日期: ${new Date().toLocaleDateString('zh-CN')}`,
      duration: 3000,
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bug className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">调试工具</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 当前状态信息 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            当前状态
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">真实日期:</span>
              <span className="font-medium">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">模拟日期:</span>
              <span className={`font-medium ${
                getCurrentDayOffset() === 0 ? 'text-green-600' : 
                getCurrentDayOffset() > 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {new Date(selectedDate).toLocaleDateString('zh-CN')}
                {getCurrentDayOffset() !== 0 && (
                  <span className="ml-1 text-xs">
                    ({getCurrentDayOffset() > 0 ? '+' : ''}{getCurrentDayOffset()}天)
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">当前血量:</span>
              <span className="font-medium text-red-600">{userData.health}/{userData.maxHealth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">必做任务数:</span>
              <span className="font-medium">{tasks.filter(t => t.type === 'required').length}</span>
            </div>
          </div>
        </div>

        {/* 调试操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={simulateNextDay}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            <span>{isProcessing ? '处理中...' : '模拟跳转到下一天'}</span>
          </button>

          <button
            onClick={resetToRealTime}
            disabled={getCurrentDayOffset() === 0}
            className="w-full flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>回到真实时间</span>
          </button>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>注意:</strong> 这些是调试功能，仅用于测试惩罚系统。在生产环境中请谨慎使用。
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DebugPanel;