import React from 'react';
import { AgentMode } from '../types';
import { Timer, LayoutGrid, CheckCircle2, List, ArrowRight } from 'lucide-react';

interface AgentSelectorProps {
  onSelect: (mode: AgentMode) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ onSelect }) => {
  
  const agents = [
    {
      id: 'pomodoro',
      title: 'Focus Flow',
      desc: 'Deep work with timed intervals. Best for executing tasks.',
      icon: <Timer size={24} className="text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
      accent: 'bg-emerald-500'
    },
    {
      id: 'matrix',
      title: 'Priority Master',
      desc: 'Eisenhower Matrix based. Best for decision making.',
      icon: <LayoutGrid size={24} className="text-rose-400" />,
      color: 'hover:border-rose-500/50 hover:bg-rose-500/5',
      accent: 'bg-rose-500'
    },
    {
      id: 'gtd',
      title: 'Clear Mind',
      desc: 'GTD methodology. Best for organizing complexity.',
      icon: <CheckCircle2 size={24} className="text-blue-400" />,
      color: 'hover:border-blue-500/50 hover:bg-blue-500/5',
      accent: 'bg-blue-500'
    },
    {
      id: 'bullet',
      title: 'Rapid Log',
      desc: 'Bullet journal style. Best for quick capture & notes.',
      icon: <List size={24} className="text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-500/5',
      accent: 'bg-amber-500'
    }
  ];

  return (
    <div className="h-full flex flex-col p-6 pt-16 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Choose your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Productivity Engine
          </span>
        </h1>
        <p className="text-slate-400 text-lg">
          How do you want to plan your day?
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-20">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id as AgentMode)}
            className={`relative group flex items-start p-5 rounded-[2rem] bg-[#1A1D26] border border-white/5 text-left transition-all duration-300 ${agent.color}`}
          >
            <div className={`p-3 rounded-2xl bg-[#0F1115] border border-white/5 mr-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              {agent.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-white mb-1 transition-colors">
                {agent.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {agent.desc}
              </p>
            </div>
            <div className={`absolute right-5 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}>
               <ArrowRight size={20} className="text-white/50" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;