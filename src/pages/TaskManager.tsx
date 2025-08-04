import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Star, Save, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Task } from '../types';

interface TaskFormData {
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: 'required' | 'optional';
  isRepeatable: boolean;
}

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    difficulty: 1,
    type: 'required',
    isRepeatable: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 1,
      type: 'required',
      isRepeatable: false
    });
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setFormData({
      name: task.name,
      description: task.description || '',
      difficulty: task.difficulty,
      type: task.type,
      isRepeatable: task.isRepeatable
    });
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      deleteTask(taskId);
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

  return (
    <div className="p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 shadow-lg"
        >
          <Plus size={20} />
          <span>添加任务</span>
        </motion.button>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-blue-400"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.name}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {/* 难度显示 */}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">难度:</span>
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
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                        可重复
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(task)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有任务</h3>
          <p className="text-gray-500 mb-6">创建你的第一个习惯任务，开始管理你的日常！</p>
        </motion.div>
      )}

      {/* 任务表单模态框 */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTask ? '编辑任务' : '添加任务'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 任务名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="输入任务名称"
                    required
                  />
                </div>

                {/* 任务描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="输入任务描述（可选）"
                    rows={3}
                  />
                </div>

                {/* 难度等级 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    难度等级
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty: level as any })}
                        className="p-2 rounded-lg transition-colors"
                      >
                        <Star
                          size={24}
                          className={`${
                            level <= formData.difficulty
                              ? `${getDifficultyColor(level)} fill-current`
                              : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    难度越高，完成后获得的积分越多
                  </p>
                </div>

                {/* 任务类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务类型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'required' })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.type === 'required'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">必做任务</div>
                      <div className="text-xs">未完成会扣分</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'optional' })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.type === 'optional'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">可选任务</div>
                      <div className="text-xs">额外加分项</div>
                    </button>
                  </div>
                </div>

                {/* 可重复选项 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="repeatable"
                    checked={formData.isRepeatable}
                    onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="repeatable" className="text-sm text-gray-700">
                    允许一天内多次完成
                  </label>
                </div>

                {/* 提交按钮 */}
                <div className="flex items-center space-x-3 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{editingTask ? '保存修改' : '创建任务'}</span>
                  </motion.button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;