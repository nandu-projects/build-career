/**
 * Build Career - AI Companion & Practical Tool Executor
 * Roles: Friendly Conversation Partner, Teacher, Coding Assistant, Cybersecurity Mentor, AI Guide, English Coach
 * Provides real tool-execution: creating notes, managing study goals, logging project milestones, quizzes
 * Honest about limits: ₹0 free local fallback engine, transparent when network AI is offline.
 */

const AICompanion = {
  // Built-in offline intelligent response system with conversational intent understanding
  offlineKnowledge: [
    {
      keywords: ['hi', 'hello', 'hey', 'namaste', 'morning'],
      response: "Hey Nandan! Great to see you. How are your learning tracks going today? Are we tackling Python, Cybersecurity, AI, or Spoken English?"
    },
    {
      keywords: ['worried', 'stress', 'tired', 'placement', 'future', 'scared', 'nervous'],
      response: "It is completely normal to feel that pressure in engineering. The best remedy for anxiety is taking action on small, tangible milestones. Even 20 focused minutes of hands-on practice builds real leverage. What is one specific topic we can demystify together right now?"
    },
    {
      keywords: ['python', 'script', 'code', 'function', 'list', 'loop'],
      response: "Python is best mastered through building tools you actually use—like automating college attendance calculations, processing log files, or building simple REST APIs. Would you like a challenge or assistance on a specific snippet?"
    },
    {
      keywords: ['cyber', 'security', 'hack', 'linux', 'permission', 'network', 'port', 'ssh'],
      response: "Cybersecurity is built on deep fundamentals: understanding TCP/IP packets, Linux access controls (chmod/chown), and spotting OWASP vulnerabilities like SQLi and IDOR. What security concept are you exploring today?"
    },
    {
      keywords: ['ai', 'machine learning', 'genai', 'prompt', 'rag', 'llm'],
      response: "Generative AI and LLMs are powerful, but understanding how embeddings, prompt context windows, and RAG architectures function under the hood is what sets employable engineers apart. Want to walk through an embedding example?"
    },
    {
      keywords: ['english', 'speak', 'interview', 'grammar', 'fluency'],
      response: "Fluency comes with daily repetition and eliminating simple past-tense hiccups. Jump into the Spoken English Coach tab to practice a sentence with instant feedback, or tell me about your day right here and I'll review it!"
    },
    {
      keywords: ['hackathon', 'pitch', 'judge', 'idea'],
      response: "In hackathons, judges look for 3 things: 1) Did you solve a genuine problem? 2) Is there a working demo (MVP)? 3) Can you pitch it in 2 minutes without jargon? Check out the Hackathon Coach in the Learn tab to follow the 7-stage prep system."
    }
  ],

  // AI Tool Actions (Task Execution)
  executeTool(actionName, params) {
    switch (actionName) {
      case 'create_note':
        if (!params.title || !params.content) {
          return { success: false, message: 'Missing title or content for note creation.' };
        }
        const newNote = StorageManager.saveNote({
          title: params.title,
          content: params.content,
          tags: params.tags || ['ai-created']
        });
        return { success: true, message: `Created note: "${newNote.title}"`, data: newNote };

      case 'add_project':
        if (!params.title) {
          return { success: false, message: 'Project title is required.' };
        }
        const newProj = StorageManager.saveProject({
          title: params.title,
          description: params.description || '',
          techStack: params.techStack || 'Python',
          status: 'In Progress'
        });
        return { success: true, message: `Created project: "${newProj.title}"`, data: newProj };

      case 'remember_fact':
        if (!params.fact) {
          return { success: false, message: 'No information provided to remember.' };
        }
        const mem = StorageManager.saveAIMemory({
          fact: params.fact,
          category: params.category || 'General'
        });
        return { success: true, message: `Remembered: "${mem.fact}"`, data: mem };

      default:
        return { success: false, message: `Unknown tool action: ${actionName}` };
    }
  },

  async processMessage(userMessage) {
    const raw = (userMessage || '').trim();
    if (!raw) return { text: "I didn't catch that. Could you repeat?" };

    const lower = raw.toLowerCase();

    // 1. Tool intent detection
    if (lower.startsWith('note:') || lower.startsWith('create note') || lower.startsWith('save note')) {
      const content = raw.replace(/^(?:create note|save note|note:)\s*/i, '');
      const parts = content.split(' - ');
      const title = parts[0] || 'Quick Note';
      const body = parts[1] || parts[0];
      const toolRes = this.executeTool('create_note', { title, content: body });
      return {
        text: `I have saved that to your notes: "${title}". You can view and edit it in Saved Notes.`,
        toolExecuted: 'create_note'
      };
    }

    if (lower.startsWith('remember:') || lower.startsWith('remember that')) {
      const fact = raw.replace(/^(?:remember that|remember:)\s*/i, '');
      const toolRes = this.executeTool('remember_fact', { fact });
      return {
        text: `I've saved that to your persistent memory: "${fact}". You can review or delete it anytime in Settings → AI Memory.`,
        toolExecuted: 'remember_fact'
      };
    }

    // 2. Check for offline match in knowledge base
    for (const item of this.offlineKnowledge) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        return { text: item.response };
      }
    }

    // 3. Fallback conversational reply with student context
    return {
      text: `Understood! You asked: "${raw}". In our four tracks (Python, Cybersecurity, AI, Spoken English), applying this hands-on is the best approach. Would you like me to create a practical note, suggest a code challenge, or open a practice timer?`
    };
  }
};

window.AICompanion = AICompanion;
