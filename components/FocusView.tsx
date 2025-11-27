import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target } from 'lucide-react';

interface FocusViewProps {
  initialMinutes?: number;
}

const FocusView: React.FC<FocusViewProps> = ({ initialMinutes = 25 }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 text-center mb-8">
        <div className="inline-flex items-center justify-center p-1 bg-[#1A1D26] rounded-full shadow-lg border border-white/5 mb-6">
          <button 
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${mode === 'focus' ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'text-slate-400 hover:text-white'}`}
          >
            Focus
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${mode === 'break' ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'text-slate-400 hover:text-white'}`}
          >
            Break
          </button>
        </div>

        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2 tracking-tight">
           {mode === 'focus' ? 'Deep Work' : 'Rest & Recharge'}
        </h2>
      </div>

      {/* Circular Timer */}
      <div className="relative z-10 mb-16">
        
        <svg className="transform -rotate-90 w-[300px] h-[300px] drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#1A1D26"
            strokeWidth="20"
            fill="#0F1115"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#1E222B"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke={mode === 'focus' ? "url(#gradient)" : '#10B981'}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-md">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-[#A78BFA] mt-2 font-semibold uppercase tracking-widest">{isActive ? 'Active' : 'Paused'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-8 z-10 items-center">
        <button
          onClick={resetTimer}
          className="p-5 rounded-full bg-[#1A1D26] text-slate-400 hover:text-white shadow-lg border border-white/5 transition-all hover:border-white/20"
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={toggleTimer}
          className={`p-8 rounded-[2rem] text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95 transition-all border border-white/10 ${mode === 'focus' ? 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9]' : 'bg-emerald-600'}`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default FocusView;