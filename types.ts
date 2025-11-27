export enum Tab {
  Chat = 'chat',
  Timeline = 'timeline',
  Focus = 'focus',
  Matrix = 'matrix'
}

export enum Priority {
  Do = 'do',         // Urgent & Important
  Schedule = 'schedule', // Not Urgent & Important
  Delegate = 'delegate', // Urgent & Not Important
  Delete = 'delete'    // Not Urgent & Not Important
}

export type AgentMode = 'pomodoro' | 'matrix' | 'gtd' | 'bullet';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: Date;
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
}

export interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  messages: Message[];
  activeTab: Tab;
}

// Gemini Tool Arguments
export interface CreateTaskArgs {
  title: string;
  priority?: Priority;
  dueDate?: string; // ISO string
}

export interface CreateEventArgs {
  title: string;
  startTime: string; // ISO string
  durationMinutes?: number;
}