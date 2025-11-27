import React, { useState } from 'react';
import { Tab, Task, Message, CalendarEvent, Priority, AgentMode } from './types';
import { MessageSquare, LayoutGrid, Timer, Calendar } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import TimelineView from './components/TimelineView';
import FocusView from './components/FocusView';
import MatrixView from './components/MatrixView';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Chat);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode | null>(null);

  // Dynamic Tab Logic
  const getVisibleTabs = (mode: AgentMode | null): Tab[] => {
    if (!mode) return [Tab.Chat];
    switch (mode) {
      case 'pomodoro':
        return [Tab.Chat, Tab.Focus, Tab.Timeline];
      case 'matrix':
        return [Tab.Chat, Tab.Matrix, Tab.Timeline];
      case 'gtd':
      case 'bullet':
        // GTD and Bullet focus on lists/logging, Timeline is relevant, specialized views are not
        return [Tab.Chat, Tab.Timeline];
      default:
        return [Tab.Chat];
    }
  };

  const handleModeSelect = (mode: AgentMode | null) => {
    setAgentMode(mode);
    setActiveTab(Tab.Chat); // Always reset to chat when switching modes
  };
  
  const handleSendMessage = async (text: string) => {
    if (!agentMode) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const chatHistory = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      
      const response = await sendMessageToGemini(chatHistory, text, agentMode);
      
      // Fix: Use SDK accessors response.functionCalls and response.text
      let responseText = "";

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          if (fc.name === 'createTask') {
            const args = fc.args as any;
            const newTask: Task = {
              id: Date.now().toString() + Math.random(),
              title: args.title,
              isCompleted: false,
              priority: (args.priority as Priority) || Priority.Do,
              dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
              subtasks: args.subtasks ? args.subtasks.map((st: string) => ({
                id: Math.random().toString(),
                title: st,
                isCompleted: false
              })) : []
            };
            // console.log('Creating task:', newTask.title, 'with priority:', newTask.priority, 'Priority.Do:', Priority.Do);
            setTasks(prev => [newTask, ...prev]);
            responseText = `Added "${newTask.title}" to your list.`;
          } 
          else if (fc.name === 'updateTask') {
            const args = fc.args as any;
            const taskIndex = tasks.findIndex(t => t.title.toLowerCase().includes(args.searchTitle.toLowerCase()));
            
            if (taskIndex > -1) {
              const updatedTasks = [...tasks];
              const task = updatedTasks[taskIndex];
              
              if (args.isCompleted !== undefined) task.isCompleted = args.isCompleted;
              if (args.priority) task.priority = args.priority;
              
              setTasks(updatedTasks);
              responseText = `Updated "${task.title}".`;
            } else {
              responseText = `I couldn't find a task matching "${args.searchTitle}".`;
            }
          }
          else if (fc.name === 'createEvent') {
            const args = fc.args as any;
            const newEvent: CalendarEvent = {
               id: Date.now().toString(),
               title: args.title,
               startTime: new Date(args.startTime),
               endTime: new Date(new Date(args.startTime).getTime() + (args.durationMinutes || 60) * 60000)
            };
            setEvents(prev => [...prev, newEvent]);
            responseText = `Scheduled "${newEvent.title}" for ${newEvent.startTime.toLocaleTimeString()}.`;
          }
          else if (fc.name === 'startFocusTimer') {
             setActiveTab(Tab.Focus);
             const mins = (fc.args as any).minutes || 25;
             responseText = `Starting focus timer for ${mins} minutes. Good luck!`;
          }
          else if (fc.name === 'rescheduleEvent') {
            const args = fc.args as any;
            const eventIndex = events.findIndex(e => e.title.toLowerCase().includes(args.searchTitle.toLowerCase()));

            if (eventIndex > -1) {
              const updatedEvents = [...events];
              const event = updatedEvents[eventIndex];
              const oldStartTime = event.startTime;

              // Calculate original duration if not provided
              const originalDuration = (event.endTime.getTime() - event.startTime.getTime()) / 60000;
              const newDuration = args.durationMinutes || originalDuration;

              // Update the event times
              event.startTime = new Date(args.newStartTime);
              event.endTime = new Date(event.startTime.getTime() + newDuration * 60000);

              setEvents(updatedEvents);
              responseText = `Rescheduled "${event.title}" from ${oldStartTime.toLocaleTimeString()} to ${event.startTime.toLocaleTimeString()}.`;
            } else {
              responseText = `I couldn't find an event matching "${args.searchTitle}".`;
            }
          }
        }
      } 
      
      if (response.text) {
        responseText = responseText ? `${responseText} ${response.text}` : response.text;
      }

      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: responseText || "Done.", timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Sorry, I encountered an error connecting to the agent.', timestamp: new Date() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskPriority = (id: string, newPriority: Priority) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, priority: newPriority };
      }
      return t;
    }));
  };

  const visibleTabs = getVisibleTabs(agentMode);

  return (
    <div className="w-[375px] h-[812px] bg-[#0F1115] rounded-[3rem] shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col font-sans ring-8 ring-[#080808] border border-[#1F1D2B]">
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-0" id="main-content">
        {activeTab === Tab.Chat && (
          <ChatInterface 
            messages={messages} 
            recentTasks={tasks} 
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            agentMode={agentMode}
            onSelectMode={handleModeSelect}
          />
        )}
        {activeTab === Tab.Timeline && <TimelineView events={events} />}
        {activeTab === Tab.Focus && <FocusView />}
        {activeTab === Tab.Matrix && (
          <MatrixView 
            tasks={tasks} 
            onToggleTask={toggleTask} 
            onDeleteTask={deleteTask} 
            onUpdatePriority={updateTaskPriority}
          />
        )}
      </main>

      {/* Navigation - Dynamic Floating Dock */}
      {agentMode && (
        <nav 
          aria-label="Main Navigation"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1D26] p-2 rounded-[2.5rem] flex items-center gap-2 z-40 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] border border-white/5 animate-in slide-in-from-bottom-10 fade-in duration-500"
        >
          {visibleTabs.map(tab => {
            let icon: React.ReactNode;
            let label: string;
            
            switch(tab) {
              case Tab.Chat: icon = <MessageSquare size={22} className={activeTab === tab ? "fill-current" : ""} />; label = "Chat"; break;
              case Tab.Matrix: icon = <LayoutGrid size={22} className={activeTab === tab ? "fill-current" : ""} />; label = "Matrix"; break;
              case Tab.Timeline: icon = <Calendar size={22} className={activeTab === tab ? "fill-current" : ""} />; label = "Plan"; break;
              case Tab.Focus: icon = <Timer size={22} className={activeTab === tab ? "fill-current" : ""} />; label = "Focus"; break;
              default: icon = <MessageSquare size={22} />; label = "Tab";
            }

            return (
              <NavButton 
                key={tab}
                icon={icon} 
                isActive={activeTab === tab} 
                onClick={() => setActiveTab(tab)} 
                label={label}
              />
            );
          })}
        </nav>
      )}
    </div>
  );
};

// Fix: Define Props interface and use React.FC to handle 'key' prop correctly
interface NavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, isActive, onClick, label }) => (
  <button 
    onClick={onClick}
    aria-label={label}
    aria-pressed={isActive}
    className={`
      relative flex items-center justify-center h-14 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      ${isActive 
        ? 'bg-white text-black px-6 w-auto shadow-lg scale-100' 
        : 'bg-[#252836] text-[#64748B] w-14 hover:bg-[#2E3242] hover:text-slate-200'
      }
    `}
  >
    <span className="shrink-0 z-10 flex items-center justify-center">
      {icon}
    </span>
    
    <span 
      className={`
        whitespace-nowrap font-bold text-sm overflow-hidden transition-all duration-300 ease-out
        ${isActive ? 'w-auto ml-2 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-2'}
      `}
    >
      {label}
    </span>
  </button>
);

export default App;