import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { X, Clock, Calendar } from 'lucide-react';

interface TimelineViewProps {
  events: CalendarEvent[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [currentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  // Check if two events overlap in time
  const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
    return event1.startTime < event2.endTime && event2.startTime < event1.endTime;
  };

  // Calculate layout for overlapping events
  interface EventLayout {
    column: number;
    totalColumns: number;
  }

  const calculateEventLayouts = (events: CalendarEvent[]): Map<string, EventLayout> => {
    const layouts = new Map<string, EventLayout>();
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Group overlapping events
    const groups: CalendarEvent[][] = [];

    sortedEvents.forEach(event => {
      let placed = false;

      // Try to add to an existing group
      for (const group of groups) {
        const overlapsWithGroup = group.some(e => eventsOverlap(e, event));
        if (overlapsWithGroup) {
          group.push(event);
          placed = true;
          break;
        }
      }

      // Create a new group if not placed
      if (!placed) {
        groups.push([event]);
      }
    });

    // Assign columns within each group
    groups.forEach(group => {
      const columns: CalendarEvent[][] = [];

      group.forEach(event => {
        // Find the first column where this event fits
        let columnIndex = 0;
        for (let i = 0; i < columns.length; i++) {
          const hasOverlap = columns[i].some(e => eventsOverlap(e, event));
          if (!hasOverlap) {
            columnIndex = i;
            break;
          }
          columnIndex = i + 1;
        }

        // Create column if it doesn't exist
        if (!columns[columnIndex]) {
          columns[columnIndex] = [];
        }
        columns[columnIndex].push(event);

        layouts.set(event.id, {
          column: columnIndex,
          totalColumns: Math.max(columns.length, (layouts.get(event.id)?.totalColumns || 0))
        });
      });

      // Update totalColumns for all events in the group
      const totalColumns = columns.length;
      group.forEach(event => {
        const layout = layouts.get(event.id);
        if (layout) {
          layout.totalColumns = totalColumns;
        }
      });
    });

    return layouts;
  };

  const getEventStyle = (event: CalendarEvent, layout?: EventLayout) => {
    const startHour = event.startTime.getHours();
    const startMin = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMin = event.endTime.getMinutes();

    const startOffset = (startHour - 8) * 60 + startMin;
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    const baseStyle = {
      top: `${startOffset * 1.5}px`,
      height: `${duration * 1.5}px`
    };

    if (layout) {
      const widthPercent = (95 / layout.totalColumns);
      const leftOffset = (widthPercent * layout.column) + 1;
      return {
        ...baseStyle,
        width: `${widthPercent}%`,
        left: `${leftOffset}%`
      };
    }

    return {
      ...baseStyle,
      width: '95%',
      left: '1%'
    };
  };

  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const nextEvent = sortedEvents.find(e => e.startTime > new Date());
  const timeUntilNext = nextEvent ? Math.max(0, Math.floor((nextEvent.startTime.getTime() - new Date().getTime()) / 60000)) : null;

  // Calculate layouts for all events to handle overlaps
  const eventLayouts = calculateEventLayouts(events);

  return (
    <div className="flex flex-col h-full pt-10 px-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-white">Timeline</h2>
           <p className="text-sm text-slate-400 font-medium">{currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</p>
        </div>
        <div className="flex bg-[#1A1D26] rounded-xl p-1 shadow-sm border border-white/5">
          <button 
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Day
          </button>
          <button 
             onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Countdown Card */}
      {nextEvent && (
        <div className="mb-6 p-6 rounded-[2rem] bg-gradient-to-r from-[#1A1D26] to-[#242936] shadow-lg border border-white/5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7C3AED]"></div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div>
            <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-1 block">Up Next</span>
            <h3 className="font-bold text-lg text-white">{nextEvent.title}</h3>
          </div>
          <div className="text-right z-10">
             <div className="text-3xl font-bold text-white leading-none">{timeUntilNext}</div>
             <div className="text-xs text-slate-400 font-medium">min remaining</div>
          </div>
        </div>
      )}

      {/* Calendar Strip */}
      <div className="flex justify-between mb-4 px-1">
        {Array.from({length: 5}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - d.getDay() + 1 + i);
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={i} className={`flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1`}>
              <span className={`text-[10px] uppercase font-bold mb-2 ${isToday ? 'text-[#A78BFA]' : 'text-slate-500'}`}>{d.toLocaleDateString(undefined, {weekday: 'short'})}</span>
              <div className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold transition-all ${isToday ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-[#1A1D26] text-slate-400 border border-white/5 hover:border-[#7C3AED]/30'}`}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-[#1A1D26]/60 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.2)] border-t border-l border-r border-white/5 p-6 pb-36 -mx-6">
        <div className="absolute top-6 left-6 right-6 h-[1200px]">
           {hours.map(hour => (
             <div key={hour} className="flex items-start h-[90px] w-full border-t border-white/5">
               <span className="text-xs text-slate-500 font-medium w-12 -mt-2.5 bg-transparent pr-2">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
             </div>
           ))}

           {/* Events Layer */}
           <div className="absolute top-0 left-12 right-0 bottom-0">
              {events.map(event => {
                const layout = eventLayouts.get(event.id);
                const style = getEventStyle(event, layout);
                return (
                  <div
                    key={event.id}
                    style={style}
                    onClick={() => setSelectedEvent(event)}
                    className="absolute rounded-2xl bg-gradient-to-br from-[#7C3AED]/30 to-[#6D28D9]/20 border-l-4 border-[#7C3AED] p-3 overflow-hidden hover:bg-[#7C3AED]/40 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="text-sm font-bold text-white group-hover:text-white/90 truncate">{event.title}</div>
                    <div className="text-xs text-slate-300 font-medium mt-1 truncate">
                      {event.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} -
                      {event.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                )
              })}
           </div>

           {/* Current Time Line */}
           <div
             className="absolute left-12 right-0 border-t-2 border-dashed border-[#A78BFA] z-10 flex items-center shadow-[0_0_10px_rgba(167,139,250,0.5)]"
             style={{ top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * 1.5}px` }}
           >
             <div className="w-2 h-2 rounded-full bg-[#A78BFA] -ml-1 shadow-[0_0_10px_rgba(167,139,250,1)] ring-2 ring-[#7C3AED]/30"></div>
           </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-[#1A1D26] rounded-[2rem] border border-white/10 shadow-2xl max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-white/5">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-white leading-tight break-words">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#252836] text-slate-400 hover:bg-[#2E3242] hover:text-white transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Time Information */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Time</div>
                  <div className="text-sm text-slate-200 font-medium">
                    {selectedEvent.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} -
                    {selectedEvent.endTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Duration: {Math.round((selectedEvent.endTime.getTime() - selectedEvent.startTime.getTime()) / 60000)} minutes
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Date</div>
                  <div className="text-sm text-slate-200 font-medium">
                    {selectedEvent.startTime.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Description (if available) */}
              {selectedEvent.description && (
                <div className="pt-4 border-t border-white/5">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Description</div>
                  <div className="text-sm text-slate-300 leading-relaxed break-words">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;