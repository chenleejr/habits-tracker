import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Zap, 
  ZapOff,
  Moon,
  Sun,
  Bell,
  BellOff,
  Info,
  RefreshCw,
  AlertTriangle,
  Bug
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { exportData, importData, clearAllData } from '../utils/storage';
import { LEVELS } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import DebugPanel from '../components/DebugPanel';
import { toast } from 'sonner';
import { getTodayLocalString } from '../utils/timezone';

const Settings = () => {
  const { userData, updateUserSettings, resetData, tasks } = useAppStore();
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habits-backup-${getTodayLocalString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('数据导出成功！');
    } catch (error) {
      alert('导出失败，请重试');
    }
  };

  const handleImportData = () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        
        if (success) {
          alert('数据导入成功！页面将刷新以加载新数据。');
          window.location.reload();
        } else {
          alert('导入失败，请检查文件格式');
        }
      } catch (error) {
        alert('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(importFile);
  };

  const handleResetData = () => {
    setShowFirstConfirm(true);
  };

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleFinalConfirm = () => {
    setShowSecondConfirm(false);
    
    // 清除localStorage中的所有数据
    clearAllData();
    
    // 重置store状态
    resetData();
    
    // 刷新页面以确保UI完全更新
    window.location.reload();
  };



  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    children, 
    danger = false 
  }: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
    danger?: boolean;
  }) => (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${
      danger ? 'border border-red-200' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            danger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
          }`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className={`font-medium ${
              danger ? 'text-red-900' : 'text-gray-900'
            }`}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  const Toggle = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </motion.button>
  );

  return (
    <div className="p-4 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">个性化你的应用体验</p>
      </div>

      {/* 应用设置 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">应用设置</h2>
        
        <SettingItem
          icon={userData.settings.animationsEnabled ? Zap : ZapOff}
          title="动画效果"
          description="开启任务完成和升级动画"
        >
          <Toggle
            checked={userData.settings.animationsEnabled}
            onChange={(checked) => updateUserSettings({ animationsEnabled: checked })}
          />
        </SettingItem>

        <SettingItem
          icon={userData.settings.soundEnabled ? Volume2 : VolumeX}
          title="音效"
          description="开启操作音效反馈"
        >
          <Toggle
            checked={userData.settings.soundEnabled}
            onChange={(checked) => updateUserSettings({ soundEnabled: checked })}
          />
        </SettingItem>

        <SettingItem
          icon={userData.settings.theme === 'dark' ? Moon : Sun}
          title="深色模式"
          description="切换应用主题"
        >
          <Toggle
            checked={userData.settings.theme === 'dark'}
            onChange={(checked) => updateUserSettings({ theme: checked ? 'dark' : 'light' })}
            disabled={true}
          />
        </SettingItem>

        <SettingItem
          icon={userData.settings.notifications ? Bell : BellOff}
          title="通知提醒"
          description="接收任务提醒通知"
        >
          <Toggle
            checked={userData.settings.notifications}
            onChange={(checked) => updateUserSettings({ notifications: checked })}
            disabled={true}
          />
        </SettingItem>
      </div>

      {/* 数据管理 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
        
        <SettingItem
          icon={Download}
          title="导出数据"
          description="备份你的所有数据"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            导出
          </motion.button>
        </SettingItem>

        <SettingItem
          icon={Upload}
          title="导入数据"
          description="从备份文件恢复数据"
        >
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              选择文件
            </label>
            {importFile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleImportData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                导入
              </motion.button>
            )}
          </div>
        </SettingItem>



        <SettingItem
          icon={Bug}
          title="调试工具"
          description="开发者调试面板"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDebugPanel(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >打开调试</motion.button>
        </SettingItem>

        <SettingItem
          icon={RefreshCw}
          title="重置数据"
          description="清空所有数据并重新开始"
          danger
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleResetData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >重置</motion.button>
        </SettingItem>
      </div>

      {/* 等级规则说明 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">境界规则</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLevelInfo(!showLevelInfo)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Info size={20} />
          </motion.button>
        </div>
        
        {showLevelInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm p-4 space-y-3"
          >
            <h3 className="font-medium text-gray-900 mb-3">修仙境界说明</h3>
            
            <div className="space-y-2">
              {LEVELS.map((level, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <span className="font-medium text-gray-900">{level.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {level.minPoints === 0 ? '0' : level.minPoints}
                    {level.maxPoints === Infinity ? '+' : `-${level.maxPoints}`} 修为值
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">修为规则</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 1星任务：10修为值</li>
                <li>• 2星任务：20修为值</li>
                <li>• 3星任务：30修为值</li>
                <li>• 4星任务：50修为值</li>
                <li>• 5星任务：80修为值</li>
                <li>• 连续完成奖励：每7天+5修为值</li>
              </ul>
            </div>
            
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">修仙惩罚机制</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• 未完成必做任务：损耗灵力（1星5点，2星10点，3星15点，4星25点，5星40点）</li>
                <li>• 完成任务恢复：根据难度恢复2-6点灵力</li>
                <li>• 灵力保护：灵力不会低于0，最大100</li>
                <li>• 危险警告：灵力低于30%时显示红色警告</li>
                <li>• 每日自动检查：应用启动时检查过往未完成的必做任务</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* 应用信息 */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <div className="text-4xl mb-2">🎯</div>
        <h3 className="font-semibold text-gray-900 mb-1">习惯追踪</h3>
        <p className="text-sm text-gray-500">版本 1.0.0</p>
        <p className="text-xs text-gray-400 mt-2">
          让每一天都充满成就感
        </p>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={showFirstConfirm}
        onClose={() => setShowFirstConfirm(false)}
        onConfirm={handleFirstConfirm}
        title="重置数据确认"
        message="确定要重置所有数据吗？此操作不可恢复！"
        confirmText="继续"
        cancelText="取消"
        danger
      />

      <ConfirmDialog
        isOpen={showSecondConfirm}
        onClose={() => setShowSecondConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="最终确认"
        message="请再次确认：这将删除所有任务、完成记录和积分数据！此操作无法撤销。"
        confirmText="确认重置"
        cancelText="取消"
        danger
      />

      {/* 调试面板 */}
      <DebugPanel
        isOpen={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </div>
  );
};

export default Settings;