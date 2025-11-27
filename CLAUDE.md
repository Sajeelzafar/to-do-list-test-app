# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DayFlow is an AI-powered productivity planner with multiple agent modes built with React, TypeScript, Vite, and Google Gemini AI. The app features a mobile-first design (375x812px) that combines productivity methodologies with conversational AI.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Setup
Create a `.env.local` file and set your `GEMINI_API_KEY`:
```
GEMINI_API_KEY=your_api_key_here
```

## Architecture

### Core State Management (App.tsx)
The App component is the central state manager that:
- Manages all application state (tasks, events, messages, activeTab, agentMode)
- Orchestrates communication between UI components and Gemini AI service
- Implements dynamic tab visibility based on selected agent mode
- Handles all CRUD operations for tasks and events
- Processes Gemini function calls to update state

### Agent Mode System
Four productivity methodologies implemented as distinct "agent modes":
- **Pomodoro (Focus Flow)**: Deep work with timed intervals. Shows Chat, Focus, Timeline tabs
- **Matrix (Priority Master)**: Eisenhower Matrix prioritization. Shows Chat, Matrix, Timeline tabs
- **GTD (Clear Mind)**: Getting Things Done methodology. Shows Chat, Timeline tabs
- **Bullet (Rapid Log)**: Bullet journaling. Shows Chat, Timeline tabs

Agent selection happens in ChatInterface and determines:
- Available navigation tabs (via `getVisibleTabs()` in App.tsx)
- System instructions sent to Gemini (in geminiService.ts)
- Visual theme and suggested actions

### Gemini Integration (services/geminiService.ts)
Implements function calling pattern with Google Gemini AI:
- **Function Declarations**: `createTask`, `updateTask`, `createEvent`, `startFocusTimer`
- **System Instructions**: Each agent mode has unique persona and behavior rules defined in `getSystemInstruction()`
- **History Management**: Maintains conversation context across messages
- Uses `@google/genai` SDK with `gemini-2.5-flash` model

Function call responses are processed in App.tsx:58-108 to update application state.

### Type System (types.ts)
Central type definitions:
- `AgentMode`: Union type for four agent modes
- `Priority`: Eisenhower Matrix quadrants (Do, Schedule, Delegate, Delete)
- `Task`, `CalendarEvent`, `Message`: Core data structures
- Function call argument interfaces for Gemini tools

### Component Architecture

**ChatInterface**: Primary user interaction component that:
- Renders agent selector (launchpad) when no mode is active
- Shows mode-specific empty state with suggested actions
- Handles message streaming and display
- Implements voice input via Web Speech API
- Dynamically adjusts positioning based on agent mode

**MatrixView**: Eisenhower Matrix visualization (only visible in matrix mode)
- Four quadrant layout for priority-based task organization
- Direct priority editing via drag/dropdown

**TimelineView**: Calendar event display (visible in most modes)

**FocusView**: Pomodoro timer interface (only visible in pomodoro mode)

**TaskCard**: Reusable task display with completion toggle and delete

### Configuration & Build

**vite.config.ts**:
- Injects `GEMINI_API_KEY` from environment as `process.env.API_KEY`
- Configured for React with port 3000
- Path alias `@/` points to project root

**tsconfig.json**:
- ES2022 target with experimental decorators enabled
- React JSX transform
- Path alias `@/*` for cleaner imports

## Key Patterns

### Dynamic Tab Visibility
Tabs are conditionally rendered based on `agentMode`. The `getVisibleTabs()` function in App.tsx:19-33 controls which tabs appear in the navigation dock.

### Function Call Processing
When Gemini returns function calls (App.tsx:55-108):
1. Extract function name and arguments from response
2. Match function name to corresponding action
3. Update application state (tasks, events, activeTab)
4. Generate user-facing response text
5. Append model message to chat history

### Environment Variable Handling
The Vite config loads `.env.local` and exposes `GEMINI_API_KEY` as `process.env.API_KEY` in the client bundle. The geminiService uses this at services/geminiService.ts:5.

### Message Flow
1. User types in ChatInterface input
2. `handleSendMessage` in App.tsx formats and sends to Gemini
3. Chat history includes previous messages for context
4. Gemini response includes text and/or function calls
5. Function calls update state, response text added to messages
6. UI re-renders with updated state

## Design System

Mobile-first design with dark theme (#0F1115 background). Uses Tailwind classes with custom color palette:
- Primary backgrounds: `#0F1115`, `#1A1D26`, `#252836`
- Text: white, slate variants
- Agent-specific accent colors: emerald (pomodoro), rose (matrix), blue (gtd), amber (bullet)

Animations use `animate-in` utilities and cubic-bezier easing. Border radius follows Apple-style rounded aesthetic (2rem+).

## External Dependencies

- **@google/genai**: Official Google Gemini SDK for AI function calling
- **lucide-react**: Icon library
- **react**: v19.2.0 (latest)
- **vite**: Build tool and dev server
