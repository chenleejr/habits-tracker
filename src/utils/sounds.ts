// 音效系统
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    this.initAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // 生成任务完成音效
  public playTaskComplete() {
    if (!this.isEnabled || !this.audioContext) return;
    
    this.playTone(800, 0.1, 'sine');
    setTimeout(() => this.playTone(1000, 0.1, 'sine'), 100);
  }

  // 生成升级音效
  public playLevelUp() {
    if (!this.isEnabled || !this.audioContext) return;
    
    const notes = [523, 659, 784, 1047]; // C, E, G, C (高八度)
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'triangle');
      }, index * 150);
    });
  }

  // 生成积分获得音效
  public playPointsGain() {
    if (!this.isEnabled || !this.audioContext) return;
    
    this.playTone(600, 0.05, 'square');
    setTimeout(() => this.playTone(800, 0.05, 'square'), 50);
  }

  // 生成错误/失败音效
  public playError() {
    if (!this.isEnabled || !this.audioContext) return;
    
    this.playTone(200, 0.3, 'sawtooth');
  }

  // 生成点击音效
  public playClick() {
    if (!this.isEnabled || !this.audioContext) return;
    
    this.playTone(1200, 0.03, 'sine');
  }

  // 生成连击音效
  public playStreak(streakCount: number) {
    if (!this.isEnabled || !this.audioContext) return;
    
    const baseFreq = 400;
    const freq = baseFreq + (streakCount * 50);
    this.playTone(freq, 0.1, 'triangle');
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      // 音量包络
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  // 恢复音频上下文（用户交互后）
  public resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// 导出单例实例
export const soundManager = SoundManager.getInstance();

// 音效快捷方法
export const playTaskCompleteSound = () => soundManager.playTaskComplete();
export const playLevelUpSound = () => soundManager.playLevelUp();
export const playPointsGainSound = () => soundManager.playPointsGain();
export const playErrorSound = () => soundManager.playError();
export const playClickSound = () => soundManager.playClick();
export const playStreakSound = (count: number) => soundManager.playStreak(count);