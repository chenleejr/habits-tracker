import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { router } from './router';
import LevelUpAnimation from './components/LevelUpAnimation';
import { GlobalAnimationProvider } from './components/GlobalAnimationManager';
import { useAppStore } from './store/useAppStore';
import { soundManager } from './utils/sounds';
import './index.css';

function App() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ oldLevel: 1, newLevel: 1 });
  const userData = useAppStore(state => state.userData);
  const soundEnabled = userData.settings.soundEnabled;
  
  // 监听升级事件
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      const { oldLevel, newLevel } = event.detail;
      setLevelUpData({ oldLevel, newLevel });
      setShowLevelUp(true);
      
      if (soundEnabled) {
        soundManager.playLevelUp();
      }
    };
    
    window.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => window.removeEventListener('levelUp', handleLevelUp as EventListener);
  }, [soundEnabled]);
  
  return (
    <GlobalAnimationProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
      <LevelUpAnimation 
        show={showLevelUp}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
        onComplete={() => setShowLevelUp(false)}
      />
    </GlobalAnimationProvider>
  );
}

export default App;
