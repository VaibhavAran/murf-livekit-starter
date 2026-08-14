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

### Day 6: Outbound Calls & Telephony (SIP / Linphone)
- **Outbound Use Case:** Scheduled Daily Practice Nudge / Learning Reminder Call.
- **Outbound Opening Protocol (Step 4 Requirement):** When an outbound call connects, the agent immediately **speaks first** (via `session.say`) enforcing a strict 3-part opening:
  1. **Who is calling:** *"Namaste [Name], this is your AI Learning Companion..."*
  2. **Why:** *"calling for your scheduled daily practice session."*
  3. **How to stop:** *"If you want to stop receiving these daily practice calls, just say 'stop calling me' or hang up."*
- **Agent Dispatch & Telephony Support:** `outbound_call.py` dynamically creates an outbound room, dispatches the `my-agent` worker, and initiates a SIP call to your **Linphone** softphone or phone number.
- **Dynamic Configuration:** Reads `LIVEKIT_SIP_OUTBOUND_TRUNK_ID` and `LINPHONE_SIP_URI` dynamically from `.env.local` without hardcoded parameters. Automatically sanitizes SIP usernames (`user` vs `sip:user@host`).
- **Telephony Noise Cancellation:** Automatically activates `BVCTelephony` noise suppression for SIP streams.

---

### Day 7: Know When to Ask for Human Help (Escalation & Dashboard)
- **Escalation Triggers:**
  1. **Learner Frustration / Distress:** When the student is visibly upset or struggling repeatedly after multiple attempts.
  2. **Human Teacher Request:** When the student explicitly asks to talk to a real teacher or human mentor.
- **Verbal Consent Rule:** Before creating a ticket, the agent explicitly asks permission: *"I can create a help request so a human teacher can follow up with you. May I send a brief summary of what we're working on to a teacher?"*
- **Escalation Tool:** `create_escalation(reason, urgency, summary, preferred_contact, caller_name)` generates a unique reference ticket (e.g. `TICKET-8912`).
- **Clear Expectations:** Gives the user their Reference ID and explains that a teacher will review their summary within 24 hours. Does not promise immediate resolution.
- **Live Teacher Dashboard:** Real-time dashboard at `http://localhost:3000/escalations` backed by SQLite storing and displaying all open escalation tickets with urgency badges, session summaries, and timestamps.

---

### Day 8: Call Analytics Dashboard
- **Success Criteria:** A call is recorded as **SUCCESSFUL** if the learner completes a practice exercise (`fetch_practice_question`), requests a teacher escalation (`create_escalation`), or saves their profile. Calls ending early without reaching these criteria are recorded as **FAILED**.
- **Automated Call Logging:** When any call session (browser or SIP) ends, an agent shutdown callback calculates the call duration, checks metrics, and logs the call outcome to SQLite `call_logs`.
- **Live Analytics Dashboard:** Interactive dashboard at `http://localhost:3000/analytics` showing real-time metrics (Total Calls, Successful Calls, Failed Calls, Success Rate %) and recent call logs.
- **Privacy Protection:** Displays only sanitized operational metrics and call metadata without private passwords, PINs, or conversation transcripts.

---

### Day 9: Specialist Agent Handoff
- **Specialist Agent:** Math Practice Specialist Agent (`MathSpecialistAssistant`).
  - **Job Focus:** Step-by-step arithmetic, equation parsing, and guidance on algebraic problems.
- **Handoff Tool:** `transfer_to_math_specialist` uses LiveKit's `session.update_agent(...)` to dynamically hot-swap the active voice agent mid-conversation.
- **Context Preservation:** Passes the math question and learner profile context directly to the specialist during handoff so the student never has to repeat themselves.
- **Clear Handoff Flow:** The general companion announces the handoff out loud (*"I will transfer you to our Math Specialist Agent..."*), and the Math Specialist takes over and immediately introduces itself (*"Hello! I am your Math Specialist. Let's solve..."*).

---

## How to Run the Application

### 1. Backend Setup
```bash
cd backend
uv sync
uv run python src/agent.py dev
```

### 2. Triggering Outbound SIP Calls (Day 6)
Make sure `LINPHONE_SIP_URI` and `LIVEKIT_SIP_OUTBOUND_TRUNK_ID` are set in `backend/.env.local`, then run:
```bash
cd backend
# Uses variables configured in .env.local:
uv run python src/outbound_call.py

# Or explicitly pass flags via CLI:
uv run python src/outbound_call.py --sip "vaibhav_aran00" --trunk "ST_AWbaz5AK9P7e"
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
pnpm dev
```

### 4. Dashboards & Web UI
- **Voice Agent UI:** `http://localhost:3000`
- **Teacher Escalations Dashboard (Day 7):** `http://localhost:3000/escalations`
- **Call Analytics Dashboard (Day 8):** `http://localhost:3000/analytics`
