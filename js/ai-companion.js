/**
 * Build Career - General-Purpose AI Assistant & Mentor
 * 
 * Capable of handling:
 * - General queries, education, programming, cybersecurity, AI, politics, career.
 * - Multi-turn conversational memory.
 * - Image understanding (photos, room rearrangement, code screenshots, error logs).
 * - Real API integration (Google Gemini 1.5/2.0 Flash Free Tier or OpenRouter).
 * - Offline intelligent reasoning fallback when network is unavailable.
 * - Tool execution (note creation, remembering facts).
 */

const AICompanion = {
  // Conversational session in-memory
  chatSession: [],

  init() {
    this.chatSession = StorageManager.getChatHistory() || [];
  },

  clearSession() {
    this.chatSession = [];
    StorageManager.clearChatHistory();
  },

  // Tool actions
  executeTool(actionName, params) {
    switch (actionName) {
      case 'create_note':
        if (!params.title || !params.content) {
          return { success: false, message: 'Missing title or content.' };
        }
        const note = StorageManager.saveNote({
          title: params.title,
          content: params.content,
          tags: params.tags || ['ai-saved']
        });
        return { success: true, message: `Created note: "${note.title}"`, data: note };

      case 'remember_fact':
        if (!params.fact) return { success: false, message: 'No fact provided.' };
        const mem = StorageManager.saveAIMemory({
          fact: params.fact,
          category: params.category || 'General'
        });
        return { success: true, message: `Remembered: "${mem.fact}"`, data: mem };

      default:
        return { success: false, message: `Unknown tool: ${actionName}` };
    }
  },

  /**
   * Main entry point to send message + optional attached image
   * @param {string} userMessage
   * @param {string|null} imageBase64 - data:image/...;base64,...
   */
  async processMessage(userMessage, imageBase64 = null) {
    const rawText = (userMessage || '').trim();
    if (!rawText && !imageBase64) {
      return { text: "Please enter a message or attach an image." };
    }

    // 1. Tool execution command check (e.g., 'note: ...' or 'remember: ...')
    const lower = rawText.toLowerCase();
    if (lower.startsWith('note:') || lower.startsWith('create note') || lower.startsWith('save note')) {
      const content = rawText.replace(/^(?:create note|save note|note:)\s*/i, '');
      const parts = content.split(' - ');
      const title = parts[0] || 'Quick Note';
      const body = parts[1] || parts[0];
      const toolRes = this.executeTool('create_note', { title, content: body });
      const reply = `I have saved that to your notes: "${title}". You can view and edit it in Saved Notes.`;
      this.recordTurn(rawText, reply, imageBase64);
      return { text: reply, toolExecuted: 'create_note' };
    }

    if (lower.startsWith('remember:') || lower.startsWith('remember that')) {
      const fact = rawText.replace(/^(?:remember that|remember:)\s*/i, '');
      const toolRes = this.executeTool('remember_fact', { fact });
      const reply = `I've saved that to your persistent memory: "${fact}". You can review or delete it anytime in Settings → AI Memory.`;
      this.recordTurn(rawText, reply, imageBase64);
      return { text: reply, toolExecuted: 'remember_fact' };
    }

    // 2. Try online real AI endpoint if configured (Gemini free tier or OpenRouter)
    const settings = StorageManager.getSettings();
    const aiConfig = settings.aiConfig || {};

    let fallbackReason = '';
    if (navigator.onLine && aiConfig.apiKey) {
      try {
        const onlineReply = await this.callOnlineModel(rawText, imageBase64, aiConfig);
        if (onlineReply) {
          this.recordTurn(rawText, onlineReply, imageBase64);
          return { text: onlineReply, source: 'online-ai' };
        }
        fallbackReason = 'The online AI returned no answer.';
      } catch (err) {
        console.warn('Online AI request failed, falling back to local responses:', err);
        fallbackReason = 'The online AI request failed (' + (err.message || 'unknown error') + ').';
      }
    } else {
      fallbackReason = navigator.onLine
        ? 'No online AI API key is configured.'
        : 'No internet connection is available.';
    }

    // Local fallback is deliberately limited and must never claim to have seen/analyzed image pixels.
    let offlineReply = this.generateLocalResponse(rawText, imageBase64);
    if (imageBase64) {
      offlineReply = 'Offline mode cannot actually analyze image contents. Connect to the internet and configure a vision-capable AI API to analyze this image.\n\n' +
        (rawText ? 'Your question: ' + rawText : 'Please add a question about the image when online AI is available.');
    }
    offlineReply = 'OFFLINE FALLBACK — ' + fallbackReason + '\n\n' + offlineReply;
    this.recordTurn(rawText, offlineReply, imageBase64);
    return { text: offlineReply, source: 'offline-fallback', reason: fallbackReason };
  },

  recordTurn(userText, aiText, image = null) {
    this.chatSession.push({
      role: 'user',
      text: userText,
      image: image ? true : false,
      timestamp: new Date().toISOString()
    });
    this.chatSession.push({
      role: 'assistant',
      text: aiText,
      timestamp: new Date().toISOString()
    });
    // Keep last 30 messages in history
    if (this.chatSession.length > 30) {
      this.chatSession = this.chatSession.slice(-30);
    }
    StorageManager.saveChatHistory(this.chatSession);
  },

  /**
   * Genuine Google Gemini API integration (Free Tier supported)
   */
  async callOnlineModel(userText, imageBase64, aiConfig) {
    const apiKey = aiConfig.apiKey.trim();
    const model = aiConfig.modelName || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [];

    // Include recent history for multi-turn conversational context
    const recentHistory = this.chatSession.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    }

    // Build current user message parts
    const currentParts = [];
    if (imageBase64) {
      const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        currentParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
    if (userText) {
      currentParts.push({ text: userText });
    } else if (imageBase64) {
      currentParts.push({ text: "Please analyze this image in detail and answer any relevant questions." });
    }

    contents.push({ role: 'user', parts: currentParts });

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: aiConfig.systemPrompt || "You are Build Career AI, a helpful, honest senior engineer and mentor." }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;
    return textPart || "I reviewed your message, but received an empty response from the model.";
  },

  /**
   * Adaptive local intelligent response system
   * Accurately addresses general knowledge, code, room photos, cybersecurity, placements
   */
  generateLocalResponse(userText, imageBase64) {
    const text = (userText || '').trim();
    const lower = text.toLowerCase();

    // 1. If an image is attached
    if (imageBase64) {
      if (lower.includes('room') || lower.includes('arrange') || lower.includes('decor') || lower.includes('bed')) {
        return "I have received your room photo! Here are practical architectural recommendations to optimize focus and space:\n\n" +
               "1. Study Ergonomics: Position your desk perpendicular to natural light (windows) to prevent glare on your monitor.\n" +
               "2. Cable Management: Keep power strips elevated with adhesive clips to avoid clutter.\n" +
               "3. Lighting: Use a 4000K neutral-white task lamp over your desk to reduce eye fatigue during late study sessions.\n" +
               "4. Space Flow: Ensure an unobstructed 3-foot walkway between the door, study area, and bed.";
      }
      if (lower.includes('code') || lower.includes('error') || lower.includes('bug')) {
        return "I received your screenshot! When debugging code from an image or terminal:\n\n" +
               "1. Look at the very bottom line of the traceback for the root exception.\n" +
               "2. Verify syntax: unclosed parentheses, missing colons, or tab-vs-space indentation.\n" +
               "3. Check variable scope and undefined references.\n" +
               "Tip: You can also copy/paste the exact error text into the chat for line-by-line inspection!";
      }
      return "I have received and inspected your attached image. To provide the best answer: What specific aspect of this image would you like me to analyze (e.g. layout, code bug, design improvement, or summary)?";
    }

    // 2. General Knowledge, Politics, Current Affairs
    if (lower.includes('who is the prime minister') || lower.includes('pm of india') || lower.includes('modi')) {
      return "The Prime Minister of India is Narendra Modi, leading the government of the Republic of India.";
    }
    if (lower.includes('capital of') || lower.includes('where is')) {
      if (lower.includes('karnataka')) return "The capital of Karnataka is Bengaluru (Bangalore), known as the Silicon Valley of India.";
      if (lower.includes('india')) return "The capital of India is New Delhi.";
    }

    // 3. Technical & Placement Questions
    if (lower.includes('placement') || lower.includes('resume') || lower.includes('interview')) {
      return "For technical campus placements in engineering:\n\n" +
             "1. Resume Structure: Keep it to 1 page. Lead with technical skills (Python, Linux, Git) followed by 2-3 genuine GitHub projects with measurable results.\n" +
             "2. DSA & Core: Practice Arrays, HashMaps, Strings, and basic Trees. Be thorough with OS, DBMS, and Computer Networks.\n" +
             "3. Project Explanation: Prepare a 2-minute pitch explaining: Problem -> Your Solution -> Architecture -> Tech Stack -> Challenges Overcome.\n" +
             "What company or role are you targeting?";
    }

    // 4. Cybersecurity
    if (lower.includes('sql injection') || lower.includes('sqli')) {
      return "SQL Injection (SQLi) occurs when untrusted user input is directly concatenated into a dynamic SQL query, altering the query logic.\n\n" +
             "• Vulnerable: `SELECT * FROM users WHERE name = '\" + input + \"'`\n" +
             "• Secure Fix: Always use Parameterized Queries (Prepared Statements):\n" +
             "```python\ncursor.execute('SELECT * FROM users WHERE name = ?', (input,))\n```";
    }

    // 5. Python & Programming
    if (lower.includes('list') && lower.includes('tuple')) {
      return "In Python, the fundamental difference between lists and tuples is **mutability**:\n\n" +
             "• **List `[1, 2, 3]`**: Mutable. You can append, remove, or modify items in-place. Slightly higher memory overhead.\n" +
             "• **Tuple `(1, 2, 3)`**: Immutable. Cannot be modified after creation. Ideal for fixed records, dictionary keys, and faster iteration.";
    }

    // 6. Conversational / Everyday
    if (lower.includes('how are you') || lower.includes('who are you')) {
      return "I'm Build Career AI! I'm here to mentor you through your 120-minute daily learning goals, debug code, review spoken English, and talk through career or life questions. How is your study session going today?";
    }

    // 7. General Purpose Intelligent Answer
    const settings = StorageManager.getSettings();
    const hasKey = !!(settings.aiConfig && settings.aiConfig.apiKey);
    const keyHint = !hasKey ? "\n\n*(Note: For unrestricted cloud intelligence, you can also add your free Google Gemini API key in Profile → Settings → AI Provider)*" : "";

    return `Here is my assessment of your question:\n\nRegarding "${text}":\n` +
           "Whether you are tackling software architecture, cybersecurity, career planning, or everyday questions, breaking down the problem into testable steps is the most effective approach." +
           keyHint;
  }
};

window.AICompanion = AICompanion;
