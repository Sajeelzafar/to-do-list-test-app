# DayFlow - React Native Android Migration Plan

## Executive Summary

This document outlines the comprehensive plan for converting DayFlow from a React web application to a React Native Android application. The migration involves replacing web-specific APIs, build systems, styling approaches, and UI components while preserving the core business logic and AI functionality.

**Estimated Timeline**: 3-4 weeks for full migration and testing
**Migration Complexity**: Medium-High
**Code Reusability**: ~50% (business logic, types, AI service)
**Code Requiring Replacement**: ~50% (UI components, styling, web APIs)

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Migration Strategy Overview](#2-migration-strategy-overview)
3. [Architectural Decisions](#3-architectural-decisions)
4. [Technology Stack Comparison](#4-technology-stack-comparison)
5. [Detailed Migration Plan](#5-detailed-migration-plan)
6. [Component-by-Component Migration](#6-component-by-component-migration)
7. [API and Service Layer Changes](#7-api-and-service-layer-changes)
8. [Build System and Configuration](#8-build-system-and-configuration)
9. [Testing Strategy](#9-testing-strategy)
10. [Potential Challenges and Risks](#10-potential-challenges-and-risks)
11. [Phase-by-Phase Implementation](#11-phase-by-phase-implementation)
12. [Post-Migration Enhancements](#12-post-migration-enhancements)

---

## 1. Current Architecture Analysis

### 1.1 Application Structure

```
DayFlow Web App
├── Build System: Vite + TypeScript
├── Rendering: ReactDOM (Web)
├── Styling: Tailwind CSS (CDN)
├── State Management: React useState (App.tsx)
├── Navigation: Custom tab system
├── AI Integration: Google Gemini AI (@google/genai)
└── Components: 7 React components + 1 service
```

### 1.2 Key Features

- **Agent Mode System**: 4 productivity modes (Pomodoro, Matrix, GTD, Bullet)
- **AI Chat Interface**: Conversational task management with function calling
- **Voice Input**: Web Speech API for voice commands
- **Focus Timer**: Pomodoro timer with circular SVG progress
- **Priority Matrix**: Drag-and-drop Eisenhower Matrix
- **Timeline View**: Calendar visualization with time slots
- **Real-time Updates**: Streaming AI responses

### 1.3 Web-Specific Dependencies

| Feature | Web Technology | Lines of Code | Migration Priority |
|---------|---------------|---------------|-------------------|
| Voice Input | Web Speech API | ~30 | High |
| Drag & Drop | HTML5 Drag/Drop API | ~50 | High |
| SVG Graphics | Native SVG elements | ~80 | High |
| Styling | Tailwind CSS | ~1400 | Critical |
| Build System | Vite | Config only | Critical |
| Rendering | ReactDOM | ~10 | Critical |
| Animations | CSS transitions | ~100 | Medium |
| Scrolling | ScrollIntoView | ~5 | Low |

---

## 2. Migration Strategy Overview

### 2.1 Migration Approach

**Recommendation: Phased Migration with Parallel Development**

- **Phase 1**: Setup & Core Infrastructure (Week 1)
- **Phase 2**: Component Migration (Week 2)
- **Phase 3**: Feature Parity (Week 3)
- **Phase 4**: Testing & Refinement (Week 4)

### 2.2 Core Principles

1. **Preserve Business Logic**: Keep App.tsx state management and geminiService.ts intact
2. **Progressive Enhancement**: Build basic functionality first, add polish later
3. **Type Safety**: Maintain TypeScript throughout migration
4. **Code Reuse**: Extract and reuse non-UI logic where possible
5. **Platform Optimization**: Leverage Android-specific features where beneficial

### 2.3 What Can Be Reused (50%)

✅ **Directly Reusable**:
- `types.ts` - All TypeScript type definitions (100%)
- `services/geminiService.ts` - AI integration logic (95%, only env var changes)
- Business logic in `App.tsx` (60%, state management and function call processing)
- Data transformation and utility functions

❌ **Requires Complete Replacement**:
- All JSX/HTML rendering code
- Tailwind CSS classes → React Native StyleSheet
- Web APIs (Speech, Drag/Drop, SVG)
- Vite configuration → Metro bundler
- ReactDOM → React Native AppRegistry

---

## 3. Architectural Decisions

### 3.1 Decision Matrix

| Decision Point | Option A | Option B | Option C | Recommendation | Rationale |
|---------------|----------|----------|----------|----------------|-----------|
| **Build System** | Expo (Managed) | Expo (Bare) | React Native CLI | **Expo Managed** | Faster setup, easier updates, good for Android-only |
| **Styling** | StyleSheet API | Nativewind (Tailwind) | Styled Components | **Nativewind** | Keeps Tailwind patterns, easier migration |
| **Navigation** | React Navigation | React Native Navigation | Custom Tabs | **React Navigation** | Industry standard, good docs |
| **State Management** | useState (current) | Redux Toolkit | Zustand | **useState** | Current approach works, no need to change |
| **Voice Input** | @react-native-voice/voice | Expo Speech | expo-speech-recognition | **@react-native-voice/voice** | Most mature, best Android support |
| **Drag & Drop** | react-native-draggable-flatlist | react-native-dnd | Gesture Handler + Reanimated | **Gesture Handler + Reanimated** | Most flexible, best performance |
| **SVG Graphics** | react-native-svg | Expo Skia | react-native-canvas | **react-native-svg** | Industry standard, good compatibility |
| **Animations** | Animated API | Reanimated 2 | Lottie | **Reanimated 2** | Better performance, gesture integration |
| **Environment Variables** | react-native-config | react-native-dotenv | Expo Constants | **Expo Constants** | Built-in with Expo, simple |
| **Icons** | lucide-react-native | react-native-vector-icons | Expo Icons | **lucide-react-native** | Keep current icon library |
| **HTTP Client** | Fetch (current) | Axios | Native modules | **Fetch** | Already used, sufficient for needs |

### 3.2 Detailed Decision Analysis

#### 3.2.1 Build System: Expo Managed vs React Native CLI

**Recommendation: Expo Managed Workflow**

**Pros**:
- Faster initial setup (minutes vs hours)
- Built-in build system for Android APK/AAB
- Over-the-air updates via Expo Updates
- Easier dependency management
- Great developer experience with Expo Go
- Built-in support for environment variables, fonts, icons
- No need for Android Studio for basic development

**Cons**:
- Slightly larger APK size (~20-30MB overhead)
- Less control over native Android code
- Some limitations on native modules (though minimal)

**Why Not React Native CLI**:
- More complex setup requiring Android Studio
- Manual configuration for every native dependency
- More maintenance overhead
- Overkill for this app (no custom native modules needed)

**Action Items**:
```bash
npm install -g expo-cli
expo init dayflow-android --template blank-typescript
```

#### 3.2.2 Styling: Nativewind vs StyleSheet API

**Recommendation: Nativewind (Tailwind for React Native)**

**Pros**:
- Keep existing Tailwind knowledge and patterns
- Minimal rewrite of class names
- Utility-first approach preserved
- Good TypeScript support
- Active maintenance and community

**Cons**:
- Additional setup required
- Slight performance overhead vs native StyleSheet
- Some Tailwind features not available (arbitrary values, some variants)

**Why Not Plain StyleSheet**:
- Would require complete rewrite of all styling code
- More verbose than Tailwind utilities
- Lose rapid development benefits

**Alternative Consideration: StyleSheet API**
- If app performance becomes critical
- If bundle size is a concern
- Fallback option if Nativewind has issues

**Action Items**:
```bash
npm install nativewind
npm install --save-dev tailwindcss
npx tailwindcss init
```

#### 3.2.3 Navigation: React Navigation vs Custom

**Recommendation: React Navigation**

**Pros**:
- Industry standard for React Native
- Built-in tab navigator (maps to current tab system)
- Stack navigator for modals/detail views
- Deep linking support
- Excellent TypeScript support
- Extensive documentation

**Cons**:
- Adds dependency
- Slight learning curve
- May be overkill for simple tab navigation

**Why Not Custom Navigation**:
- Current custom tab system uses setActiveTab state
- React Navigation provides better:
  - Screen lifecycle management
  - Back button handling
  - Screen transitions
  - Deep linking
  - State persistence

**Hybrid Approach**:
- Use React Navigation for core structure
- Keep conditional rendering logic for agent-specific tabs

**Action Items**:
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

#### 3.2.4 Voice Input: @react-native-voice/voice

**Recommendation: @react-native-voice/voice**

**Pros**:
- Most mature voice recognition library for React Native
- Good Android support with Google Speech API
- Similar API to Web Speech API (easier migration)
- Active maintenance
- Real-time speech recognition

**Cons**:
- Requires native permissions setup
- Android-specific implementation details
- May need fallback for older Android versions

**Migration Mapping**:
```typescript
// Web Speech API (current)
const recognition = new webkitSpeechRecognition()
recognition.start()
recognition.onresult = (event) => { ... }

// React Native Voice (new)
import Voice from '@react-native-voice/voice'
Voice.start('en-US')
Voice.onSpeechResults = (e) => { ... }
```

**Action Items**:
```bash
npm install @react-native-voice/voice
# Add permissions to AndroidManifest.xml
```

#### 3.2.5 Drag & Drop: Gesture Handler + Reanimated

**Recommendation: react-native-gesture-handler + react-native-reanimated**

**Pros**:
- Most powerful gesture system for React Native
- Smooth 60fps animations
- Complete control over drag behavior
- Integrates with Reanimated for performance
- Used by React Navigation (already installed)

**Cons**:
- Steeper learning curve than simple drag libraries
- More code required than HTML5 drag/drop
- Need to manually implement drop zones

**Alternative: react-native-draggable-flatlist**
- Simpler API for list reordering
- Less flexible for custom layouts (Matrix quadrants)
- Still requires gesture-handler underneath

**Why Gesture Handler**:
- Current MatrixView has custom quadrant layout
- Need fine-grained control over drag zones
- Better for Eisenhower Matrix's 2x2 grid

**Migration Strategy**:
```typescript
// Current: HTML5 Drag/Drop
<div draggable onDragStart={...} onDrop={...}>

// New: Gesture Handler
<PanGestureHandler onGestureEvent={animatedGestureHandler}>
  <Animated.View style={[animatedStyle]}>
```

**Action Items**:
```bash
npm install react-native-gesture-handler react-native-reanimated
# Add Reanimated plugin to babel.config.js
```

#### 3.2.6 SVG Graphics: react-native-svg

**Recommendation: react-native-svg**

**Pros**:
- De facto standard for SVG in React Native
- API very similar to web SVG elements
- Good performance
- Supports most SVG features
- Easy migration from web SVG

**Cons**:
- Not all CSS SVG properties supported
- Some gradients require different syntax
- ViewBox behavior slightly different

**Migration Impact**:
- FocusView.tsx: Pomodoro circular progress (uses SVG circles)
- TimelineView.tsx: Some graphical elements
- Icons: Already using lucide-react (has react-native version)

**Migration Mapping**:
```typescript
// Web SVG (current)
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" />
</svg>

// react-native-svg (new)
import Svg, { Circle } from 'react-native-svg'
<Svg viewBox="0 0 200 200">
  <Circle cx="100" cy="100" r="90" />
</Svg>
```

**Action Items**:
```bash
npm install react-native-svg
```

---

## 4. Technology Stack Comparison

### 4.1 Web vs React Native Stack

| Layer | Current (Web) | New (React Native Android) |
|-------|---------------|----------------------------|
| **Framework** | React 19.2.0 | React 18.2.0 + React Native 0.74+ |
| **Build Tool** | Vite 6.2.0 | Metro (via Expo) |
| **Language** | TypeScript 5.8.2 | TypeScript 5.x |
| **Styling** | Tailwind CSS (CDN) | Nativewind (RN Tailwind) |
| **Rendering** | react-dom | react-native |
| **Navigation** | Custom tab state | React Navigation 6 |
| **AI SDK** | @google/genai 1.30.0 | @google/genai 1.30.0 (same) |
| **Icons** | lucide-react 0.554.0 | lucide-react-native |
| **Voice** | Web Speech API | @react-native-voice/voice |
| **Drag/Drop** | HTML5 Drag/Drop | Gesture Handler + Reanimated |
| **SVG** | Native SVG | react-native-svg |
| **Animations** | CSS Transitions | Reanimated 2 |
| **Env Vars** | Vite loadEnv | Expo Constants |
| **State** | React useState | React useState (same) |
| **HTTP** | Fetch API | Fetch API (same) |
| **Storage** | LocalStorage | AsyncStorage / MMKV |

### 4.2 New Dependencies Required

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.0",
    "expo": "~51.0.0",
    "expo-constants": "~16.0.0",
    "expo-status-bar": "~1.12.0",
    "@google/genai": "^1.30.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-screens": "^3.31.0",
    "react-native-safe-area-context": "^4.10.0",
    "@react-native-voice/voice": "^3.2.4",
    "react-native-gesture-handler": "^2.16.0",
    "react-native-reanimated": "^3.10.0",
    "react-native-svg": "^15.2.0",
    "nativewind": "^4.0.0",
    "lucide-react-native": "^0.400.0",
    "@react-native-async-storage/async-storage": "^1.23.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.0",
    "typescript": "~5.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 4.3 Removed Dependencies

```json
{
  "remove": [
    "react-dom",
    "@vitejs/plugin-react",
    "vite",
    "lucide-react" // (replaced with lucide-react-native)
  ]
}
```

---

## 5. Detailed Migration Plan

### 5.1 Project Structure Changes

#### Current Structure (Web)
```
copy-of-dayflow-ai-planner/
├── index.html                  # Web entry point
├── index.tsx                   # React entry
├── App.tsx
├── components/
│   └── *.tsx
├── services/
│   └── geminiService.ts
├── types.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

#### New Structure (React Native)
```
dayflow-android/
├── App.tsx                     # Main app component (migrated)
├── app.json                    # Expo config
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Nativewind config
├── android/                    # Native Android code (Expo managed)
├── src/
│   ├── index.tsx               # App entry (new)
│   ├── navigation/
│   │   └── AppNavigator.tsx    # React Navigation setup (new)
│   ├── screens/                # Converted from components
│   │   ├── ChatScreen.tsx      # From ChatInterface.tsx
│   │   ├── FocusScreen.tsx     # From FocusView.tsx
│   │   ├── MatrixScreen.tsx    # From MatrixView.tsx
│   │   └── TimelineScreen.tsx  # From TimelineView.tsx
│   ├── components/             # Shared components
│   │   ├── AgentSelector.tsx   # Migrated
│   │   └── TaskCard.tsx        # Migrated
│   ├── services/
│   │   └── geminiService.ts    # Minimal changes
│   ├── types/
│   │   └── index.ts            # From types.ts
│   ├── hooks/                  # Custom hooks (new)
│   │   ├── useVoiceInput.ts    # Voice functionality
│   │   └── useFocusTimer.ts    # Timer logic
│   └── constants/
│       ├── colors.ts           # Design system
│       └── config.ts           # App config
├── assets/                     # Images, fonts
│   └── fonts/
│       └── PlusJakartaSans/    # Google font files
└── .env                        # Environment variables
```

### 5.2 File-by-File Migration Checklist

#### Critical Files (Must Migrate First)

- [ ] **types.ts → src/types/index.ts**
  - Status: ✅ Direct copy (100% reusable)
  - Changes: None required
  - Time: 5 minutes

- [ ] **services/geminiService.ts → src/services/geminiService.ts**
  - Status: ⚠️ Minor changes (95% reusable)
  - Changes: Update `process.env.API_KEY` to use Expo Constants
  - Time: 15 minutes

- [ ] **App.tsx → App.tsx**
  - Status: ⚠️ Major changes (60% reusable)
  - Changes:
    - Replace HTML elements with React Native components
    - Update tab navigation to use React Navigation
    - Convert Tailwind classes to Nativewind
  - Time: 3-4 hours

#### Component Files

- [ ] **components/ChatInterface.tsx → src/screens/ChatScreen.tsx**
  - Status: ⚠️ Major changes (40% reusable)
  - Changes:
    - Replace Web Speech API with @react-native-voice/voice
    - Convert HTML elements to React Native components
    - Replace scrollIntoView with ScrollView.scrollTo
    - Update Tailwind to Nativewind
  - Time: 4-5 hours

- [ ] **components/FocusView.tsx → src/screens/FocusScreen.tsx**
  - Status: ⚠️ Major changes (40% reusable)
  - Changes:
    - Convert SVG to react-native-svg
    - Replace CSS animations with Reanimated
    - Update component structure
  - Time: 3-4 hours

- [ ] **components/MatrixView.tsx → src/screens/MatrixScreen.tsx**
  - Status: ❌ Complete rewrite (20% reusable)
  - Changes:
    - Replace HTML5 drag/drop with Gesture Handler
    - Rebuild quadrant layout with React Native components
    - Implement custom drop zones
  - Time: 6-8 hours

- [ ] **components/TimelineView.tsx → src/screens/TimelineScreen.tsx**
  - Status: ⚠️ Major changes (50% reusable)
  - Changes:
    - Convert complex layout to React Native
    - Replace modal with React Native Modal
    - Update SVG elements
  - Time: 4-5 hours

- [ ] **components/TaskCard.tsx → src/components/TaskCard.tsx**
  - Status: ⚠️ Moderate changes (70% reusable)
  - Changes:
    - Replace HTML with React Native components
    - Convert hover states to touch states
    - Update styling
  - Time: 1-2 hours

- [ ] **components/AgentSelector.tsx → src/components/AgentSelector.tsx**
  - Status: ⚠️ Moderate changes (70% reusable)
  - Changes:
    - Replace HTML with React Native components
    - Update styling
  - Time: 1-2 hours

#### New Files to Create

- [ ] **src/navigation/AppNavigator.tsx**
  - Purpose: React Navigation setup
  - Time: 2 hours

- [ ] **src/hooks/useVoiceInput.ts**
  - Purpose: Extract voice input logic
  - Time: 1-2 hours

- [ ] **src/hooks/useFocusTimer.ts**
  - Purpose: Extract timer logic from FocusView
  - Time: 1 hour

- [ ] **src/constants/colors.ts**
  - Purpose: Centralize color system
  - Time: 30 minutes

- [ ] **app.json**
  - Purpose: Expo configuration
  - Time: 30 minutes

- [ ] **babel.config.js**
  - Purpose: Babel + Reanimated setup
  - Time: 15 minutes

- [ ] **tailwind.config.js**
  - Purpose: Nativewind configuration
  - Time: 30 minutes

---

## 6. Component-by-Component Migration

### 6.1 App.tsx Migration

#### Current Code Analysis (268 lines)
- State management: Tasks, events, messages, agentMode, activeTab
- Function call processing from Gemini AI
- Tab visibility logic
- Conditional rendering of views

#### Migration Strategy

**Reusable (60%)**:
- State management logic
- `getVisibleTabs()` function
- `handleSendMessage()` business logic
- Function call processing logic

**Must Replace (40%)**:
- HTML elements → React Native components
- Tailwind classes → Nativewind classes
- Navigation structure → React Navigation integration

#### Code Changes

**Before (Web)**:
```typescript
<div className="h-screen bg-[#0F1115] flex flex-col">
  <header className="fixed top-0 left-0 right-0 z-50">
    {/* Header content */}
  </header>

  <main className="flex-1 overflow-hidden">
    {activeTab === 'chat' && <ChatInterface ... />}
    {activeTab === 'focus' && <FocusView ... />}
    {activeTab === 'matrix' && <MatrixView ... />}
    {activeTab === 'timeline' && <TimelineView ... />}
  </main>

  <nav className="fixed bottom-0 left-0 right-0">
    {/* Tab navigation */}
  </nav>
</div>
```

**After (React Native)**:
```typescript
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaView } from 'react-native-safe-area-context'

const Tab = createBottomTabNavigator()

function App() {
  // Keep all state management logic (same)
  const [tasks, setTasks] = useState<Task[]>([])
  // ... all other state

  // Keep business logic (same)
  const handleSendMessage = async (content: string) => { ... }

  // Keep tab visibility logic (same)
  const visibleTabs = getVisibleTabs(agentMode)

  return (
    <SafeAreaView className="flex-1 bg-[#0F1115]">
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: '#1A1D26' },
            headerShown: false
          }}
        >
          {visibleTabs.includes('chat') && (
            <Tab.Screen name="Chat" component={ChatScreen} />
          )}
          {visibleTabs.includes('focus') && (
            <Tab.Screen name="Focus" component={FocusScreen} />
          )}
          {/* ... other tabs */}
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}
```

**Key Changes**:
1. `<div>` → `<SafeAreaView>` (handles notches/status bar)
2. Fixed positioning → React Navigation tab bar
3. Conditional rendering → Dynamic tab registration
4. Tailwind classes → Nativewind (mostly same syntax)
5. Pass props via React Navigation route params or Context API

**Estimated Time**: 3-4 hours

---

### 6.2 ChatInterface Migration → ChatScreen

#### Current Code Analysis (350 lines)
- Agent selector (launchpad)
- Message display with streaming
- Voice input using Web Speech API
- Suggested action chips
- Dynamic positioning based on agent mode

#### Web-Specific Code (40%)

1. **Web Speech API** (lines 43-70):
```typescript
const SpeechRecognition = (window as any).webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.start()
recognition.onresult = (event: any) => { ... }
```

2. **ScrollIntoView** (line 28):
```typescript
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
```

3. **HTML Form/Input** (lines 200+):
```typescript
<form onSubmit={handleSubmit}>
  <input type="text" ... />
  <button type="submit">...</button>
</form>
```

#### Migration Strategy

**Step 1: Extract Voice Logic into Custom Hook**

Create `src/hooks/useVoiceInput.ts`:
```typescript
import Voice from '@react-native-voice/voice'
import { useState, useEffect } from 'react'

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    Voice.isAvailable().then(setIsAvailable)

    Voice.onSpeechResults = (e) => {
      setTranscript(e.value?.[0] || '')
    }

    Voice.onSpeechError = (e) => {
      console.error('Speech error:', e)
      setIsListening(false)
    }

    return () => {
      Voice.destroy().then(Voice.removeAllListeners)
    }
  }, [])

  const startListening = async () => {
    setTranscript('')
    setIsListening(true)
    try {
      await Voice.start('en-US')
    } catch (e) {
      console.error(e)
      setIsListening(false)
    }
  }

  const stopListening = async () => {
    try {
      await Voice.stop()
      setIsListening(false)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    isListening,
    transcript,
    isAvailable,
    startListening,
    stopListening
  }
}
```

**Step 2: Update Component Structure**

```typescript
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Mic, Send } from 'lucide-react-native'
import { useVoiceInput } from '../hooks/useVoiceInput'

export function ChatScreen({ navigation, route }) {
  const {
    isListening,
    transcript,
    isAvailable,
    startListening,
    stopListening
  } = useVoiceInput()

  const scrollViewRef = useRef<ScrollView>(null)

  // Scroll to end when messages update
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript)
    }
  }, [transcript])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0F1115]"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Message list */}
        {messages.map((msg, idx) => (
          <View key={idx} className={`p-4 rounded-2xl mb-3 ${
            msg.role === 'user'
              ? 'bg-violet-600 self-end'
              : 'bg-[#1A1D26] self-start'
          }`}>
            <Text className="text-white">{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#1A1D26]">
        <View className="flex-row items-center bg-[#252836] rounded-full px-4">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Type a message..."
            placeholderTextColor="#64748b"
            className="flex-1 text-white py-4"
            multiline
          />

          {isAvailable && (
            <TouchableOpacity
              onPress={isListening ? stopListening : startListening}
              className={`p-2 rounded-full ${isListening ? 'bg-red-500' : ''}`}
            >
              <Mic size={20} color={isListening ? '#fff' : '#8b5cf6'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleSendMessage}
            className="ml-2 p-2 bg-violet-600 rounded-full"
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
```

**Key Changes**:
1. `Web Speech API` → `@react-native-voice/voice` hook
2. `scrollIntoView` → `scrollViewRef.current?.scrollToEnd()`
3. `<form>` → `<View>` with manual submit handling
4. `<input>` → `<TextInput>`
5. `<button>` → `<TouchableOpacity>`
6. Add `KeyboardAvoidingView` for better mobile UX
7. Keep message logic exactly the same

**Estimated Time**: 4-5 hours

---

### 6.3 FocusView Migration → FocusScreen

#### Current Code Analysis (138 lines)
- Circular SVG progress indicator
- Timer state (duration, time left, isActive)
- Start/Pause/Reset controls
- Focus/Break mode toggle

#### Web-Specific Code (60%)

**SVG Circular Progress** (lines 75-110):
```typescript
<svg className="transform -rotate-90" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="progressGradient">
      <stop offset="0%" stopColor="#10B981" />
      <stop offset="100%" stopColor="#34D399" />
    </linearGradient>
  </defs>
  <circle
    cx="100"
    cy="100"
    r="90"
    stroke="#1A1D26"
    strokeWidth="12"
    fill="none"
  />
  <circle
    cx="100"
    cy="100"
    r="90"
    stroke="url(#progressGradient)"
    strokeWidth="12"
    fill="none"
    strokeDasharray={`${circumference} ${circumference}`}
    strokeDashoffset={strokeDashoffset}
    strokeLinecap="round"
    style={{ transition: 'stroke-dashoffset 1s linear' }}
  />
</svg>
```

#### Migration Strategy

**Step 1: Extract Timer Logic into Custom Hook**

Create `src/hooks/useFocusTimer.ts`:
```typescript
import { useState, useEffect, useRef } from 'react'

export function useFocusTimer(initialDuration: number = 25 * 60) {
  const [duration, setDuration] = useState(initialDuration)
  const [timeLeft, setTimeLeft] = useState(initialDuration)
  const [isActive, setIsActive] = useState(false)
  const [isFocus, setIsFocus] = useState(true)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Timer completed
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, timeLeft])

  const start = () => setIsActive(true)
  const pause = () => setIsActive(false)
  const reset = () => {
    setIsActive(false)
    setTimeLeft(duration)
  }
  const toggleMode = () => {
    const newIsFocus = !isFocus
    setIsFocus(newIsFocus)
    const newDuration = newIsFocus ? 25 * 60 : 5 * 60
    setDuration(newDuration)
    setTimeLeft(newDuration)
    setIsActive(false)
  }

  const progress = 1 - (timeLeft / duration)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return {
    timeLeft,
    isActive,
    isFocus,
    progress,
    minutes,
    seconds,
    start,
    pause,
    reset,
    toggleMode
  }
}
```

**Step 2: Create Animated Circle Component**

Create `src/components/CircularProgress.tsx`:
```typescript
import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularProgressProps {
  size: number
  strokeWidth: number
  progress: number
  color?: string
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color = '#10B981'
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const animatedProgress = useSharedValue(0)

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 })
  }, [progress])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value)
  }))

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#34D399" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1A1D26"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  )
}
```

**Step 3: Build FocusScreen Component**

```typescript
import { View, Text, TouchableOpacity } from 'react-native'
import { Play, Pause, RotateCcw } from 'lucide-react-native'
import { useFocusTimer } from '../hooks/useFocusTimer'
import { CircularProgress } from '../components/CircularProgress'

export function FocusScreen() {
  const {
    minutes,
    seconds,
    isActive,
    isFocus,
    progress,
    start,
    pause,
    reset,
    toggleMode
  } = useFocusTimer()

  return (
    <View className="flex-1 bg-[#0F1115] items-center justify-center px-4">
      {/* Mode toggle */}
      <View className="flex-row mb-8">
        <TouchableOpacity
          onPress={toggleMode}
          className={`px-6 py-3 rounded-l-full ${
            isFocus ? 'bg-emerald-600' : 'bg-[#1A1D26]'
          }`}
        >
          <Text className="text-white font-semibold">Focus</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleMode}
          className={`px-6 py-3 rounded-r-full ${
            !isFocus ? 'bg-emerald-600' : 'bg-[#1A1D26]'
          }`}
        >
          <Text className="text-white font-semibold">Break</Text>
        </TouchableOpacity>
      </View>

      {/* Circular progress */}
      <View className="relative items-center justify-center">
        <CircularProgress
          size={300}
          strokeWidth={12}
          progress={progress}
        />
        <View className="absolute">
          <Text className="text-white text-6xl font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row mt-12 gap-4">
        <TouchableOpacity
          onPress={reset}
          className="bg-[#1A1D26] p-6 rounded-full"
        >
          <RotateCcw size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isActive ? pause : start}
          className="bg-emerald-600 p-8 rounded-full"
        >
          {isActive ? (
            <Pause size={40} color="#fff" />
          ) : (
            <Play size={40} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
```

**Key Changes**:
1. SVG → react-native-svg with Animated components
2. CSS transitions → Reanimated 2 animations
3. Extract timer logic into reusable hook
4. Extract circular progress into reusable component
5. Button click handlers remain the same
6. Keep timer math exactly the same

**Estimated Time**: 3-4 hours

---

### 6.4 MatrixView Migration → MatrixScreen

#### Current Code Analysis (180 lines)
- Eisenhower Matrix 2x2 grid layout
- Four quadrants: Do, Schedule, Delegate, Delete
- Drag-and-drop task prioritization
- Visual feedback during drag operations

#### Web-Specific Code (50%)

**HTML5 Drag/Drop** (lines 38-56):
```typescript
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('taskId', task.id)
  }}
>
  {/* Task content */}
</div>

<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    const taskId = e.dataTransfer.getData('taskId')
    onUpdateTask(taskId, { priority: 'do' })
  }}
>
  {/* Drop zone */}
</div>
```

#### Migration Strategy

This is the most complex migration. React Native doesn't have native drag/drop, so we need to build it with Gesture Handler + Reanimated.

**Step 1: Install Dependencies**
```bash
npm install react-native-gesture-handler react-native-reanimated
```

**Step 2: Update babel.config.js**
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'] // Must be last
}
```

**Step 3: Create Draggable Task Component**

Create `src/components/DraggableTask.tsx`:
```typescript
import React from 'react'
import { View, Text } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated'
import { Task } from '../types'

interface DraggableTaskProps {
  task: Task
  onDragEnd: (taskId: string, x: number, y: number) => void
}

export function DraggableTask({ task, onDragEnd }: DraggableTaskProps) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value
      ctx.startY = translateY.value
      isDragging.value = true
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX
      translateY.value = ctx.startY + event.translationY
    },
    onEnd: (event) => {
      isDragging.value = false

      // Calculate final position
      const finalX = event.absoluteX
      const finalY = event.absoluteY

      // Call onDragEnd on JS thread
      runOnJS(onDragEnd)(task.id, finalX, finalY)

      // Reset position
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    }
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(isDragging.value ? 1.1 : 1) }
    ],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: isDragging.value ? 0.8 : 1
  }))

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[animatedStyle]}
        className="bg-[#1A1D26] p-4 rounded-xl mb-2"
      >
        <Text className="text-white font-medium">{task.title}</Text>
        {task.dueDate && (
          <Text className="text-slate-400 text-sm mt-1">
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </PanGestureHandler>
  )
}
```

**Step 4: Create Matrix Screen with Drop Zones**

```typescript
import React, { useState } from 'react'
import { View, Text, ScrollView, Dimensions } from 'react-native'
import { DraggableTask } from '../components/DraggableTask'
import { Task, Priority } from '../types'

const SCREEN_WIDTH = Dimensions.get('window').width
const QUADRANT_WIDTH = SCREEN_WIDTH / 2 - 24

interface QuadrantZone {
  priority: Priority
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function MatrixScreen({ tasks, onUpdateTask }) {
  const [quadrantZones, setQuadrantZones] = useState<QuadrantZone[]>([])

  // Determine which quadrant a position falls into
  const getQuadrantFromPosition = (x: number, y: number): Priority => {
    for (const zone of quadrantZones) {
      if (
        x >= zone.minX &&
        x <= zone.maxX &&
        y >= zone.minY &&
        y <= zone.maxY
      ) {
        return zone.priority
      }
    }
    return 'do' // default
  }

  const handleDragEnd = (taskId: string, x: number, y: number) => {
    const priority = getQuadrantFromPosition(x, y)
    onUpdateTask(taskId, { priority })
  }

  const tasksByPriority = {
    do: tasks.filter(t => t.priority === 'do'),
    schedule: tasks.filter(t => t.priority === 'schedule'),
    delegate: tasks.filter(t => t.priority === 'delegate'),
    delete: tasks.filter(t => t.priority === 'delete')
  }

  return (
    <ScrollView className="flex-1 bg-[#0F1115] p-4">
      <Text className="text-white text-2xl font-bold mb-6">
        Priority Matrix
      </Text>

      <View className="flex-row flex-wrap">
        {/* Quadrant 1: Do */}
        <View
          className="w-[48%] mr-[4%] mb-4 bg-[#1A1D26] rounded-2xl p-4"
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout
            setQuadrantZones(prev => [
              ...prev.filter(z => z.priority !== 'do'),
              { priority: 'do', minX: x, maxX: x + width, minY: y, maxY: y + height }
            ])
          }}
        >
          <Text className="text-red-500 font-bold mb-2">DO</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Urgent & Important
          </Text>
          {tasksByPriority.do.map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>

        {/* Quadrant 2: Schedule */}
        <View
          className="w-[48%] mb-4 bg-[#1A1D26] rounded-2xl p-4"
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout
            setQuadrantZones(prev => [
              ...prev.filter(z => z.priority !== 'schedule'),
              { priority: 'schedule', minX: x, maxX: x + width, minY: y, maxY: y + height }
            ])
          }}
        >
          <Text className="text-blue-500 font-bold mb-2">SCHEDULE</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Not Urgent & Important
          </Text>
          {tasksByPriority.schedule.map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>

        {/* Quadrant 3: Delegate */}
        <View
          className="w-[48%] mr-[4%] bg-[#1A1D26] rounded-2xl p-4"
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout
            setQuadrantZones(prev => [
              ...prev.filter(z => z.priority !== 'delegate'),
              { priority: 'delegate', minX: x, maxX: x + width, minY: y, maxY: y + height }
            ])
          }}
        >
          <Text className="text-amber-500 font-bold mb-2">DELEGATE</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Urgent & Not Important
          </Text>
          {tasksByPriority.delegate.map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>

        {/* Quadrant 4: Delete */}
        <View
          className="w-[48%] bg-[#1A1D26] rounded-2xl p-4"
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout
            setQuadrantZones(prev => [
              ...prev.filter(z => z.priority !== 'delete'),
              { priority: 'delete', minX: x, maxX: x + width, minY: y, maxY: y + height }
            ])
          }}
        >
          <Text className="text-slate-500 font-bold mb-2">DELETE</Text>
          <Text className="text-slate-400 text-xs mb-4">
            Not Urgent & Not Important
          </Text>
          {tasksByPriority.delete.map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
```

**Key Changes**:
1. HTML5 drag/drop → PanGestureHandler + Reanimated
2. `dataTransfer` → Shared values for position tracking
3. Manual drop zone detection using layout coordinates
4. Animated feedback during drag (scale, opacity, z-index)
5. Spring animations for smooth interactions
6. Keep task filtering and priority logic the same

**Estimated Time**: 6-8 hours (most complex migration)

---

### 6.5 TimelineView Migration → TimelineScreen

#### Current Code Analysis (311 lines)
- Calendar grid with hourly time slots
- Event cards positioned by time
- Overlapping event handling
- Modal for event details
- Day/Week view toggle
- Next event countdown

#### Migration Strategy

**Replace Web Modal with React Native Modal**:
```typescript
import { Modal, Pressable } from 'react-native'

{selectedEvent && (
  <Modal
    visible={!!selectedEvent}
    transparent
    animationType="fade"
    onRequestClose={() => setSelectedEvent(null)}
  >
    <Pressable
      className="flex-1 bg-black/50 justify-center items-center"
      onPress={() => setSelectedEvent(null)}
    >
      <View className="bg-[#1A1D26] rounded-2xl p-6 w-[90%] max-w-md">
        <Text className="text-white text-xl font-bold">
          {selectedEvent.title}
        </Text>
        {/* Event details */}
      </View>
    </Pressable>
  </Modal>
)}
```

**Replace SVG Elements (if any)**:
- Import from react-native-svg
- Keep layout logic the same

**Update ScrollView**:
```typescript
import { ScrollView } from 'react-native'

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  className="flex-1"
>
  {/* Timeline content */}
</ScrollView>
```

**Estimated Time**: 4-5 hours

---

### 6.6 TaskCard & AgentSelector Migration

#### TaskCard (103 lines)
- Relatively straightforward migration
- Replace HTML elements with React Native components
- Update Tailwind to Nativewind
- Convert hover states to touch states

**Estimated Time**: 1-2 hours

#### AgentSelector (88 lines)
- Simple card grid layout
- Minimal web-specific code
- Just component and styling updates

**Estimated Time**: 1-2 hours

---

## 7. API and Service Layer Changes

### 7.1 geminiService.ts Migration

#### Current Code (189 lines)

**Only Change Required**: Environment variable handling

**Before**:
```typescript
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || ''
```

**After**:
```typescript
import Constants from 'expo-constants'

const API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || ''
```

#### Setup .env with Expo

**Step 1: Install expo-constants**
```bash
npx expo install expo-constants
```

**Step 2: Create .env file**
```
GEMINI_API_KEY=your_key_here
```

**Step 3: Update app.json**
```json
{
  "expo": {
    "name": "DayFlow",
    "slug": "dayflow",
    "extra": {
      "GEMINI_API_KEY": process.env.GEMINI_API_KEY
    }
  }
}
```

**Step 4: Update service**
```typescript
import { GoogleGenerativeAI } from '@google/genai'
import Constants from 'expo-constants'

const API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

// Rest of the service stays exactly the same
export async function sendMessage(
  message: string,
  history: Message[],
  agentMode: AgentMode
): Promise<GeminiResponse> {
  // All existing logic remains unchanged
}
```

**Verification**: Everything else in geminiService.ts is platform-agnostic and will work as-is in React Native.

**Estimated Time**: 15 minutes

---

### 7.2 Data Persistence (New Feature)

Currently, the web app loses data on refresh. React Native provides persistent storage.

**Option 1: AsyncStorage (Simple)**
```bash
npm install @react-native-async-storage/async-storage
```

**Option 2: MMKV (Faster)**
```bash
npm install react-native-mmkv
```

**Recommendation**: AsyncStorage for MVP, upgrade to MMKV if performance issues.

**Implementation in App.tsx**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Load on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks')
        const savedEvents = await AsyncStorage.getItem('events')

        if (savedTasks) setTasks(JSON.parse(savedTasks))
        if (savedEvents) setEvents(JSON.parse(savedEvents))
      } catch (e) {
        console.error('Failed to load data:', e)
      }
    }

    loadData()
  }, [])

  // Save on change
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    AsyncStorage.setItem('events', JSON.stringify(events))
  }, [events])

  // ... rest of app
}
```

**Estimated Time**: 1 hour

---

## 8. Build System and Configuration

### 8.1 Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "DayFlow",
    "slug": "dayflow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F1115"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "android": {
      "package": "com.dayflow.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F1115"
      },
      "permissions": [
        "RECORD_AUDIO"
      ]
    },
    "extra": {
      "GEMINI_API_KEY": process.env.GEMINI_API_KEY
    },
    "plugins": [
      [
        "@react-native-voice/voice",
        {
          "microphonePermission": "Allow DayFlow to use voice input for task management."
        }
      ]
    ]
  }
}
```

### 8.2 TypeScript Configuration (tsconfig.json)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "skipLibCheck": true,
    "jsx": "react-native",
    "lib": ["ES2022"],
    "module": "ESNext",
    "target": "ES2022",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 8.3 Babel Configuration (babel.config.js)

```javascript
module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin', // Must be last
    ],
  }
}
```

### 8.4 Tailwind Configuration (tailwind.config.js)

```javascript
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0F1115',
        'secondary-bg': '#1A1D26',
        'tertiary-bg': '#252836',
      }
    },
  },
  plugins: [],
}
```

### 8.5 Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:apk": "eas build --platform android --profile preview",
    "lint": "eslint .",
    "type-check": "tsc"
  }
}
```

---

## 9. Testing Strategy

### 9.1 Testing Phases

**Phase 1: Component Testing**
- Test each migrated component in isolation
- Verify UI renders correctly
- Test touch interactions
- Verify styling matches design

**Phase 2: Integration Testing**
- Test navigation flow
- Test state management across screens
- Test Gemini AI integration
- Test voice input

**Phase 3: Feature Testing**
- Test each agent mode end-to-end
- Test task CRUD operations
- Test event scheduling
- Test focus timer
- Test priority matrix drag/drop

**Phase 4: Android Device Testing**
- Test on multiple Android versions (8.0+)
- Test different screen sizes
- Test keyboard behavior
- Test voice permissions
- Test performance

### 9.2 Test Devices

**Recommended Test Matrix**:
| Device | Android Version | Screen Size | Priority |
|--------|----------------|-------------|----------|
| Pixel 6 | 13 | 1080x2400 | High |
| Samsung Galaxy S21 | 12 | 1080x2400 | High |
| OnePlus 8 | 11 | 1080x2340 | Medium |
| Budget device | 9.0 | 720x1560 | Medium |

Use Android Emulator for rapid iteration, real devices for final validation.

### 9.3 Testing Checklist

- [ ] App launches without crashes
- [ ] Navigation tabs work correctly
- [ ] Agent mode selection works
- [ ] Chat interface receives and displays messages
- [ ] Voice input activates and transcribes
- [ ] AI responses stream correctly
- [ ] Tasks can be created via AI
- [ ] Tasks can be completed/deleted
- [ ] Events appear on timeline
- [ ] Focus timer starts/pauses/resets
- [ ] Pomodoro progress animates smoothly
- [ ] Matrix drag-and-drop works
- [ ] Tasks update priority on drop
- [ ] Keyboard doesn't obscure input
- [ ] App works offline (with cached data)
- [ ] Data persists across app restarts
- [ ] No memory leaks during extended use
- [ ] Smooth 60fps animations
- [ ] APK size is reasonable (<50MB)

---

## 10. Potential Challenges and Risks

### 10.1 Technical Challenges

| Challenge | Risk Level | Mitigation Strategy |
|-----------|-----------|---------------------|
| **Drag & Drop Complexity** | High | Use proven patterns from React Native docs, allocate extra time |
| **SVG Animation Performance** | Medium | Use Reanimated for smooth 60fps, test early on device |
| **Voice Input Reliability** | Medium | Implement robust error handling, add visual feedback |
| **Gemini API Network Issues** | Medium | Add retry logic, offline detection, loading states |
| **Android Permissions** | Low | Follow Expo guidelines, test permission flows |
| **Screen Size Variations** | Low | Use responsive design, test on multiple sizes |
| **Bundle Size** | Low | Monitor with `expo-optimize`, remove unused deps |
| **Memory Leaks** | Low | Profile with React DevTools, use cleanup in useEffect |

### 10.2 Migration Risks

**Risk: Breaking AI Functionality**
- **Likelihood**: Low
- **Impact**: Critical
- **Mitigation**: Test geminiService.ts early, keep unchanged except env vars

**Risk: Poor Drag/Drop UX**
- **Likelihood**: Medium
- **Impact**: High (Matrix mode unusable)
- **Mitigation**: Prototype drag/drop first, get user feedback early

**Risk: Timeline Bugs**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Thorough testing of event rendering logic

**Risk: Voice Input Not Working**
- **Likelihood**: Low
- **Impact**: Medium (feature degradation)
- **Mitigation**: Fallback to text-only if voice unavailable

**Risk: Schedule Overrun**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Follow phased approach, prioritize MVP features

### 10.3 Platform-Specific Issues

**Android Fragmentation**:
- Different Android versions handle permissions differently
- Some devices have manufacturer customizations
- Voice input quality varies by device
- **Solution**: Target Android 8.0+ (API 26), test on real devices

**Performance Considerations**:
- React Native has slight overhead vs native
- SVG animations can be heavy on low-end devices
- **Solution**: Use Reanimated (runs on UI thread), optimize renders

**APK Size**:
- React Native apps are larger than native apps
- Expo adds overhead (~20MB)
- **Solution**: Acceptable tradeoff for faster development

---

## 11. Phase-by-Phase Implementation

### Phase 1: Foundation (Week 1)

**Goal**: Set up React Native project with basic infrastructure

**Tasks**:
- [ ] Initialize Expo project with TypeScript template
- [ ] Configure Tailwind (Nativewind)
- [ ] Set up React Navigation
- [ ] Install and configure all dependencies
- [ ] Set up environment variables
- [ ] Copy types.ts (no changes)
- [ ] Migrate geminiService.ts (env var update only)
- [ ] Create basic app structure (folders)
- [ ] Set up Android permissions (voice)
- [ ] Test build on emulator

**Deliverable**: Empty app that builds successfully with navigation structure

**Time**: 5-8 hours

---

### Phase 2: Core Components (Week 2)

**Goal**: Migrate all UI components to React Native

**Day 1-2: Chat Screen**
- [ ] Create useVoiceInput hook
- [ ] Build ChatScreen component
- [ ] Integrate voice input
- [ ] Test AI message flow
- [ ] Test keyboard behavior

**Day 3: Agent Selector & Task Card**
- [ ] Migrate AgentSelector component
- [ ] Migrate TaskCard component
- [ ] Test agent mode selection
- [ ] Test task display

**Day 4: Focus Screen**
- [ ] Create useFocusTimer hook
- [ ] Build CircularProgress component
- [ ] Build FocusScreen
- [ ] Test timer functionality
- [ ] Test animations

**Day 5: Timeline Screen**
- [ ] Migrate TimelineScreen
- [ ] Implement React Native Modal
- [ ] Test event display
- [ ] Test day/week toggle

**Deliverable**: All screens functional in isolation

**Time**: 20-25 hours

---

### Phase 3: Advanced Features (Week 3)

**Goal**: Implement complex interactions and integrate screens

**Day 1-3: Matrix Screen**
- [ ] Build DraggableTask component
- [ ] Implement gesture handlers
- [ ] Build MatrixScreen with drop zones
- [ ] Test drag-and-drop on device
- [ ] Refine animations and feedback

**Day 4: App Integration**
- [ ] Integrate all screens in App.tsx
- [ ] Connect state management
- [ ] Test navigation flow
- [ ] Test AI function calls updating screens
- [ ] Implement AsyncStorage persistence

**Day 5: Polish**
- [ ] Add loading states
- [ ] Add error handling
- [ ] Improve animations
- [ ] Add haptic feedback
- [ ] Optimize performance

**Deliverable**: Fully functional app with all features

**Time**: 25-30 hours

---

### Phase 4: Testing & Refinement (Week 4)

**Goal**: Polish app, fix bugs, prepare for release

**Day 1-2: Testing**
- [ ] Test on multiple Android devices
- [ ] Test all agent modes end-to-end
- [ ] Test offline behavior
- [ ] Test data persistence
- [ ] Performance profiling

**Day 3: Bug Fixes**
- [ ] Fix critical bugs
- [ ] Fix UI inconsistencies
- [ ] Fix animation issues
- [ ] Optimize bundle size

**Day 4: Polish**
- [ ] Refine animations
- [ ] Improve error messages
- [ ] Add splash screen
- [ ] Add app icon
- [ ] Improve loading states

**Day 5: Build & Deploy**
- [ ] Create production build
- [ ] Test APK on real devices
- [ ] Document known issues
- [ ] Create release notes

**Deliverable**: Production-ready APK

**Time**: 20-25 hours

---

## 12. Post-Migration Enhancements

### 12.1 Potential Android-Specific Features

**Push Notifications**:
- Reminder notifications for upcoming events
- Pomodoro timer completion notifications
- Daily productivity summary

**Widgets**:
- Home screen widget showing today's tasks
- Timer widget for quick Pomodoro access
- Next event countdown widget

**Background Services**:
- Continue Pomodoro timer in background
- Sync with Google Calendar

**Haptic Feedback**:
- Vibration on task completion
- Haptic feedback during drag-and-drop
- Timer completion haptic pattern

**Dark Mode (System)**:
- Follow Android system dark mode setting
- Currently always dark (could add light mode)

### 12.2 Performance Optimizations

**React.memo**:
- Memoize TaskCard to prevent unnecessary re-renders
- Memoize message components in chat

**useMemo/useCallback**:
- Memoize expensive computations
- Memoize event handlers

**FlatList**:
- Use FlatList instead of ScrollView for long task lists
- Implement virtualization for better performance

**Code Splitting**:
- Lazy load screens with React.lazy
- Reduce initial bundle size

**Image Optimization**:
- Use WebP format for assets
- Implement image caching

### 12.3 Future Enhancements

**Multi-Platform**:
- iOS version (most code reusable)
- Keep web version in parallel

**Backend Integration**:
- User authentication
- Cloud sync across devices
- Collaborative tasks

**Advanced AI Features**:
- Smart task suggestions based on patterns
- Automatic task prioritization
- Natural language date parsing

**Analytics**:
- Track productivity metrics
- Focus time analytics
- Task completion rates

---

## Summary

### Migration Effort Breakdown

| Phase | Time Estimate | Complexity |
|-------|--------------|-----------|
| Phase 1: Foundation | 5-8 hours | Low |
| Phase 2: Core Components | 20-25 hours | Medium |
| Phase 3: Advanced Features | 25-30 hours | High |
| Phase 4: Testing & Refinement | 20-25 hours | Medium |
| **Total** | **70-88 hours** | **Medium-High** |

**Timeline**: 3-4 weeks at 20-25 hours/week

### Recommended Approach

1. **Start with Phase 1**: Get infrastructure right first
2. **Prototype Drag/Drop Early**: Highest risk area, validate approach early
3. **Test on Real Device Frequently**: Emulator can hide issues
4. **Keep Web Version**: Don't delete web codebase until Android is stable
5. **Incremental Migration**: Get one screen fully working before moving to next
6. **Reuse Business Logic**: Maximum code reuse from App.tsx and geminiService.ts

### Key Success Factors

✅ Use Expo for faster development
✅ Use Nativewind to keep Tailwind patterns
✅ Use established libraries (React Navigation, Reanimated)
✅ Test early and often on real Android devices
✅ Keep AI service layer untouched (proven to work)
✅ Focus on MVP first, polish later

### Decision Summary

| Category | Decision |
|----------|----------|
| Build System | Expo Managed Workflow |
| Styling | Nativewind (Tailwind for RN) |
| Navigation | React Navigation |
| State Management | Keep current (useState) |
| Voice Input | @react-native-voice/voice |
| Drag & Drop | Gesture Handler + Reanimated |
| SVG | react-native-svg |
| Animations | Reanimated 2 |
| Storage | AsyncStorage |
| Icons | lucide-react-native |

This migration plan provides a comprehensive roadmap for converting DayFlow from a React web app to a React Native Android app while preserving functionality, maintaining code quality, and leveraging React Native best practices.
