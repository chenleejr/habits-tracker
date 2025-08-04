import { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import ParticleEffect from './ParticleEffect';
import PointsAnimation from './PointsAnimation';

interface AnimationState {
  particles: {
    show: boolean;
    type: 'success' | 'levelup' | 'points';
    x: number;
    y: number;
  };
  points: {
    show: boolean;
    points: number;
    startX: number;
    startY: number;
  };
}

interface GlobalAnimationContextType {
  triggerParticleEffect: (type: 'success' | 'levelup' | 'points', x: number, y: number) => void;
  triggerPointsAnimation: (points: number, startX: number, startY: number) => void;
}

const GlobalAnimationContext = createContext<GlobalAnimationContextType | null>(null);

export const useGlobalAnimation = () => {
  const context = useContext(GlobalAnimationContext);
  if (!context) {
    throw new Error('useGlobalAnimation must be used within GlobalAnimationProvider');
  }
  return context;
};

interface GlobalAnimationProviderProps {
  children: ReactNode;
}

export const GlobalAnimationProvider = ({ children }: GlobalAnimationProviderProps) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    particles: {
      show: false,
      type: 'success',
      x: 0,
      y: 0
    },
    points: {
      show: false,
      points: 0,
      startX: 0,
      startY: 0
    }
  });

  const triggerParticleEffect = (type: 'success' | 'levelup' | 'points', x: number, y: number) => {
    setAnimationState(prev => ({
      ...prev,
      particles: {
        show: true,
        type,
        x,
        y
      }
    }));
  };

  const triggerPointsAnimation = (points: number, startX: number, startY: number) => {
    setAnimationState(prev => ({
      ...prev,
      points: {
        show: true,
        points,
        startX,
        startY
      }
    }));
  };

  const handleParticleComplete = () => {
    setAnimationState(prev => ({
      ...prev,
      particles: {
        ...prev.particles,
        show: false
      }
    }));
  };

  const handlePointsComplete = () => {
    setAnimationState(prev => ({
      ...prev,
      points: {
        ...prev.points,
        show: false
      }
    }));
  };

  const contextValue: GlobalAnimationContextType = {
    triggerParticleEffect,
    triggerPointsAnimation
  };

  return (
    <GlobalAnimationContext.Provider value={contextValue}>
      {children}
      {/* 使用 Portal 将动画渲染到 body，避免被容器限制 */}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* 粒子效果 */}
          <ParticleEffect
            trigger={animationState.particles.show}
            type={animationState.particles.type}
            x={animationState.particles.x}
            y={animationState.particles.y}
            onComplete={handleParticleComplete}
          />
          
          {/* 积分动画 */}
          <PointsAnimation
            show={animationState.points.show}
            points={animationState.points.points}
            startX={animationState.points.startX}
            startY={animationState.points.startY}
            onComplete={handlePointsComplete}
          />
        </div>,
        document.body
      )}
    </GlobalAnimationContext.Provider>
  );
};