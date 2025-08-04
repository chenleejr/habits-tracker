import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PointsAnimationProps {
  show: boolean;
  points: number;
  startX: number;
  startY: number;
  onComplete: () => void;
}

const PointsAnimation = ({ show, points, startX, startY, onComplete }: PointsAnimationProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // 动画完成后清理
      const timer = setTimeout(() => {
        setMounted(false);
        onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          initial={{ 
            opacity: 1,
            scale: 0.8,
            y: 0
          }}
          animate={{ 
            opacity: [1, 1, 0],
            scale: [0.8, 1.2, 1],
            y: [0, -80, -120]
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2,
            times: [0, 0.3, 1],
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="fixed pointer-events-none z-40"
          style={{
            left: startX - 50, // 居中显示
            top: startY - 20   // 稍微向上偏移
          }}
        >
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full shadow-lg">
            <Plus size={16} className="text-white" />
            <span className="font-bold text-lg">{points}</span>
            <span className="text-sm">分</span>
          </div>
          
          {/* 发光效果 */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-md -z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PointsAnimation;