import React, { useState, useRef, useEffect } from 'react';
import { Message, Task, AgentMode } from '../types';
import { Send, Mic, Sparkles, MoreHorizontal, PenLine, CalendarDays, Timer, Lightbulb, Paperclip, ArrowRight, CheckCircle2, List, LayoutGrid, ChevronDown, Zap } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  recentTasks: Task[];
  onSendMessage: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isProcessing: boolean;
  agentMode: AgentMode | null;
  onSelectMode: (mode: AgentMode | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  agentMode,
  onSelectMode
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, agentMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !agentMode) return;
    onSendMessage(input);
    setInput('');
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const agents = [
    {
      id: 'pomodoro',
      title: 'Focus Flow',
      desc: 'Deep work & Intervals',
      icon: <Timer size={24} />,
      gradient: 'from-emerald-500/20 to-teal-500/5',
      border: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
      bgActive: 'bg-emerald-500',
    },
    {
      id: 'matrix',
      title: 'Priority Master',
      desc: 'Urgent vs Important',
      icon: <LayoutGrid size={24} />,
      gradient: 'from-rose-500/20 to-orange-500/5',
      border: 'hover:border-rose-500/50',
      iconColor: 'text-rose-400',
      bgActive: 'bg-rose-500',
    },
    {
      id: 'gtd',
      title: 'Clear Mind',
      desc: 'Capture & Organize',
      icon: <CheckCircle2 size={24} />,
      gradient: 'from-blue-500/20 to-indigo-500/5',
      border: 'hover:border-blue-500/50',
      iconColor: 'text-blue-400',
      bgActive: 'bg-blue-500',
    },
    {
      id: 'bullet',
      title: 'Rapid Log',
      desc: 'Journaling & Notes',
      icon: <List size={24} />,
      gradient: 'from-amber-500/20 to-yellow-500/5',
      border: 'hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      bgActive: 'bg-amber-500',
    }
  ];

  // Configuration for different agent modes
  const agentConfig = {
    pomodoro: {
      greeting: "Ready for deep work?",
      subtext: "Let's break it down.",
      actions: [
        { icon: <Timer size={16} />, label: "Start 25m Timer", prompt: "Start a 25 minute focus timer" },
        { icon: <List size={16} />, label: "Plan Session", prompt: "I need to plan a deep work session for..." },
        { icon: <Zap size={16} />, label: "Quick Task", prompt: "Add a quick task: " },
      ]
    },
    matrix: {
      greeting: "Let's Prioritize.",
      subtext: "Urgent or Important?",
      actions: [
        { icon: <LayoutGrid size={16} />, label: "Review Matrix", prompt: "Review my tasks and help me prioritize" },
        { icon: <PenLine size={16} />, label: "Add Task", prompt: "Add a task to my list" },
        { icon: <Lightbulb size={16} />, label: "Decide", prompt: "Help me decide what to do next" },
      ]
    },
    gtd: {
      greeting: "Clear your mind.",
      subtext: "Capture everything.",
      actions: [
        { icon: <PenLine size={16} />, label: "Brain Dump", prompt: "I want to do a brain dump of tasks" },
        { icon: <ArrowRight size={16} />, label: "Next Action", prompt: "What is my next physical action?" },
        { icon: <List size={16} />, label: "Review List", prompt: "Let's review my open loops" },
      ]
    },
    bullet: {
      greeting: "Rapid Log.",
      subtext: "Track the past, order the present.",
      actions: [
        { icon: <PenLine size={16} />, label: "Log Entry", prompt: "Log a note: " },
        { icon: <CalendarDays size={16} />, label: "Today's Log", prompt: "Show me today's log" },
        { icon: <CheckCircle2 size={16} />, label: "Migrate", prompt: "Help me migrate unfinished tasks" },
      ]
    }
  };

  const showHome = !agentMode || (messages.length === 0);
  const activeAgent = agents.find(a => a.id === agentMode);

  return (
    <section className="flex flex-col h-full relative font-sans" aria-label="Chat Interface">
      
      {/* Top Header */}
      <header className="absolute top-0 left-0 w-full pt-12 px-6 pb-4 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
           {agentMode ? (
             <button 
               onClick={() => onSelectMode(null)}
               className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
             >
               <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/10 bg-[#1A1D26] ${activeAgent?.iconColor}`}>
                 {React.cloneElement(activeAgent?.icon as React.ReactElement, { size: 14 })}
               </div>
               <span className="font-bold text-sm">{activeAgent?.title}</span>
               <ChevronDown size={12} className="opacity-50 group-hover:opacity-100" />
             </button>
           ) : (
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight">DayFlow</span>
             </div>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10" id="chat-scroller">
        <div className="min-h-full flex flex-col pt-20 pb-48 px-6">
          
          {showHome ? (
            <div className="my-auto flex flex-col items-center w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
               {!agentMode ? (
                 <>
                    {/* Launchpad State */}
                    <div className="text-center mb-10">
                      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-4 tracking-tighter">
                        DayFlow
                      </h1>
                      <p className="text-slate-400 font-medium text-lg">
                        Select your productivity engine
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => onSelectMode(agent.id as AgentMode)}
                          className={`
                            group relative flex flex-col items-center justify-center p-6 
                            bg-gradient-to-br ${agent.gradient} 
                            bg-[#1A1D26] border border-white/5 rounded-[2rem] 
                            transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${agent.border}
                          `}
                        >
                           <div className={`mb-4 transition-colors duration-300 ${agent.iconColor} group-hover:scale-110 transform`}>
                              {agent.icon}
                           </div>
                           <h3 className="text-sm font-bold text-slate-200 mb-1">{agent.title}</h3>
                           <p className="text-[10px] text-slate-500 font-medium text-center">{agent.desc}</p>
                        </button>
                      ))}
                    </div>
                 </>
               ) : (
                 <>
                  {/* Agent Active Empty State */}
                   <div className="flex flex-col items-center text-center mb-8">
                     <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-[#1A1D26] to-[#252932] mb-6 p-1 shadow-2xl border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr ${activeAgent?.gradient}`} />
                        <div className={`relative z-10 ${activeAgent?.iconColor}`}>
                          {React.cloneElement(activeAgent?.icon as React.ReactElement, { size: 40 })}
                        </div>
                     </div>
                     <h1 className="text-3xl font-bold text-white leading-tight mb-2 tracking-tight">
                       {agentConfig[agentMode].greeting}
                     </h1>
                     <h2 className="text-slate-400 font-medium">
                       {agentConfig[agentMode].subtext}
                     </h2>
                   </div>
                 </>
               )}
            </div>
          ) : (
            /* Chat Stream */
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full animate-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0 shadow-lg ${activeAgent?.bgActive || 'bg-violet-500'}`}>
                      <Sparkles size={14} className="text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-4 text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-white text-black rounded-[1.5rem] rounded-br-sm font-medium'
                        : 'bg-[#1A1D26] text-slate-200 rounded-[1.5rem] rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start animate-in fade-in duration-300">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 shadow-lg ${activeAgent?.bgActive || 'bg-violet-500'}`}>
                      <Sparkles size={14} className="text-white" />
                   </div>
                   <div className="bg-[#1A1D26] px-5 py-3 rounded-[1.5rem] rounded-bl-sm flex items-center space-x-1 border border-white/5">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className={`absolute left-0 w-full px-6 z-30 transition-all duration-500 ease-out ${agentMode ? 'bottom-24' : 'bottom-6'}`}>
        
        {/* Suggestion Chips (Only show when agent selected & no messages) */}
        {showHome && agentMode && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1 mask-linear-fade">
             {agentConfig[agentMode].actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1A1D26]/90 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-white hover:text-black hover:border-white transition-all whitespace-nowrap shadow-lg active:scale-95"
                >
                  {action.icon}
                  {action.label}
                </button>
             ))}
          </div>
        )}

        {/* Input Bar */}
        <div className={`relative group transition-all duration-500 ${!agentMode ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <form 
            onSubmit={handleSubmit} 
            className="relative flex items-center bg-[#1A1D26] p-2 pl-5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 transition-all focus-within:border-white/20 focus-within:bg-[#20242F]"
          >
              <button type="button" className="p-2 text-slate-500 hover:text-white transition-colors focus:outline-none" aria-label="Attach">
                <Paperclip size={20} />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agentMode ? `Talk to ${activeAgent?.title}...` : ""}
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base font-medium h-12 px-2"
              />
              
              <div className="flex items-center gap-1">
                {input.trim() ? (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-10 h-10 flex items-center justify-center text-white rounded-full shadow-lg transition-transform active:scale-90 focus:outline-none ${activeAgent?.bgActive || 'bg-violet-500'}`}
                    aria-label="Send message"
                  >
                    <Send size={18} fill="currentColor" className="ml-0.5" />
                  </button>
                ) : (
                   <button
                    type="button"
                    onClick={startListening}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all focus:outline-none ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#252836] text-slate-400 hover:bg-[#2E3242] hover:text-white'}`}
                    aria-label="Voice input"
                  >
                    <Mic size={20} />
                  </button>
                )}
              </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;