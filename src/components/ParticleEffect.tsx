import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'success' | 'levelup' | 'points';
  x?: number;
  y?: number;
}

const ParticleEffect = ({ 
  trigger, 
  onComplete, 
  type = 'success',
  x = 0,
  y = 0
}: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const getParticleConfig = (type: string) => {
    switch (type) {
      case 'levelup':
        return {
          count: 50,
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB'],
          speed: 8,
          life: 120
        };
      case 'points':
        return {
          count: 20,
          colors: ['#00FF00', '#32CD32', '#7FFF00', '#ADFF2F'],
          speed: 5,
          life: 80
        };
      default: // success
        return {
          count: 30,
          colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
          speed: 6,
          life: 100
        };
    }
  };

  const createParticles = () => {
    const config = getParticleConfig(type);
    const particles: Particle[] = [];
    
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      
      particles.push({
        id: i,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life,
        maxLife: config.life,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: 2 + Math.random() * 4
      });
    }
    
    particlesRef.current = particles;
  };

  const updateParticles = () => {
    const particles = particlesRef.current;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 添加重力
      particle.vy += 0.2;
      
      // 添加空气阻力
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      // 减少生命值
      particle.life--;
      
      // 移除死亡的粒子
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制粒子
    particlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      // 绘制圆形粒子
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 添加发光效果
      if (type === 'levelup') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      
      ctx.restore();
    });
  };

  const animate = () => {
    updateParticles();
    drawParticles();
    
    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  useEffect(() => {
    if (trigger) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // 设置画布尺寸为整个视口
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      createParticles();
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, x, y]);

  if (!trigger) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100vw',
        height: '100vh'
      }}
    />
  );
};

export default ParticleEffect;