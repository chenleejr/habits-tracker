import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import ParticleEffect from './ParticleEffect';

interface LevelUpAnimationProps {
  show: boolean;
  oldLevel: number;
  newLevel: number;
  onComplete: () => void;
}

const LevelUpAnimation = ({ show, oldLevel, newLevel, onComplete }: LevelUpAnimationProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (show) {
      // 重置状态
      setShowText(false);
      setShowParticles(false);
      
      // 延迟显示文字
      const textTimer = setTimeout(() => setShowText(true), 300);
      // 延迟显示粒子效果
      const particleTimer = setTimeout(() => setShowParticles(true), 500);
      // 自动关闭
      const closeTimer = setTimeout(() => {
        setShowText(false);
        setShowParticles(false);
        // 延迟调用onComplete，确保exit动画有时间完成
        setTimeout(() => {
          onComplete();
        }, 400); // 比exit动画时间稍长
      }, 3000);
      
      // 清理定时器
      return () => {
        clearTimeout(textTimer);
        clearTimeout(particleTimer);
        clearTimeout(closeTimer);
      };
    } else {
      // 当show为false时，立即重置所有状态
      setShowText(false);
      setShowParticles(false);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {/* 背景光效 */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-transparent to-transparent"
          />

          {/* 主要内容 */}
          <div className="relative text-center">
            {/* 等级图标 */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ 
                scale: showText ? 1 : 0,
                y: showText ? 0 : 50
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 300,
                damping: 15
              }}
              className="mb-6"
            >
              <div className="relative">
                {/* 发光背景 */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl"
                />
                
                {/* 等级徽章 */}
                <div className="relative w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="text-white" size={40} />
                  
                  {/* 旋转的星星 */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 60, 0],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 60, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute"
                    >
                      <Star className="text-yellow-300 fill-current" size={16} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 升级文字 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: showText ? 1 : 0,
                y: showText ? 0 : 30
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-2"
            >
              <motion.h1
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-4xl font-bold text-white mb-2"
              >
                升级了！
              </motion.h1>
              
              <div className="text-2xl font-semibold text-yellow-300">
                等级 {oldLevel} → {newLevel}
              </div>
              
              <div className="text-lg text-white/80">
                恭喜达到新等级！
              </div>
            </motion.div>

            {/* 闪电效果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: showText ? [0, 1, 0] : 0,
                scale: showText ? [0.5, 1.5, 1] : 0.5
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween"
              }}
              className="absolute -top-10 -right-10"
            >
              <Zap className="text-yellow-400 fill-current" size={32} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: showText ? [0, 1, 0] : 0,
                scale: showText ? [0.5, 1.5, 1] : 0.5
              }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween"
              }}
              className="absolute -bottom-10 -left-10"
            >
              <Zap className="text-yellow-400 fill-current" size={24} />
            </motion.div>
          </div>

          {/* 粒子效果 */}
          <ParticleEffect
            trigger={showParticles}
            type="levelup"
            x={window.innerWidth / 2}
            y={window.innerHeight / 2}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpAnimation;