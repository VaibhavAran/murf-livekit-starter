# AI Learning Companion — Voice Agent

**Category / Track:** Learning & Literacy

An interactive voice AI companion for students in India, powered by Murf Falcon TTS, Deepgram STT, Google Gemini LLM, and LiveKit Agents.

---

## Overview of Challenge Progress (Day 1 – Day 5)

### Day 1: Foundation & Setup
- **Selected Track:** Learning & Literacy
- **Voice Engine:** Powered by Murf Falcon TTS using an Indian Voice (`hi-IN-pooja`, Conversational style). Supports English, Hindi, and Hinglish.
- **Core Pipeline:** Integrated LiveKit Agents SDK streaming pipeline: Deepgram Nova-3 (STT) → Google Gemini 3.5 Flash (LLM) → Murf Falcon (TTS).

---

### Day 2: Persona, Guardrails & Code-Mixed Language
- **Prompt Structure:** Built around structured sections: `IDENTITY`, `OBJECTIVES`, `KNOWLEDGE`, `LANGUAGE`, `GUARDRAILS`, `ESCALATION`, and `STYLE`.
- **Guardrails:**
  - Never helps students cheat in exams or complete assignments dishonestly.
  - Never shames or criticizes a student for giving a wrong answer.
  - Never claims a child has a learning disability or medical condition.
  - Politely refuses out-of-scope requests with a standard escalation script.
- **Language & Code-Mixing:** Dynamically mirrors the user's register (Hindi, Hinglish, English) and uses Devanagari script for Hindi text.

---

### Day 3: Frontend & Voice UI Experience
- **Custom UI:** Tailored Next.js frontend with modern educational aesthetics and clean typography.
- **Session States:** Supports clear UI transitions across states:
  - **Ready:** Start session button on welcome screen.
  - **Connecting / Listening / Speaking:** Real-time status indicators and dynamic audio waveforms.
  - **Disconnect:** Returns directly to the starting page for quick restarts.
- **Microphone Permissions:** Includes built-in permission error handling with user guidance if microphone access is denied.

---

### Day 4: Database Persistence & Personalized Greetings
- **SQLite Database:** Local SQLite database (`backend/data/users.db`) storing user profiles with attributes: `user_id`, `name`, `language_preference`, `current_level`, `topics_covered`, `common_mistakes`, and `last_interaction`.
- **Persistent User Identity:** Uses browser `localStorage` (`lk_participant_identity`) to maintain a single stable identity for returning users across browser sessions.
- **Consent Rule:** Explicitly asks verbal permission before saving profile facts (`save_caller_info`).
- **Returning Caller Greeting:** Pre-loads returning caller facts on session start to welcome them by name and reference their previous study topic (e.g., *"Hello Vaibhav! We earlier talked about Data — would you like to explore that, or try something new today?"*).

---

### Day 5: Domain Function Calls & Dataset
- **Domain Tool:** Implemented `fetch_practice_question(topic, level)` to retrieve practice exercises based on subject and difficulty.
- **Hand-Built Local Dataset:** Uses a hand-built local practice-question dataset included with this project, covering `science`, `math`, and `english` across `beginner`, `intermediate`, and `advanced` levels. (Dataset created/updated in August 2026).
- **Source Note:** Appends source attribution to fetched questions: *"Source Note: This question is fetched from the hand-built local practice-question dataset included with this project. Dataset created/updated in August 2026."*
- **Strict Failure Handling:** When an unsupported topic (e.g., `history`) or level is requested, the tool returns a failure result instructing the agent to inform the user out loud that a practice question is not available in the dataset and suggest available options. The tool **never silently invents or generates** a question on dataset lookup failure.

---

## How to Run the Application

### 1. Backend Setup
```bash
cd backend
uv sync
uv run python src/agent.py dev
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

### 3. Open Application
Navigate to `http://localhost:3000` in your web browser.
