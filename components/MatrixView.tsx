import React, { useState } from 'react';
import { Task, Priority } from '../types';
import TaskCard from './TaskCard';

interface MatrixViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePriority: (id: string, newPriority: Priority) => void;
}

// Separate Quadrant Component to handle Drag state independently
const Quadrant = ({ 
  title, 
  priority, 
  tasks, 
  colorClass, 
  label, 
  bgClass, 
  onToggleTask, 
  onDeleteTask, 
  onUpdatePriority,
  activeBorderClass
}: { 
  title: string, 
  priority: Priority, 
  tasks: Task[], 
  colorClass: string, 
  label: string, 
  bgClass: string,
  onToggleTask: (id: string) => void,
  onDeleteTask: (id: string) => void,
  onUpdatePriority: (id: string, p: Priority) => void,
  activeBorderClass: string
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onUpdatePriority(taskId, priority);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full bg-[#1A1D26]/60 backdrop-blur-md rounded-[2rem] p-4 border shadow-sm overflow-hidden relative transition-colors duration-200 ${isOver ? activeBorderClass + ' bg-[#1A1D26]' : 'border-white/5'}`}
    >
      {/* Decorative background accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgClass} opacity-5 rounded-bl-[4rem] -mr-4 -mt-4 pointer-events-none`}></div>
      
      <div className={`flex items-center justify-between mb-4 pb-2 border-b border-white/5`}>
        <div>
            <h3 className={`font-bold text-base ${colorClass}`}>{title}</h3>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2 pb-2">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-medium text-center px-4 pointer-events-none">
             Drop items here
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
                <div 
                  key={task.id} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="scale-95 origin-top-left w-[105%] cursor-move active:opacity-50"
                >
                    <TaskCard task={task} onToggle={onToggleTask} onDeleteTask={onDeleteTask} compact />
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MatrixView: React.FC<MatrixViewProps> = ({ tasks, onToggleTask, onDeleteTask, onUpdatePriority }) => {

  console.log('MatrixView - Total tasks received:', tasks.length, tasks.map(t => ({ title: t.title, priority: t.priority, completed: t.isCompleted })));

  const getTasksByPriority = (p: Priority) => {
    const filtered = tasks.filter(t => t.priority === p && !t.isCompleted);
    console.log(`MatrixView - Priority ${p}:`, filtered.length, 'tasks', filtered.map(t => ({ title: t.title, priority: t.priority })));
    return filtered;
  };

  return (
    <div className="h-full pt-12 px-6 pb-32 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Priority Matrix</h2>
        <p className="text-sm text-slate-400 font-medium">Drag and drop to prioritize</p>
      </div>
      
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
        {/* Q1: Do First */}
        <Quadrant 
          title="Do First" 
          priority={Priority.Do} 
          tasks={getTasksByPriority(Priority.Do)}
          colorClass="text-rose-400" 
          bgClass="bg-rose-500"
          activeBorderClass="border-rose-500/50 ring-2 ring-rose-500/20"
          label="Urgent & Important"
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdatePriority={onUpdatePriority}
        />

        {/* Q2: Schedule */}
        <Quadrant 
          title="Schedule" 
          priority={Priority.Schedule} 
          tasks={getTasksByPriority(Priority.Schedule)}
          colorClass="text-blue-400" 
          bgClass="bg-blue-500"
          activeBorderClass="border-blue-500/50 ring-2 ring-blue-500/20"
          label="Not Urgent, Important"
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdatePriority={onUpdatePriority}
        />

        {/* Q3: Delegate */}
        <Quadrant 
          title="Delegate" 
          priority={Priority.Delegate} 
          tasks={getTasksByPriority(Priority.Delegate)}
          colorClass="text-amber-400" 
          bgClass="bg-amber-500"
          activeBorderClass="border-amber-500/50 ring-2 ring-amber-500/20"
          label="Urgent, Not Important"
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdatePriority={onUpdatePriority}
        />

        {/* Q4: Delete/Backlog */}
        <Quadrant 
          title="Eliminate" 
          priority={Priority.Delete} 
          tasks={getTasksByPriority(Priority.Delete)}
          colorClass="text-slate-400" 
          bgClass="bg-slate-500"
          activeBorderClass="border-slate-500/50 ring-2 ring-slate-500/20"
          label="Neither"
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onUpdatePriority={onUpdatePriority}
        />
      </div>
    </div>
  );
};

export default MatrixView;