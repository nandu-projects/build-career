/**
 * Build Career - Storage & Database Layer
 * Reliable JSON/IndexedDB/LocalStorage persistence
 * Handles migrations, date rollover, task completions, timers, notes, projects, memory, backup & restore
 */

const STORAGE_KEYS = {
  SETTINGS: 'buildcareer_settings',
  TRACKS_PROGRESS: 'buildcareer_tracks_progress',
  DAILY_SESSIONS: 'buildcareer_daily_sessions',
  NOTES: 'buildcareer_notes',
  PROJECTS: 'buildcareer_projects',
  AI_MEMORY: 'buildcareer_ai_memory',
  AI_CHAT_HISTORY: 'buildcareer_ai_chat_history',
  HACKATHON_STATE: 'buildcareer_hackathon_state',
  ENGLISH_COACH: 'buildcareer_english_coach',
  ACTIVE_TIMER: 'buildcareer_active_timer'
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  dailyGoals: {
    python: 30, // minutes
    cybersecurity: 40,
    ai: 25,
    english: 25
  },
  aiVoice: {
    voiceId: 'native-in-en',
    voiceName: 'Indian English (Natural)',
    speed: 1.0,
    pitch: 1.0,
    lang: 'en-IN'
  },
  memoryEnabled: true,
  offlineMode: false,
  userName: 'Nandan'
};

const StorageManager = {
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.error('Failed to load settings:', e);
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  },

  getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getDailyRecord(dateStr = this.getTodayString()) {
    try {
      const allSessions = this.getAllDailyRecords();
      if (!allSessions[dateStr]) {
        allSessions[dateStr] = {
          date: dateStr,
          studiedMinutes: {
            python: 0,
            cybersecurity: 0,
            ai: 0,
            english: 0
          },
          completedTasks: {}, // taskId: true
          notesCreated: 0,
          timerSessions: []
        };
        this.saveAllDailyRecords(allSessions);
      }
      return allSessions[dateStr];
    } catch (e) {
      console.error('Error fetching daily record:', e);
      return {
        date: dateStr,
        studiedMinutes: { python: 0, cybersecurity: 0, ai: 0, english: 0 },
        completedTasks: {},
        notesCreated: 0,
        timerSessions: []
      };
    }
  },

  getAllDailyRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_SESSIONS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Failed to parse daily sessions:', e);
      return {};
    }
  },

  saveAllDailyRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_SESSIONS, JSON.stringify(records));
      return true;
    } catch (e) {
      console.error('Failed to save daily records:', e);
      return false;
    }
  },

  addStudyTime(trackKey, minutes) {
    const today = this.getTodayString();
    const records = this.getAllDailyRecords();
    if (!records[today]) {
      this.getDailyRecord(today);
    }
    const current = this.getAllDailyRecords();
    if (!current[today].studiedMinutes) {
      current[today].studiedMinutes = { python: 0, cybersecurity: 0, ai: 0, english: 0 };
    }
    current[today].studiedMinutes[trackKey] = (current[today].studiedMinutes[trackKey] || 0) + minutes;
    this.saveAllDailyRecords(current);
  },

  toggleTaskCompletion(taskId, lessonId, trackKey) {
    const today = this.getTodayString();
    const records = this.getAllDailyRecords();
    if (!records[today]) {
      this.getDailyRecord(today);
    }
    const all = this.getAllDailyRecords();
    const day = all[today];
    if (!day.completedTasks) day.completedTasks = {};

    const isDone = !day.completedTasks[taskId];
    if (isDone) {
      day.completedTasks[taskId] = {
        completedAt: new Date().toISOString(),
        lessonId,
        trackKey
      };
    } else {
      delete day.completedTasks[taskId];
    }
    this.saveAllDailyRecords(all);

    // Also update persistent track progress
    this.updateLessonProgress(trackKey, lessonId, taskId, isDone);
    return isDone;
  },

  getTrackProgress(trackKey) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRACKS_PROGRESS);
      const data = raw ? JSON.parse(raw) : {};
      return data[trackKey] || { completedLessons: {}, completedTasks: {}, quizScores: {} };
    } catch (e) {
      return { completedLessons: {}, completedTasks: {}, quizScores: {} };
    }
  },

  saveTrackProgress(trackKey, progressData) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRACKS_PROGRESS);
      const data = raw ? JSON.parse(raw) : {};
      data[trackKey] = progressData;
      localStorage.setItem(STORAGE_KEYS.TRACKS_PROGRESS, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save track progress:', e);
      return false;
    }
  },

  updateLessonProgress(trackKey, lessonId, taskId, isDone) {
    const progress = this.getTrackProgress(trackKey);
    if (!progress.completedTasks) progress.completedTasks = {};
    if (isDone) {
      progress.completedTasks[taskId] = true;
    } else {
      delete progress.completedTasks[taskId];
    }
    this.saveTrackProgress(trackKey, progress);
  },

  saveQuizScore(trackKey, lessonId, score, total) {
    const progress = this.getTrackProgress(trackKey);
    if (!progress.quizScores) progress.quizScores = {};
    progress.quizScores[lessonId] = { score, total, timestamp: new Date().toISOString() };
    if (score >= Math.ceil(total * 0.7)) {
      if (!progress.completedLessons) progress.completedLessons = {};
      progress.completedLessons[lessonId] = true;
    }
    this.saveTrackProgress(trackKey, progress);
  },

  // Notes
  getNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveNote(note) {
    const notes = this.getNotes();
    if (note.id) {
      const index = notes.findIndex(n => n.id === note.id);
      if (index >= 0) {
        notes[index] = { ...notes[index], ...note, updatedAt: new Date().toISOString() };
      } else {
        notes.unshift({ ...note, updatedAt: new Date().toISOString() });
      }
    } else {
      note.id = 'note_' + Date.now();
      note.createdAt = new Date().toISOString();
      note.updatedAt = note.createdAt;
      notes.unshift(note);
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return note;
  },

  deleteNote(noteId) {
    const notes = this.getNotes().filter(n => n.id !== noteId);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return true;
  },

  // Projects
  getProjects() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveProject(project) {
    const projects = this.getProjects();
    if (project.id) {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = { ...projects[idx], ...project, updatedAt: new Date().toISOString() };
      } else {
        projects.unshift({ ...project, updatedAt: new Date().toISOString() });
      }
    } else {
      project.id = 'proj_' + Date.now();
      project.createdAt = new Date().toISOString();
      project.updatedAt = project.createdAt;
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  },

  deleteProject(projectId) {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  },

  // AI Memory
  getAIMemories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_MEMORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveAIMemory(memory) {
    const memories = this.getAIMemories();
    if (memory.id) {
      const idx = memories.findIndex(m => m.id === memory.id);
      if (idx >= 0) memories[idx] = memory;
    } else {
      memory.id = 'mem_' + Date.now();
      memory.createdAt = new Date().toISOString();
      memories.push(memory);
    }
    localStorage.setItem(STORAGE_KEYS.AI_MEMORY, JSON.stringify(memories));
    return memory;
  },

  deleteAIMemory(id) {
    const memories = this.getAIMemories().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.AI_MEMORY, JSON.stringify(memories));
    return true;
  },

  clearAIMemories() {
    localStorage.removeItem(STORAGE_KEYS.AI_MEMORY);
  },

  // Chat History
  getChatHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveChatHistory(history) {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(history));
  },

  clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT_HISTORY);
  },

  // Active Timer state
  getActiveTimer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  saveActiveTimer(state) {
    if (!state) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(state));
    }
  },

  // Hackathon module state
  getHackathonState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HACKATHON_STATE);
      return raw ? JSON.parse(raw) : {
        currentStage: 1,
        completedStages: {},
        mockProject: null,
        trackedEvents: [],
        pitchAttempts: []
      };
    } catch (e) {
      return { currentStage: 1, completedStages: {}, mockProject: null, trackedEvents: [], pitchAttempts: [] };
    }
  },

  saveHackathonState(state) {
    localStorage.setItem(STORAGE_KEYS.HACKATHON_STATE, JSON.stringify(state));
  },

  // Spoken English Coach state
  getEnglishCoachState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ENGLISH_COACH);
      return raw ? JSON.parse(raw) : {
        practiceCount: 0,
        mistakesLogged: [],
        masteredConcepts: [],
        sessions: []
      };
    } catch (e) {
      return { practiceCount: 0, mistakesLogged: [], masteredConcepts: [], sessions: [] };
    }
  },

  saveEnglishCoachState(state) {
    localStorage.setItem(STORAGE_KEYS.ENGLISH_COACH, JSON.stringify(state));
  },

  // Full Database Backup & Restore (JSON)
  exportFullBackup() {
    const backup = {
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {}
    };
    for (const [keyName, storageKey] of Object.entries(STORAGE_KEYS)) {
      const val = localStorage.getItem(storageKey);
      if (val) {
        backup.data[keyName] = JSON.parse(val);
      }
    }
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || typeof parsed.data !== 'object') {
        throw new Error('Invalid backup file structure: missing data field.');
      }
      for (const [keyName, dataValue] of Object.entries(parsed.data)) {
        const storageKey = STORAGE_KEYS[keyName];
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(dataValue));
        }
      }
      return { success: true, message: 'Backup successfully restored.' };
    } catch (e) {
      console.error('Import backup failed:', e);
      return { success: false, message: e.message || 'Corrupted backup file.' };
    }
  }
};

window.StorageManager = StorageManager;
