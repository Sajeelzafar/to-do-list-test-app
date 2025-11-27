import React from 'react';
import { Task, Priority } from '../types';
import { CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDeleteTask: (id: string) => void;
  compact?: boolean;
  variant?: 'default' | 'featured';
}

// Dark theme optimized priority colors
const priorityConfig = {
  [Priority.Do]: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  [Priority.Schedule]: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  [Priority.Delegate]: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  [Priority.Delete]: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDeleteTask, compact, variant = 'default' }) => {
  const pConfig = priorityConfig[task.priority];

  if (variant === 'featured') {
    return (
      <article className="flex flex-col p-5 bg-[#1E222B]/80 backdrop-blur-sm rounded-[1.5rem] shadow-lg border border-white/5 h-full relative group transition-all hover:-translate-y-1 hover:border-[#8B5CF6]/30">
         <div className="flex justify-between items-start mb-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${pConfig.bg} ${pConfig.color} border ${pConfig.border} uppercase tracking-wide`}>
              {task.priority}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
              className="text-slate-500 hover:text-rose-400 transition-colors focus:outline-none"
              aria-label={`Delete task: ${task.title}`}
            >
               <Trash2 size={16} />
            </button>
         </div>
         
         <h4 className="text-base font-bold text-slate-100 line-clamp-2 mb-4 flex-1">
           {task.title}
         </h4>

         <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
            {task.dueDate && (
               <div className="flex items-center text-slate-400 text-xs font-medium">
                  <Calendar size={14} className="mr-1" aria-hidden="true" />
                  {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            )}
            <button 
              onClick={() => onToggle(task.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[#2A2E3B] text-slate-400 hover:bg-[#8B5CF6] hover:text-white border border-white/5"
              aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
               {task.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
         </div>
      </article>
    );
  }

  return (
    <div className={`group relative flex items-center p-4 bg-[#1E222B]/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/5 transition-all duration-200 hover:bg-[#1E222B] hover:border-[#8B5CF6]/20 ${task.isCompleted ? 'opacity-50' : ''}`}>
      
      <button 
        onClick={() => onToggle(task.id)}
        className="mr-3 text-slate-500 hover:text-[#8B5CF6] transition-colors shrink-0"
        aria-label={task.isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
      >
        {task.isCompleted ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold truncate ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </h4>
        {!compact && (
          <div className="flex items-center gap-2 mt-1">
            {task.dueDate && (
              <span className="flex items-center text-[10px] text-slate-400 font-medium">
                <Calendar size={10} className="mr-1" aria-hidden="true" />
                {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${pConfig.color.replace('text-', 'bg-')}`} aria-hidden="true"></div>
            <span className="text-[10px] text-slate-500 capitalize">{task.priority}</span>
          </div>
        )}
      </div>

      <button 
        onClick={() => onDeleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition-all"
        aria-label={`Delete task: ${task.title}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default TaskCard;