import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { CreateTaskArgs, CreateEventArgs, Priority, AgentMode } from "../types";

// We need to parse the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Tool Definitions
const createTaskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Create a new to-do item or task. Use this when the user wants to add something to their list. Can include subtasks.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The content of the task (e.g., "Buy milk", "Finish report")',
      },
      priority: {
        type: Type.STRING,
        enum: [Priority.Do, Priority.Schedule, Priority.Delegate, Priority.Delete],
        description: 'The urgency/importance quadrant. Default to "do" (Do First - Urgent & Important) if unsure.',
      },
      dueDate: {
        type: Type.STRING,
        description: 'ISO 8601 date string if a specific date is mentioned.',
      },
      subtasks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of subtasks if provided (e.g. ["Buy milk", "Buy eggs"]).'
      }
    },
    required: ['title'],
  },
};

const updateTaskTool: FunctionDeclaration = {
  name: 'updateTask',
  description: 'Update a task status (complete/incomplete) or priority. Use title or partial title to identify the task.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: { type: Type.STRING, description: 'The title (or part of it) to find the task.' },
      isCompleted: { type: Type.BOOLEAN, description: 'True to mark done, false to uncheck.' },
      priority: { type: Type.STRING, enum: [Priority.Do, Priority.Schedule, Priority.Delegate, Priority.Delete] },
    },
    required: ['searchTitle'],
  },
};

const createEventTool: FunctionDeclaration = {
  name: 'createEvent',
  description: 'Schedule a calendar event with a specific time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Title of the event',
      },
      startTime: {
        type: Type.STRING,
        description: 'ISO 8601 start time.',
      },
      durationMinutes: {
        type: Type.NUMBER,
        description: 'Duration in minutes. Default to 60 if not specified.',
      },
    },
    required: ['title', 'startTime'],
  },
};

const startTimerTool: FunctionDeclaration = {
  name: 'startFocusTimer',
  description: 'Start the focus/pomodoro timer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      minutes: {
        type: Type.NUMBER,
        description: 'Duration in minutes (default 25)',
      },
    },
  },
};

const rescheduleEventTool: FunctionDeclaration = {
  name: 'rescheduleEvent',
  description: 'Reschedule an existing calendar event to a new time. Use the event title or partial title to identify which event to reschedule.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      searchTitle: {
        type: Type.STRING,
        description: 'The title (or part of it) of the event to reschedule.',
      },
      newStartTime: {
        type: Type.STRING,
        description: 'The new ISO 8601 start time for the event.',
      },
      durationMinutes: {
        type: Type.NUMBER,
        description: 'Optional: New duration in minutes. If not provided, keeps the original duration.',
      },
    },
    required: ['searchTitle', 'newStartTime'],
  },
};

const tools: Tool[] = [{
  functionDeclarations: [createTaskTool, updateTaskTool, createEventTool, startTimerTool, rescheduleEventTool]
}];

const getSystemInstruction = (mode: AgentMode) => {
  const date = new Date().toISOString();

  const baseInstruction = `You are DayFlow, a specialized AI productivity assistant. Current time: ${date}.
  Your capabilities: Manage tasks (Create, Update, Delete), Schedule Events, Reschedule Events, and Start Focus Timers.`;

  const personas: Record<AgentMode, string> = {
    pomodoro: `
      ROLE: POMODORO COACH
      Goal: Maximize deep work and prevent burnout through intervals.
      Behavior:
      1. Always encourage breaking work into 25-minute chunks.
      2. If the user adds a large task, ask if they want to break it down or start a timer immediately.
      3. Discourage multitasking. If they try to do two things, politely ask them to pick one.
      4. Keep responses motivating, short, and action-oriented.
      5. Use the 'startFocusTimer' tool aggressively when the user implies they are ready to work.
    `,
    matrix: `
      ROLE: EISENHOWER ARCHITECT
      Goal: Ruthless prioritization based on Urgency and Importance.
      Behavior:
      1. For every task added, you MUST determine its Quadrant (Do, Schedule, Delegate, Delete).
      2. If the user does not provide enough info, ASK: "Is this urgent? Is it important?"
      3. Do not let the user clutter their "Do First" list with trivialities.
      4. Be analytical and strategic. Use the 'priority' field in createTask.
    `,
    gtd: `
      ROLE: GTD (GETTING THINGS DONE) GUIDE
      Goal: Capture, Clarify, Organize, Reflect, Engage.
      Behavior:
      1. Capture phase: Allow the user to dump their brain. Acknowledge quickly.
      2. Clarify: Ask "What is the very next physical action?" for vague tasks.
      3. Contexts: Suggest adding tags like @home, @computer (add to task title).
      4. Be calm, systematic, and organized.
    `,
    bullet: `
      ROLE: RAPID LOGGER (BULLET STYLE)
      Goal: Speed and brevity.
      Behavior:
      1. Speak in bullet points.
      2. Keep responses extremely concise (under 20 words where possible).
      3. Use symbols: [ ] for tasks, O for events, - for notes.
      4. Do not offer long explanations. Just log it and confirm.
      5. "Task 'Buy Milk' added." is a perfect response.
    `
  };

  return `${baseInstruction}\n\n${personas[mode] || personas.matrix}`;
};

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  mode: AgentMode = 'matrix'
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(mode),
        tools: tools,
      },
      history: history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts
        }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};