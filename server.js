const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development and proxying (including VS Code Live Server)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

// Helper to check if OpenAI key is validly configured
function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_openai_api_key_here') || key.includes('your_actual_openai')) {
    return null;
  }
  return key.trim();
}

// In-memory flag tracking quota/rate-limit state across session
let quotaExhausted = false;

function isQuotaError(error) {
  if (!error) return false;
  const code = String(error.code || error.type || '');
  const message = String(error.message || '');
  return code === 'insufficient_quota' ||
    code === 'rate_limit_exceeded' ||
    /insufficient[_ ]quota|quota.{0,30}(exceeded|reached|unavailable)|(?:no|zero|out of) credits|credits remaining|billing.{0,30}limit|rate[_ ]limit/i.test(`${code} ${message}`);
}

// Comprehensive, context-aware Digital Safety Counselor for DEMO MODE
function getDemoSafetyReply(context, question, history) {
  const q = String(question || '').trim().toLowerCase();
  const pattern = String(context?.pattern || '').toLowerCase();
  const risk = String(context?.risk || '').toLowerCase();
  const score = context?.score || 0;
  const confidence = context?.confidence || '90%';
  const signals = Array.isArray(context?.signals) ? context.signals : [];
  const signalsText = signals.join(' ').toLowerCase();

  let category = context?.category;
  if (!category || category === 'ambiguous') {
    if (/bully|harass|insult|useless|pathetic|loser|clown/.test(pattern + ' ' + signalsText)) category = 'bullying';
    else if (/groom|secret|private photo|media|boundary/.test(pattern + ' ' + signalsText)) category = 'grooming';
    else if (/scam|phish|password|otp|link|prize|giveaway/.test(pattern + ' ' + signalsText)) category = 'scam';
    else if (/threat|violence|harm|kill|destroy|dead/.test(pattern + ' ' + signalsText)) category = 'threat';
    else if (/crisis|self-harm|suicid|cutting/.test(pattern + ' ' + signalsText)) category = 'crisis';
    else if (/safe|benign|normal|friendly/.test(pattern + ' ' + signalsText)) category = 'safe';
    else category = 'ambiguous';
  }

  // 1. Crisis & Distress situations (Highest Priority)
  if (/crisis|suicid|self.harm|die|kill myself|hurt myself|end it all|can't keep going/.test(q) || category === 'crisis') {
    return `If you or someone you know is in distress or feeling overwhelmed, please know that you do not have to carry this alone. Support is available right now:

• **988 Suicide & Crisis Lifeline:** Call or text **988** (Available 24/7 in the US & Canada, free and confidential).
• **Crisis Text Line:** Text **HOME** to **741741** to connect with a trained crisis counselor.
• **International Resources:** If outside North America, contact your local emergency services or visit [findahelpline.com](https://findahelpline.com).

Please speak with a trusted adult, family member, school counselor, or healthcare professional immediately. People care and want to help you through this.`;
  }

  // 2. Draft refusal / reply message
  if (/draft|reply|say back|tell (them|him|her)|what can i send|how (should|do) i (respond|reply)|message (to|for)|refusal|write/.test(q)) {
    if (category === 'bullying') {
      return `Here are two protective ways to respond to this cyberbullying message:

**Option 1: Firm & Direct (Sets a clear boundary)**
> *"I don't appreciate being spoken to like that. Do not message me again."*

**Option 2: Low-Engagement (De-escalating)**
> *"I'm focusing on other things right now. Leaving this chat."*

**Safety Rules for Replying:**
• **Do not insult back:** Retaliating fuels the harasser's behavior and can be used against you.
• **Save evidence first:** Take clear screenshots showing their username, timestamp, and message before replying or leaving.
• **Block & Report:** Once you state your boundary or leave the chat, mute or block their account immediately.`;
    }
    if (category === 'grooming') {
      return `When dealing with inappropriate boundary-testing or requests for private media, **you do not owe them politeness or secrecy**. Here are two safe response options:

**Option 1: Clear Refusal & Immediate Disengagement**
> *"No. I do not share private photos and I do not keep secret chats. Do not message me again."*

**Option 2: Zero-Engagement (Strongly Recommended)**
> *(Do not send any reply at all. Disengaging immediately prevents manipulative guilt-tripping or negotiation).*

**Essential Next Steps:**
1. **Preserve screenshots:** Capture the conversation including their username and profile ID.
2. **Block across all platforms:** Prevent them from reaching you on alternate channels.
3. **Tell a trusted adult right now:** You did nothing wrong, and you do not have to keep this a secret. Talk to a parent, older sibling, teacher, or counselor.`;
    }
    if (category === 'scam') {
      return `For scams, phishing, and credential lures, **the best response is NO response**. Replying confirms your account or phone number is active.

**If you must send a refusal:**
> *"I do not share passwords, verification codes, or click unverified links."*

**Immediate Defense Steps:**
• Do **not** click any links in the message.
• Do **not** share OTP/2FA codes, PINs, or account credentials under any circumstance.
• Use the platform's **Report -> Spam / Scam** option and block the sender.`;
    }
    if (category === 'threat') {
      return `**Do NOT engage with or reply to physical threats.** Responding can escalate their hostility or give them more personal information.

**Immediate Safety Protocol:**
1. **Do not reply:** Silence protects you from escalating the confrontation.
2. **Save evidence immediately:** Take uncropped screenshots displaying the threat, date, time, and sender identity.
3. **Notify guardians or authorities:** If someone threatens physical violence, doxxing, or stalking, alert a parent, school principal, or local police immediately.`;
    }
    return `Here are two safe, constructive ways to respond:

**Option 1: Direct & Courteous**
> *"Thanks for checking in! I'm all set for now, but I'll let you know if anything comes up."*

**Option 2: Setting a Simple Boundary**
> *"I'm keeping my digital time focused today, so I won't be checking messages often."*

Always remember: only share personal information with people you know and trust in the real world.`;
  }

  // 3. Why / Classification explanation
  if (/why.*(flag|classif|consider|risk|bully|groom|threat|scam|high|bad|danger|harm)|reason|explanation/.test(q)) {
    if (category === 'bullying') {
      return `This interaction was classified as **${risk}** (${pattern}) with a **${score}% risk score** for the following key reasons:

• **Targeted Degradation:** The message uses personal attacks or humiliating phrasing intended to make the recipient feel unwelcome, inferior, or excluded.
• **Social Hostility:** Phrasing such as group mockery or insults creates a power imbalance and emotional distress.
• **Evaluated Signals:** ${signals.length > 0 ? signals.join('; ') : 'Hostile language tokens and social humiliation patterns'}.

Cyberbullying is never the recipient's fault. Sentinel AI recommends saving screenshots and reporting the sender rather than trading insults.`;
    }
    if (category === 'grooming') {
      return `This interaction was flagged as **${risk}** (${pattern}) with a **${score}% risk score** because it contains classic grooming signatures:

• **Secrecy Pressure:** Demands such as *"don't tell your parents"* or *"keep this our secret"* are designed to isolate young users from their protective network.
• **Boundary Testing:** Asking for private photos or personal contact details violates healthy online boundaries.
• **Evaluated Signals:** ${signals.length > 0 ? signals.join('; ') : 'Coercive secrecy paired with private media solicitation'}.

When secrecy and private content requests appear together, the risk escalates significantly. Ceasing contact and informing a parent or guardian is critical.`;
    }
    if (category === 'scam') {
      return `This interaction was flagged as **${risk}** (${pattern}) with a **${score}% risk score** because it exhibits common phishing and financial fraud tactics:

• **Bait & Lure:** Offers of "free prizes", game currency, or urgent notifications designed to lower your guard.
• **Credential Harvesting:** Requests to click an external link and enter passwords, PINs, or 2FA codes.
• **Artificial Urgency:** Creating pressure to act fast before having time to verify the sender.
• **Evaluated Signals:** ${signals.length > 0 ? signals.join('; ') : 'Credential solicitation combined with external link lure'}.

Legitimate companies and moderators will never ask you to reveal your password or one-time codes.`;
    }
    if (category === 'threat') {
      return `This interaction was flagged as **${risk}** (${pattern}) with a **${score}% risk score** because:

• **Direct Harm Intent:** It contains explicit language indicating violence, stalking, physical harm, or doxxing.
• **Severe Impact:** Physical threats compromise personal safety and violate both platform terms of service and legal standards.
• **Evaluated Signals:** ${signals.length > 0 ? signals.join('; ') : 'Direct threat tokens and intimidation markers'}.

Treat any physical threat seriously by documenting evidence and involving responsible adults or emergency services immediately.`;
    }
    if (category === 'safe') {
      return `This interaction was classified as **${risk}** (${pattern}) with a very low risk score (**${score}%**):

• **Constructive Intent:** The message exhibits collaborative, educational, or courteous language without hostility or coercion.
• **No Risk Triggers:** No predatory requests, secrecy commands, credential solicitations, or threats were detected.
• **Model Confidence:** High confidence (${confidence}) based on standard benign communication patterns.`;
    }
    return `This interaction has a **${score}% risk score** with **${confidence} confidence**. It was flagged because of ambiguous or concerning linguistic markers that require careful review before proceeding.`;
  }

  // 4. Reporting & Blocking instructions
  if (/how.*(report|block)|report.*(discord|instagram|snapchat|tiktok|roblox)|steps to report|evidence/.test(q)) {
    return `Here is the step-by-step procedure to report and block this user:

**1. Preserve Full Evidence First**
• Take uncropped screenshots showing the sender's username, profile handle, the full message, and the date/time.
• Do not crop or edit the screenshots so they remain valid evidence.

**2. In-App Platform Reporting**
• **Instagram:** Tap the '...' in the top right of the chat or profile -> tap **Report** -> select the specific reason (Harassment, Scams, or Nudity).
• **Discord:** Right-click the message -> select **Report Message** -> select the violation category.
• **Snapchat:** Press and hold the message or sender's name -> tap **Manage Friendship** -> **Report** -> select the issue.
• **TikTok / Roblox:** Use the flag or report button on their profile or chat.

**3. Block the Account**
• Immediately block the user so they cannot send further messages or view your profile.
• In privacy settings, restrict your DMs so only verified friends can message you.`;
  }

  // 5. Talking to parents / trusted adults
  if (/tell.*(parent|mom|dad|adult|family|teacher|counselor)|nervous|scared|trouble|replied earlier/.test(q)) {
    return `It is completely normal to feel nervous about telling a parent or trusted adult, especially if you replied to the person earlier. **Remember:**

1. **You are NOT in trouble:** Being targeted, manipulated, or harassed online is never your fault. Good parents care about your safety, not about being angry.
2. **Online predators and bullies rely on your fear:** They count on you feeling too embarrassed to ask for help. Involving an adult takes away their power.

**Here is a simple script to start the conversation:**
> *"Mom / Dad, something happened online today that made me uncomfortable. Someone sent me weird/upsetting messages, and Sentinel AI flagged it as risky. Can I show you the screenshots so you can help me handle it?"*

If you don't feel comfortable talking to your parents right away, consider confiding in a school counselor, favorite teacher, older sibling, or aunt/uncle.`;
  }

  // 6. Already compromised / clicked link or entered password
  if (/already.*(enter|gave|clicked|sent|share)|entered.*password|clicked.*link|account.*hack/.test(q)) {
    return `**Immediate Incident Response Protocol:**

1. **Change Passwords Immediately:**
   Go directly to the official website or app (do NOT use links from the chat). Change your password to a strong, unique passphrase.
2. **Log Out of All Active Sessions:**
   In account security settings, click **"Sign out of all sessions / devices"** to kick out any unauthorized access.
3. **Enable Two-Factor Authentication (2FA):**
   Turn on 2FA using an authenticator app (like Google Authenticator) rather than SMS where possible.
4. **Scan for Malware:**
   If you downloaded any file from the link, disconnect from Wi-Fi and run a full antivirus/malware scan.
5. **If Financial Information Was Entered:**
   Immediately inform your parents or contact your bank to freeze the card and dispute unauthorized charges.`;
  }

  // 7. Signals inquiry
  if (/what.*signal|which.*signal|signals.*detected|evidence.*found/.test(q)) {
    if (signals.length > 0) {
      return `The Sentinel AI heuristic scanner detected the following safety signals in this interaction:

${signals.map(s => `• **${s}**`).join('\n')}

These signals were weighted together to calculate the **${score}% risk score** and **${confidence} model confidence**.`;
    }
    return `No high-risk threat signals were triggered in this interaction. Standard digital communication patterns were observed.`;
  }

  // 8. Risk score vs Confidence inquiry
  if (/difference|risk.*confidence|confidence.*score|what is confidence|what is risk/.test(q)) {
    return `Here is the difference between **Risk Score** and **AI Confidence**:

• **Risk Score (${score}%):** Measures the estimated **severity of potential harm**. 0% represents completely harmless dialogue, while 100% represents critical safety emergencies (threats, exploitation, crisis).
• **AI Confidence (${confidence}):** Measures the **certainty of the classification model**. It reflects how strongly the detected linguistic tokens match known patterns in the safety database.

*Example:* A message can have a high risk score (88%) with moderate confidence (75%) if a serious threat word was used in ambiguous context.`;
  }

  // 9. DO's and DON'Ts
  if (/what.*(should|do|next)|help|steps|advice|action/.test(q)) {
    return `**Recommended Actions for This Assessment:**

• **Action:** ${context?.action || 'Review interaction context and exercise digital privacy precautions.'}
• **Save Evidence:** Capture clear screenshots before deleting or blocking.
• **Set Boundaries:** Cease responding if the sender becomes aggressive or coercive.
• **Platform Moderation:** Utilize reporting tools to protect yourself and other users.
• **Ask For Support:** Involve a trusted adult if the conversation causes distress or safety concerns.`;
  }

  if (/what.*not|avoid|don't|dont/.test(q)) {
    return `**Key Things NOT To Do:**

• **DON'T retaliate or insult back:** That escalates arguments and creates mutual violations.
• **DON'T share credentials:** Never disclose passwords, PINs, or 2FA codes.
• **DON'T send private media:** Never feel obligated to share photos or personal coordinates.
• **DON'T keep dangerous secrets:** If someone insists on hiding things from your parents, that is a major red flag.
• **DON'T delete evidence before saving:** Always capture screenshots first before blocking.`;
  }

  // Default context-aware fallback
  return `Based on the active analysis (${risk || 'Assessment'}, ${score}% risk score), here is key guidance:

• **Pattern:** ${context?.pattern || 'General online interaction'}
• **Primary Advice:** ${context?.action || 'Do not share passwords, private images, or sensitive details with unknown contacts.'}
• **Next Steps:** Save screenshots of concerning dialogue, use platform blocking tools, and talk to a trusted adult if you feel pressured or unsafe.

You can ask me to draft a refusal message, explain how to report this on specific platforms, or explain why this was flagged!`;
}

// 1. Status Check Endpoint (GET)
app.get('/api/status', (req, res) => {
  const key = getOpenAIKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const isDemo = process.env.DEMO_MODE === 'true' || quotaExhausted;
  res.json({
    configured: !!key,
    model: model,
    service: 'Sentinel AI Backend',
    demoMode: isDemo,
    quotaExhausted: quotaExhausted
  });
});

// Reject unsupported HTTP methods on /api/status with 405 Method Not Allowed
app.all('/api/status', (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'The /api/status endpoint only supports GET requests.'
    });
  }
});

// Reject GET on /api/chat with 405 Method Not Allowed
app.get('/api/chat', (req, res) => {
  res.setHeader('Allow', 'POST');
  return res.status(405).json({
    error: 'METHOD_NOT_ALLOWED',
    message: 'The /api/chat endpoint only supports POST requests with a JSON body containing messages and optional context.'
  });
});

// 2. Chat Completions Endpoint (POST)
app.post('/api/chat', async (req, res) => {
  const requestBody = req.body && typeof req.body === 'object' ? req.body : {};
  const { messages, context } = requestBody;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'The request must contain an array of messages.' });
  }

  const conversationMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10);
  const lastUserMsg = conversationMessages.filter(m => m.role === 'user').at(-1)?.content || '';
  if (!lastUserMsg) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'The request must contain at least one user message.' });
  }

  // If DEMO_MODE is explicitly enabled or quota was previously exhausted, respond immediately in Demo Mode
  if (process.env.DEMO_MODE === 'true' || quotaExhausted) {
    const demoReply = getDemoSafetyReply(context, lastUserMsg, conversationMessages);
    return res.json({
      reply: demoReply,
      mode: 'demo',
      demo: true,
      reason: quotaExhausted ? 'openai_quota_exhausted' : 'demo_mode_enabled'
    });
  }

  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return res.status(503).json({
      error: 'OPENAI_NOT_CONFIGURED',
      message: 'Live OpenAI connection is unavailable. The backend does not have an OPENAI_API_KEY configured in .env.',
      instructions: 'To enable live AI responses: 1) Copy .env.example to .env, 2) Insert your OpenAI API key (OPENAI_API_KEY=sk-...), 3) Restart the server with "npm start".'
    });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Sentinel AI System Persona
  let systemPrompt = `You are Sentinel AI, an empathetic, highly intelligent digital safety counselor and assistant specialized in protecting Gen Z and Gen Alpha users in online spaces.
Your mission is to provide clear, age-appropriate, practical, and protective advice on cyberbullying, online harassment, predatory grooming, scams/phishing, physical threats, privacy settings, and crisis situations.

Communication Guidelines:
- Tone: Calm, supportive, non-judgmental, protective, and empowering.
- Structure: Use clean, concise markdown with bullet points, bold key phrases, and short paragraphs.
- Practical Help: When asked how to reply, draft realistic, protective refusal or boundary-setting messages (e.g., "Firm & Direct", "Brief / No Engagement").
- Cyberbullying: Advise against aggressive retaliation; recommend preserving evidence (screenshots), blocking/muting, and confiding in a trusted mentor or guardian.
- Grooming / Boundary Crossing: Urge immediate cessation of contact, no private photo sharing, preserving evidence, blocking, and telling a parent/guardian or trusted adult immediately.
- Phishing & Scams: Emphasize never sharing passwords, PINs, or 2FA/OTP codes, never clicking suspicious links, and reporting the account.
- Physical Threats & Crisis: Treat threats seriously (document and report to authorities/guardians). For personal crisis or self-harm, provide compassionate support and mention the 988 Suicide & Crisis Lifeline (call/text 988 in US/Canada) or Crisis Text Line (text HOME to 741741).
- Context Awareness: If an interaction analysis is provided, reference its specific patterns, risk levels, and detected signals to give tailored guidance.
- Always retain context from previous conversational turns to support natural follow-up questions.`;

  if (context && (context.pattern || context.risk)) {
    systemPrompt += `\n\nCURRENT INTERACTION CONTEXT IN SENTINEL ANALYZER:
- Threat Classification: ${context.pattern || 'Not classified'}
- Risk Severity: ${context.risk || 'Unknown'} (${context.score || 0}% risk score)
- Detected Safety Signals: ${Array.isArray(context.signals) ? context.signals.join(', ') : (context.signals || 'None')}
- Recommended Action: ${context.action || 'Standard digital safety precautions.'}
${context.inputText ? `- Sample Flagged Text: "${String(context.inputText).slice(0, 300)}"` : ''}
Reference these details when the user asks questions about this specific message.`;
  }

  const cleanMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationMessages
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: cleanMessages,
        max_tokens: 800,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const statusCode = response.status;
      const apiError = errData.error || {};
      const errorCode = String(apiError.code || apiError.type || '');
      const errorMsg = String(apiError.message || '');

      // Seamlessly handle rate limits (429) or quota exhaustion with clearly labelled DEMO MODE
      if (statusCode === 429 || statusCode === 402 || isQuotaError(apiError)) {
        quotaExhausted = true; // Cache state so subsequent requests respond instantly without delay
        const demoReply = getDemoSafetyReply(context, lastUserMsg, conversationMessages);
        return res.json({
          reply: demoReply,
          mode: 'demo',
          demo: true,
          reason: 'openai_quota_unavailable',
          quotaDetails: errorMsg || 'OpenAI API quota exhausted (zero balance) or rate limit reached.'
        });
      }

      let userMsg = 'OpenAI API encountered an error.';
      if (statusCode === 401) {
        userMsg = 'Invalid OpenAI API key. Please check your key in the .env file.';
      } else if (statusCode >= 500) {
        userMsg = 'OpenAI service is temporarily unavailable. Please try again shortly.';
      }

      return res.status(statusCode).json({
        error: 'OPENAI_API_ERROR',
        status: statusCode,
        message: userMsg,
        details: apiError.message || response.statusText
      });
    }

    const data = await response.json().catch(() => null);
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({
        error: 'INVALID_OPENAI_RESPONSE',
        message: 'OpenAI returned an unexpected response. Please try again shortly.'
      });
    }

    res.json({
      reply: reply,
      mode: 'openai',
      model: data.model || model,
      usage: data.usage || null
    });
  } catch (err) {
    // If request timed out or network failed, fallback gracefully to demo mode if key was configured
    if (err.name === 'TimeoutError' || err.code === 'UND_ERR_CONNECT_TIMEOUT') {
      quotaExhausted = true;
      const demoReply = getDemoSafetyReply(context, lastUserMsg, conversationMessages);
      return res.json({
        reply: demoReply,
        mode: 'demo',
        demo: true,
        reason: 'openai_timeout_fallback'
      });
    }

    console.error('Fetch error calling OpenAI:', err.message);
    res.status(502).json({
      error: 'SERVER_NETWORK_ERROR',
      message: 'Could not reach the OpenAI API. Check the server internet connection and try again.'
    });
  }
});

// Fallback route to serve index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Sentinel AI Server running at http://localhost:${PORT}`);
    console.log(` OpenAI Configured: ${getOpenAIKey() ? 'YES (Live)' : 'NO (Add key to .env)'}`);
    console.log(` Demo Mode Available: YES`);
    console.log(`====================================================`);
  });
}

module.exports = app;
