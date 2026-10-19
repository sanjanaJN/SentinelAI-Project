# Sentinel AI — Demonstration of ChatBot using OpenAI
## Digital Safety Intelligence & Incident Assessment Platform

**Assignment Topic:** Demonstration of ChatBot using OpenAI  
**Project Name:** Sentinel AI  
**Target Audience:** Gen Z & Gen Alpha Digital Safety  
**Technology Stack:** Node.js, Express, OpenAI API (`gpt-4o-mini`), HTML5, CSS3, JavaScript (ES6+)  

---

## 1. Executive Summary & Problem Statement

Modern online spaces—ranging from social platforms (Instagram, Snapchat, TikTok) to gaming ecosystems (Roblox, Discord)—expose young digital natives to risks including cyberbullying, predatory grooming, credential phishing, and severe online harassment. 

**Sentinel AI** addresses this challenge by providing an intelligent digital safety counselor. Powered by the **OpenAI Chat Completions API**, the chatbot assists young users in real time by:
1. Explaining why an interaction is dangerous or high-risk.
2. Generating practical, age-appropriate refusal and boundary-setting message drafts.
3. Providing step-by-step reporting and evidence-preservation instructions for specific platforms.
4. Engaging in natural multi-turn conversational dialogue to answer nuanced follow-up questions.

---

## 2. System Architecture

The project employs a secure **Client-Proxy-API Architecture** to prevent the exposure of OpenAI API credentials in client-side code:

```
┌──────────────────────────────────────────────┐
│           CLIENT BROWSER (UI)                │
│  • Modern Dark Cyber-Defense Aesthetic       │
│  • Interaction Analyzer & Timeline           │
│  • Dynamic Dashboard & History (localStorage)│
│  • Sentinel AI Chatbot Window                │
└──────────────────────┬───────────────────────┘
                       │ HTTP / JSON
                       ▼
┌──────────────────────────────────────────────┐
│        NODE.JS / EXPRESS BACKEND             │
│  • Port 3000 (Local Reverse Proxy)           │
│  • Secret Vault (.env -> process.env)        │
│  • Safety Persona Prompt Engineering         │
│  • Context Injection Engine                  │
│  • Error & Rate Limit Shield                 │
└──────────────────────┬───────────────────────┘
                       │ HTTPS / Bearer Token
                       ▼
┌──────────────────────────────────────────────┐
│           OPENAI CLOUD API                   │
│  • Endpoint: /v1/chat/completions            │
│  • Model: gpt-4o-mini                        │
│  • Max Tokens: 800 | Temperature: 0.7        │
└──────────────────────────────────────────────┘
```

### Component Breakdown
1. **Frontend Presentation (`index.html`)**:
   - Self-contained single-page interface with responsive layout, glassmorphic styling, and micro-animations.
   - Communicates with `/api/status` on load to verify connection status.
   - Manages a client-side multi-turn `conversationHistory` array and sends structured payloads to `/api/chat`.
2. **Backend Proxy (`server.js`)**:
   - Built with **Express**, **CORS**, and **dotenv**.
   - Loads the secret `OPENAI_API_KEY` strictly in memory.
   - Injects the comprehensive **Sentinel AI Digital Safety Counselor** system prompt.
   - Enforces context awareness by combining active message scan data with user queries.
3. **OpenAI Cloud Services**:
   - Utilizes `gpt-4o-mini` for high inference speed, low latency, and cost-effective performance while maintaining strong reasoning for safety and refusal drafting.

---

## 3. Chatbot Development & Implementation

### 3.1 Prompt Engineering & Persona Design
The chatbot behavior is governed by a dedicated system prompt designed for digital safety counseling:
- **Tone:** Empathetic, supportive, non-judgmental, protective, and empowering.
- **Pedagogy:** Avoids dry disclaimers; instead, offers concrete advice and sample scripts.
- **Refusal Drafter:** When asked how to reply, generates two distinct options:
  - *Option 1 (Firm & Direct):* Clearly establishes boundaries.
  - *Option 2 (No-Engagement / Neutral):* Minimizes escalation.
- **Crisis & Threat Escalation:** Directs users to trusted adults, platform moderation, and national resources (e.g. 988 Suicide & Crisis Lifeline) when severe threats or self-harm are detected.

### 3.2 Context Injection Engine
When a user analyzes a message in the Interaction Analyzer (left panel), the backend dynamically injects the detection metadata into the OpenAI system prompt:
```json
{
  "pattern": "Potential grooming / manipulative boundary violation",
  "risk": "🔴 HIGH RISK",
  "score": 98,
  "signals": ["Private media solicitation", "Secrecy command"],
  "action": "Cease communication immediately. Do not share private photos."
}
```
This enables the chatbot to answer contextual follow-up questions accurately (e.g., *"Why did you flag that as grooming?"*, *"How should I tell my parents about this?"*).

### 3.3 Multi-Turn Contextual Dialogue
The frontend maintains an ongoing conversation history (`messages` array) that is sent to `/api/chat`. The backend trims and filters the conversation to the most recent 10 turns to balance context retention with prompt efficiency.

### 3.4 Error Handling & Graceful Degradation
- **Missing API Key (HTTP 503):** If `OPENAI_API_KEY` is missing in `.env`, the server returns an explicit `OPENAI_NOT_CONFIGURED` code. The chatbot transparently notifies the user and provides setup instructions rather than fabricating simulated responses.
- **Authentication Failure (HTTP 401):** Informs the user of an invalid API key.
- **Rate Limit / Quota Exceeded (HTTP 429):** Clearly guides the user to inspect their OpenAI billing and credit allocation.
- **Server Offline:** If the frontend is opened without the server running, the status badge reflects `○ OFFLINE (Run npm start)` and the chat window displays exact instructions to launch the backend.

---

## 4. Security & Privacy Considerations

1. **Zero Secret Leakage:**
   - The OpenAI API key exists exclusively in the server environment (`process.env.OPENAI_API_KEY`).
   - The client-side code contains zero hardcoded keys or tokens.
   - `.gitignore` explicitly excludes `.env` and `node_modules/` from version control.
2. **On-Device Data Minimization:**
   - User interaction messages are analyzed in-memory.
   - `localStorage` only stores anonymized aggregate counts (total scans, average confidence) and non-sensitive metadata (timestamps, risk levels). Raw chat text is never persisted to disk.

---

## 5. Step-by-Step Setup & Running Guide

### Step 1: Install Dependencies
Open PowerShell or your terminal in the project directory:
```bash
npm install
```

### Step 2: Configure Your OpenAI API Key
1. Copy the example configuration file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in any text editor and replace the placeholder with your actual OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-proj-your_actual_openai_key_here
   OPENAI_MODEL=gpt-4o-mini
   PORT=3000
   ```

### Step 3: Launch the Server
```bash
npm start
```
You will see:
```
====================================================
 Sentinel AI Server running at http://localhost:3000
 OpenAI Configured: YES (Live)
====================================================
```

### Step 4: Open the Application
Navigate to **`http://localhost:3000`** in your browser.  
The status badge in the chatbot header will indicate: `● OPENAI ACTIVE (gpt-4o-mini)`.

---

## 6. Live Demonstration Script (For Presentation & Evaluation)

Use this script during your assignment demonstration to showcase all key features:

### Scenario 1: Cyberbullying & Safe Reply Drafting
1. **Analyze:** Click the **`⚠ Bullying`** example button and click **`Analyze Interaction with AI →`**.
2. **Ask Follow-Up 1:** In the Sentinel AI Assistant chat box, type:
   > *"Why is this message considered bullying rather than friendly banter?"*
   - *Expected Result:* The OpenAI chatbot explains the targeting, social humiliation, and power imbalance in the message.
3. **Ask Follow-Up 2 (Contextual memory):** Type:
   > *"Draft a firm message I can send back telling them to stop, without starting an argument."*
   - *Expected Result:* The chatbot drafts two safe, calm response options.

### Scenario 2: Predatory Grooming & Involving Adults
1. **Analyze:** Click the **`🚨 Grooming`** example button and click **`Analyze Interaction with AI →`**.
2. **Ask Follow-Up 1:** Type:
   > *"I feel nervous to tell my parents because I replied to them earlier. How can I explain this to them?"*
   - *Expected Result:* The OpenAI chatbot provides an empathetic, reassuring script on how to approach a parent or school counselor without fear of getting in trouble.
3. **Ask Follow-Up 2:** Type:
   > *"How do I report and block this user on Discord or Instagram?"*
   - *Expected Result:* The chatbot outlines step-by-step platform reporting procedures.

### Scenario 3: Credential Phishing & Scam Defense
1. **Analyze:** Click the **`🎣 Scam`** example button and click **`Analyze Interaction with AI →`**.
2. **Ask Follow-Up 1:** Type:
   > *"What happens if someone already entered their password on that link?"*
   - *Expected Result:* The chatbot delivers an immediate incident response checklist (change passwords immediately, revoke active sessions, enable 2FA).

### Scenario 4: Error Handling & System Transparency
1. Open the project without an API key set in `.env` (or run without the server).
2. Type any question into the chat.
3. *Expected Result:* The chatbot clearly displays the configuration guidance notification, proving system transparency rather than spoofing simulated text as OpenAI.

---

## 7. Assignment Evaluation Alignment Matrix

| Evaluation Criteria | Sentinel AI Implementation | Demonstration Evidence |
| :--- | :--- | :--- |
| **Chatbot Development** | Full integration with OpenAI API (`gpt-4o-mini`), multi-turn memory retention, custom safety counselor persona prompt, and real-time status detection. | Verified through interactive question answering, refusal message drafting, and status badge indicators. |
| **Backend & Architecture** | Node.js + Express secure proxy architecture, `.env` secret management, `.gitignore` protection, and comprehensive HTTP error handling. | Server endpoints `/api/status` and `/api/chat` tested with automated test suites (0 errors). |
| **Safety Domain Expertise** | Domain-specific guidance tailored to Gen Z/Alpha covering cyberbullying, grooming, phishing, physical threats, and crisis intervention. | Evaluated across 4 diverse digital safety test scenarios. |
| **Documentation & Report** | Complete architectural diagrams, prompt design rationales, security audits, and step-by-step setup guides. | [`ASSIGNMENT_REPORT.md`](file:///c:/Users/Dell/OneDrive/Desktop/SentinelAI-Project/ASSIGNMENT_REPORT.md) and [`README.md`](file:///c:/Users/Dell/OneDrive/Desktop/SentinelAI-Project/README.md). |
| **Presentation Readiness** | Scripted test scenarios with sample inputs and expected outputs for live demonstration. | Demonstration script provided in Section 6. |

---
*Created as part of the "Demonstration of ChatBot using OpenAI" assignment project.*
