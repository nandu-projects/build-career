/**
 * Build Career - Main Application Controller
 * Manages Tabs, Real-time Dashboard, Lessons, Quizzes, Spoken English Coach,
 * AI Voice/Chat, Notes, Projects, Backup/Restore, Date Rollover
 */

const App = {
  currentTab: 'home',
  currentLesson: null,
  currentTrackKey: null,

  init() {
    this.setupDateRolloverListener();
    this.renderDashboard();
    this.setupBottomNav();
    this.setupShortcuts();
    this.setupChatUI();
    this.setupVoiceUI();
    this.setupEnglishCoachUI();
    this.setupTimerUI();
    this.setupNotesUI();
    this.setupProjectsUI();
    this.setupSettingsUI();
    this.setupUpdateChecker();

    VoiceEngine.init();
    StudyTimer.init((tickData) => {
      this.updateTimerTicker(tickData);
    });

    console.log('Build Career initialized successfully.');
  },

  setupDateRolloverListener() {
    let lastDate = StorageManager.getTodayString();
    // Check rollover on focus/visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const currentDate = StorageManager.getTodayString();
        if (currentDate !== lastDate) {
          lastDate = currentDate;
          this.renderDashboard();
          this.showToast('New day detected. Today\'s learning goals refreshed!');
        }
      }
    });
  },

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  },

  setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.toggle('active', el.id === `tab-${tabId}`);
    });

    if (tabId === 'home') this.renderDashboard();
    if (tabId === 'learn') this.renderLearnTracks();
    if (tabId === 'notes') this.renderNotesList();
    if (tabId === 'projects') this.renderProjectsList();
    if (tabId === 'profile') this.renderProfileSettings();

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  setupShortcuts() {
    const aiHeroBtn = document.getElementById('home-ai-companion-btn');
    if (aiHeroBtn) {
      aiHeroBtn.addEventListener('click', () => {
        this.switchTab('ai');
      });
    }

    document.querySelectorAll('[data-shortcut]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.shortcut;
        if (target === 'hackathon') {
          this.openHackathonModal();
        } else if (target === 'notes') {
          this.switchTab('notes');
        } else if (target === 'projects') {
          this.switchTab('projects');
        } else if (target === 'timer') {
          this.openTimerModal('python');
        }
      });
    });
  },

  // 1. Dashboard Renderer
  renderDashboard() {
    const d = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = d.toLocaleDateString('en-IN', options);
    const dateEl = document.getElementById('dashboard-date');
    if (dateEl) dateEl.textContent = dateStr;

    const todayRecord = StorageManager.getDailyRecord();
    const settings = StorageManager.getSettings();

    // Calculate total minutes studied today
    const studied = todayRecord.studiedMinutes || { python: 0, cybersecurity: 0, ai: 0, english: 0 };
    const totalMinutes = Object.values(studied).reduce((a, b) => a + b, 0);
    const totalGoalMinutes = Object.values(settings.dailyGoals).reduce((a, b) => a + b, 0);

    const timeStudiedEl = document.getElementById('metric-time-studied');
    if (timeStudiedEl) timeStudiedEl.textContent = `${totalMinutes} min`;

    const goalStatusEl = document.getElementById('metric-goal-status');
    if (goalStatusEl) {
      const remaining = Math.max(0, totalGoalMinutes - totalMinutes);
      goalStatusEl.textContent = remaining === 0 ? 'Goal reached!' : `${remaining}m to target (${totalGoalMinutes}m)`;
    }

    // Completed daily tasks count
    const completedTasksCount = Object.keys(todayRecord.completedTasks || {}).length;
    const taskCountEl = document.getElementById('metric-tasks-count');
    if (taskCountEl) taskCountEl.textContent = `${completedTasksCount}`;

    // Render 4 Tracks Summary Cards on Dashboard
    const container = document.getElementById('dashboard-tracks-list');
    if (container) {
      container.innerHTML = '';
      const tracks = ['python', 'cybersecurity', 'ai', 'english'];
      tracks.forEach(trackKey => {
        const trackData = CURRICULUM[trackKey];
        const minutesStudied = studied[trackKey] || 0;
        const targetMin = settings.dailyGoals[trackKey] || trackData.defaultDailyMinutes;
        const percent = Math.min(100, Math.round((minutesStudied / targetMin) * 100));

        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
          <div class="track-header">
            <span class="track-title">${trackData.title}</span>
            <span class="track-time">${minutesStudied} / ${targetMin} min</span>
          </div>
          <div class="track-desc">${trackData.subtitle}</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        `;
        card.addEventListener('click', () => {
          this.openTrackDetail(trackKey);
        });
        container.appendChild(card);
      });

      // Adaptive Learning Recommendation Card
      const recTopic = StorageManager.getRecommendedTopic('python') || StorageManager.getRecommendedTopic('cybersecurity');
      if (recTopic) {
        const recCard = document.createElement('div');
        recCard.className = 'track-card';
        recCard.style.borderLeft = '3px solid var(--warning)';
        recCard.innerHTML = `
          <div class="track-header">
            <span class="track-title">💡 Personalized Revision Focus</span>
            <span style="font-size:0.75rem; color:var(--warning)">Adaptive Suggestion</span>
          </div>
          <div class="track-desc">Based on previous quiz checks, we recommend practicing <strong>${recTopic}</strong> again to reinforce mastery.</div>
        `;
        container.prepend(recCard);
      }
    }
  },

  // 2. Learning Tracks & Lessons
  renderLearnTracks() {
    const listContainer = document.getElementById('learn-tracks-full-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    Object.keys(CURRICULUM).forEach(trackKey => {
      const track = CURRICULUM[trackKey];
      const progress = StorageManager.getTrackProgress(trackKey);
      const totalLessons = track.lessons.length;
      const completedCount = Object.keys(progress.completedLessons || {}).length;

      const card = document.createElement('div');
      card.className = 'track-card';
      card.innerHTML = `
        <div class="track-header">
          <span class="track-title">${track.title}</span>
          <span class="track-time">${completedCount} / ${totalLessons} Mastered</span>
        </div>
        <div class="track-desc">${track.subtitle}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <button class="btn btn-sm" data-action="open-track" data-track="${trackKey}">View Lessons</button>
          <button class="btn btn-secondary btn-sm" data-action="open-timer" data-track="${trackKey}">Study Timer</button>
        </div>
      `;
      card.querySelector('[data-action="open-track"]').addEventListener('click', () => {
        this.openTrackDetail(trackKey);
      });
      card.querySelector('[data-action="open-timer"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openTimerModal(trackKey);
      });
      listContainer.appendChild(card);
    });

    // Add Explore Section for Hackathon Coach (Accessible via Learn / Explore, NOT Home)
    const hackathonBanner = document.createElement('div');
    hackathonBanner.className = 'track-card';
    hackathonBanner.style.borderColor = 'var(--accent-blue)';
    hackathonBanner.innerHTML = `
      <div class="track-header">
        <span class="track-title">Explore: Hackathon & Presentation Coach</span>
        <span class="track-time" style="color:var(--text-secondary)">7-Stage Prep</span>
      </div>
      <div class="track-desc">From finding ideas and MVP architecture to 2-minute elevator pitches and judge simulations.</div>
      <button class="btn btn-sm" style="margin-top:8px;">Open Hackathon Coach</button>
    `;
    hackathonBanner.querySelector('button').addEventListener('click', () => {
      this.openHackathonModal();
    });
    listContainer.appendChild(hackathonBanner);
  },

  openTrackDetail(trackKey) {
    this.currentTrackKey = trackKey;
    const track = CURRICULUM[trackKey];
    const modal = document.getElementById('modal-track-lessons');
    const titleEl = document.getElementById('modal-track-title');
    const listEl = document.getElementById('modal-track-lesson-items');

    if (titleEl) titleEl.textContent = track.title;
    if (listEl) {
      listEl.innerHTML = '';
      const progress = StorageManager.getTrackProgress(trackKey);

      track.lessons.forEach((lesson, index) => {
        const isMastered = !!(progress.completedLessons && progress.completedLessons[lesson.id]);
        const item = document.createElement('div');
        item.className = 'track-card';
        item.innerHTML = `
          <div class="track-header">
            <span class="track-title">${index + 1}. ${lesson.title}</span>
            <span style="font-size:0.75rem; color:${isMastered ? 'var(--success)' : 'var(--text-muted)'}">${isMastered ? '✓ Mastered' : 'Start'}</span>
          </div>
          <div class="track-desc">${lesson.summary}</div>
        `;
        item.addEventListener('click', () => {
          this.openLessonModal(trackKey, lesson);
        });
        listEl.appendChild(item);
      });
    }

    if (modal) modal.classList.add('active');
  },

  openLessonModal(trackKey, lesson) {
    this.currentLesson = lesson;
    this.currentTrackKey = trackKey;
    const modal = document.getElementById('modal-lesson-detail');

    document.getElementById('lesson-detail-title').textContent = lesson.title;
    document.getElementById('lesson-detail-scenario').textContent = lesson.realWorldScenario;
    document.getElementById('lesson-detail-theory').textContent = lesson.theory;
    document.getElementById('lesson-detail-code').textContent = lesson.codeSnippet;
    document.getElementById('lesson-detail-task').textContent = lesson.practiceTask;

    const editor = document.getElementById('lesson-practice-input');
    if (editor) editor.value = lesson.practiceTemplate || '';

    // Quiz setup
    const quizBox = document.getElementById('lesson-quiz-box');
    if (quizBox && lesson.quiz) {
      quizBox.innerHTML = `
        <p style="font-weight:600; margin-bottom:8px;">Knowledge Check: ${lesson.quiz.question}</p>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${lesson.quiz.options.map((opt, i) => `
            <button class="btn btn-secondary btn-sm" style="text-align:left; justify-content:flex-start;" data-quiz-opt="${i}">${opt}</button>
          `).join('')}
        </div>
        <div id="quiz-feedback" style="margin-top:8px; font-size:0.82rem; display:none;"></div>
      `;

      quizBox.querySelectorAll('[data-quiz-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const chosen = Number(e.currentTarget.dataset.quizOpt);
          const feedback = document.getElementById('quiz-feedback');
          feedback.style.display = 'block';
          if (chosen === lesson.quiz.correctIndex) {
            feedback.style.color = 'var(--success)';
            feedback.textContent = `✓ Correct! ${lesson.quiz.explanation}`;
            StorageManager.saveQuizScore(trackKey, lesson.id, 1, 1);
            this.showToast('Quiz passed! Lesson marked as completed.');
            this.renderDashboard();
          } else {
            feedback.style.color = 'var(--warning)';
            feedback.textContent = `Incorrect. Try again! Hint: ${lesson.quiz.explanation}`;
            // Log mistake concept for personalized adaptive review
            StorageManager.saveQuizScore(trackKey, lesson.id, 0, 1, lesson.title);
            this.renderDashboard();
          }
        });
      });
    }

    if (modal) modal.classList.add('active');
  },

  // 3. Spoken English Coach UI
  setupEnglishCoachUI() {
    const checkBtn = document.getElementById('english-check-btn');
    const speakBtn = document.getElementById('english-speak-btn');
    const input = document.getElementById('english-input-text');
    const feedbackBox = document.getElementById('english-feedback-result');

    if (checkBtn && input) {
      checkBtn.addEventListener('click', () => {
        const text = input.value;
        const res = EnglishCoach.analyzeSentence(text);
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          feedbackBox.innerText = res.feedback;
          feedbackBox.style.borderColor = res.isCorrect ? 'var(--success)' : 'var(--accent-blue)';
        }
        if (res.isCorrect) {
          StorageManager.addStudyTime('english', 5);
          this.renderDashboard();
        }
      });
    }

    if (speakBtn && input) {
      speakBtn.addEventListener('click', () => {
        if (VoiceEngine.isListening) {
          VoiceEngine.stopListening();
          speakBtn.textContent = 'Tap to Speak';
        } else {
          speakBtn.textContent = 'Listening... Speak now';
          VoiceEngine.startListening(
            (transcript, isFinal) => {
              input.value = transcript;
            },
            () => {
              speakBtn.textContent = 'Tap to Speak';
              if (input.value) {
                checkBtn.click();
              }
            },
            (err) => {
              speakBtn.textContent = 'Tap to Speak';
              this.showToast(`Voice input: ${err}`);
            }
          );
        }
      });
    }

    // Scenarios rendering
    const scList = document.getElementById('english-scenarios-list');
    if (scList) {
      scList.innerHTML = '';
      EnglishCoach.practiceScenarios.forEach(sc => {
        const chip = document.createElement('div');
        chip.className = 'track-card';
        chip.innerHTML = `
          <div class="track-header"><span class="track-title">${sc.title}</span></div>
          <div class="track-desc">${sc.prompt}</div>
        `;
        chip.addEventListener('click', () => {
          if (input) input.value = '';
          if (feedbackBox) feedbackBox.style.display = 'none';
          this.showToast(`Selected prompt: ${sc.title}`);
        });
        scList.appendChild(chip);
      });
    }
  },

  // 4. AI Companion Chat & Tool UI
  attachedImageBase64: null,

  setupChatUI() {
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-chat-input');
    const attachBtn = document.getElementById('btn-attach-image');
    const fileInput = document.getElementById('chat-image-input');
    const previewContainer = document.getElementById('chat-attachment-preview');
    const thumbImg = document.getElementById('attachment-thumb');
    const removeAttachBtn = document.getElementById('btn-remove-attachment');
    const newChatBtn = document.getElementById('btn-new-chat');
    const micBtn = document.getElementById('btn-chat-mic');
    const listeningStatus = document.getElementById('chat-listening-status');

    // Restore saved chat history
    const history = StorageManager.getChatHistory();
    if (history && history.length > 0) {
      const historyContainer = document.getElementById('ai-chat-history');
      if (historyContainer) {
        historyContainer.innerHTML = '';
        history.forEach(item => {
          this.appendChatMessage(item.role === 'assistant' ? 'ai' : 'user', item.text, item.image);
        });
      }
    }

    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        if (confirm('Start a new conversation? Previous history will be cleared.')) {
          AICompanion.clearSession();
          const historyContainer = document.getElementById('ai-chat-history');
          if (historyContainer) {
            historyContainer.innerHTML = `
              <div class="chat-bubble ai">
                Started a new conversation. What would you like to explore or analyze today?
              </div>
            `;
          }
          this.showToast('New chat started.');
        }
      });
    }

    // Attachment flow
    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert('Please select an image file (PNG, JPG, WebP).');
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          this.attachedImageBase64 = loadEvent.target.result;
          thumbImg.src = this.attachedImageBase64;
          previewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeAttachBtn) {
      removeAttachBtn.addEventListener('click', () => {
        this.attachedImageBase64 = null;
        fileInput.value = '';
        previewContainer.style.display = 'none';
      });
    }

    const handleSend = async () => {
      const msg = (input.value || '').trim();
      const img = this.attachedImageBase64;

      if (!msg && !img) return;

      this.appendChatMessage('user', msg || 'Attached image for review', !!img, img);
      input.value = '';
      this.attachedImageBase64 = null;
      if (fileInput) fileInput.value = '';
      if (previewContainer) previewContainer.style.display = 'none';

      // Show typing indicator
      const typingId = 'typing-' + Date.now();
      const historyContainer = document.getElementById('ai-chat-history');
      const typingBubble = document.createElement('div');
      typingBubble.id = typingId;
      typingBubble.className = 'chat-bubble ai';
      typingBubble.textContent = 'Thinking...';
      historyContainer.appendChild(typingBubble);
      historyContainer.scrollTop = historyContainer.scrollHeight;

      try {
        const aiReply = await AICompanion.processMessage(msg, img);
        typingBubble.remove();
        this.appendChatMessage('ai', aiReply.text);

        const settings = StorageManager.getSettings();
        if (!settings.offlineMode) {
          VoiceEngine.speakText(aiReply.text);
        }
      } catch (e) {
        typingBubble.textContent = 'Failed to generate response. Please try again.';
        typingBubble.style.borderColor = 'var(--danger)';
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Voice button inside chat
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (VoiceEngine.isListening) {
          VoiceEngine.stopListening();
          if (listeningStatus) listeningStatus.style.display = 'none';
          micBtn.style.color = 'var(--text-secondary)';
        } else {
          micBtn.style.color = 'var(--danger)';
          if (listeningStatus) listeningStatus.style.display = 'block';
          VoiceEngine.startListening(
            (transcript, isFinal) => {
              if (input) input.value = transcript;
            },
            () => {
              if (listeningStatus) listeningStatus.style.display = 'none';
              micBtn.style.color = 'var(--text-secondary)';
              if (input.value) handleSend();
            },
            (err) => {
              if (listeningStatus) listeningStatus.style.display = 'none';
              micBtn.style.color = 'var(--text-secondary)';
              this.showToast(`Voice: ${err}`);
            }
          ).then((started) => {
            if (!started) {
              if (listeningStatus) listeningStatus.style.display = 'none';
              micBtn.style.color = 'var(--text-secondary)';
            }
          }).catch((err) => {
            if (listeningStatus) listeningStatus.style.display = 'none';
            micBtn.style.color = 'var(--text-secondary)';
            this.showToast(`Voice: ${err.message || err}`);
          });
        }
      });
    }
  },

  appendChatMessage(role, text, hasImage = false, imageSrc = null) {
    const historyContainer = document.getElementById('ai-chat-history');
    if (!historyContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    if (hasImage && imageSrc) {
      const imgEl = document.createElement('img');
      imgEl.src = imageSrc;
      imgEl.style.maxWidth = '100%';
      imgEl.style.maxHeight = '200px';
      imgEl.style.borderRadius = '8px';
      imgEl.style.display = 'block';
      imgEl.style.marginBottom = '6px';
      bubble.appendChild(imgEl);
    }

    const textSpan = document.createElement('div');
    textSpan.style.whiteSpace = 'pre-wrap';
    textSpan.textContent = text;
    bubble.appendChild(textSpan);

    historyContainer.appendChild(bubble);
    historyContainer.scrollTop = historyContainer.scrollHeight;
  },

  setupVoiceUI() {
    const centralMicBtn = document.getElementById('ai-voice-mic-btn');
    if (centralMicBtn) {
      centralMicBtn.addEventListener('click', () => {
        this.switchTab('ai');
        const chatMic = document.getElementById('btn-chat-mic');
        if (chatMic) chatMic.click();
      });
    }
  },

  // 5. Timer UI
  setupTimerUI() {
    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    const stopBtn = document.getElementById('timer-stop-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const trackKey = document.getElementById('timer-track-select').value;
        StudyTimer.start(trackKey);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        StudyTimer.pause();
        pauseBtn.style.display = 'none';
        startBtn.style.display = 'inline-flex';
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        const mins = StudyTimer.stop();
        if (mins > 0) {
          this.showToast(`Logged ${mins} minutes to your daily study progress!`);
          this.renderDashboard();
        }
        document.getElementById('modal-timer').classList.remove('active');
      });
    }
  },

  openTimerModal(trackKey = 'python') {
    const modal = document.getElementById('modal-timer');
    const select = document.getElementById('timer-track-select');
    if (select) select.value = trackKey;
    if (modal) modal.classList.add('active');
  },

  updateTimerTicker(tickData) {
    const display = document.getElementById('timer-digits');
    if (display) {
      display.textContent = StudyTimer.formatTime(tickData.elapsedSeconds);
    }
  },

  // 6. Notes UI
  setupNotesUI() {
    const addBtn = document.getElementById('btn-add-note');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const title = prompt('Enter Note Title:');
        if (!title) return;
        const content = prompt('Enter Note Content:');
        if (!content) return;
        StorageManager.saveNote({ title, content });
        this.renderNotesList();
        this.showToast('Note saved.');
      });
    }
  },

  renderNotesList() {
    const list = document.getElementById('notes-list-container');
    if (!list) return;
    const notes = StorageManager.getNotes();
    list.innerHTML = '';
    if (notes.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No saved notes yet. Tap "+ New Note" to write one.</p>';
      return;
    }
    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'track-card';
      card.innerHTML = `
        <div class="track-header">
          <span class="track-title">${note.title}</span>
          <span style="font-size:0.75rem; color:var(--text-muted)">${new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>
        <div class="track-desc" style="white-space:pre-wrap;">${note.content}</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:8px;">Delete</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (confirm('Delete this note?')) {
          StorageManager.deleteNote(note.id);
          this.renderNotesList();
        }
      });
      list.appendChild(card);
    });
  },

  // 7. Projects UI
  setupProjectsUI() {
    const addBtn = document.getElementById('btn-add-project');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const title = prompt('Project Title:');
        if (!title) return;
        const techStack = prompt('Tech Stack (e.g. Python, SQLite, Flask):');
        const desc = prompt('Short Description:');
        StorageManager.saveProject({ title, techStack, description: desc, status: 'Active' });
        this.renderProjectsList();
        this.showToast('Project added to workspace.');
      });
    }
  },

  renderProjectsList() {
    const list = document.getElementById('projects-list-container');
    if (!list) return;
    const projects = StorageManager.getProjects();
    list.innerHTML = '';
    if (projects.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">No projects yet. Add your portfolio projects here.</p>';
      return;
    }
    projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'track-card';
      card.innerHTML = `
        <div class="track-header">
          <span class="track-title">${proj.title}</span>
          <span class="track-time">${proj.techStack || 'Python'}</span>
        </div>
        <div class="track-desc">${proj.description || ''}</div>
      `;
      list.appendChild(card);
    });
  },

  // 8. Hackathon Module (Stage-by-stage)
  openHackathonModal() {
    const modal = document.getElementById('modal-hackathon');
    const container = document.getElementById('hackathon-stages-container');
    if (container) {
      container.innerHTML = '';
      HackathonCoach.stages.forEach(stage => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
          <div class="track-header"><span class="track-title">${stage.title}</span></div>
          <div class="track-desc" style="white-space:pre-wrap; margin-bottom:10px;">${stage.content || stage.objective}</div>
          ${stage.checklist ? `
            <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:8px;">
              ${stage.checklist.map(c => `<div>▫ ${c}</div>`).join('')}
            </div>
          ` : ''}
        `;
        container.appendChild(card);
      });
    }
    if (modal) modal.classList.add('active');
  },

  // 9. Profile, Backup & Settings
  setupSettingsUI() {
    const exportBtn = document.getElementById('btn-export-backup');
    const importInput = document.getElementById('input-import-backup');
    const clearMemoryBtn = document.getElementById('btn-clear-memory');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = StorageManager.exportFullBackup();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buildcareer-backup-${StorageManager.getTodayString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Backup JSON exported successfully.');
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = StorageManager.importBackup(event.target.result);
          if (res.success) {
            this.showToast('Backup restored successfully!');
            this.renderDashboard();
          } else {
            alert('Failed to restore backup: ' + res.message);
          }
        };
        reader.readAsText(file);
      });
    }

    if (clearMemoryBtn) {
      clearMemoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear AI memory?')) {
          StorageManager.clearAIMemories();
          this.showToast('AI memory wiped.');
        }
      });
    }
  },

  renderProfileSettings() {
    const settings = StorageManager.getSettings();
    const voiceSelect = document.getElementById('setting-voice-select');
    const aiProviderSelect = document.getElementById('setting-ai-provider');
    const aiKeyInput = document.getElementById('setting-ai-key');
    const aiKeyContainer = document.getElementById('ai-key-container');

    if (voiceSelect) {
      const voices = VoiceEngine.getAvailableVoiceOptions();
      voiceSelect.innerHTML = voices.map(v => `
        <option value="${v.id}" ${settings.aiVoice.voiceId === v.id ? 'selected' : ''}>${v.name} (${v.accent})</option>
      `).join('');

      voiceSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const v = voices.find(x => x.id === selectedId);
        if (v) {
          settings.aiVoice = { voiceId: v.id, voiceName: v.name, lang: v.lang, speed: 1.0, pitch: 1.0 };
          StorageManager.saveSettings(settings);
          this.showToast(`Selected voice: ${v.name}`);
        }
      });
    }

    if (aiProviderSelect) {
      const currentProvider = settings.aiConfig?.provider || 'offline_assistant';
      aiProviderSelect.value = currentProvider;
      if (aiKeyContainer) {
        aiKeyContainer.style.display = currentProvider !== 'offline_assistant' ? 'block' : 'none';
      }
      if (aiKeyInput && settings.aiConfig?.apiKey) {
        aiKeyInput.value = settings.aiConfig.apiKey;
      }

      aiProviderSelect.addEventListener('change', (e) => {
        const prov = e.target.value;
        if (!settings.aiConfig) settings.aiConfig = {};
        settings.aiConfig.provider = prov;
        if (aiKeyContainer) {
          aiKeyContainer.style.display = prov !== 'offline_assistant' ? 'block' : 'none';
        }
        StorageManager.saveSettings(settings);
        this.showToast(`AI Engine set to: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    if (aiKeyInput) {
      aiKeyInput.addEventListener('change', (e) => {
        if (!settings.aiConfig) settings.aiConfig = {};
        settings.aiConfig.apiKey = e.target.value.trim();
        StorageManager.saveSettings(settings);
        this.showToast('API Key saved locally on device.');
      });
    }
  },

  setupUpdateChecker() {
    const checkBtn = document.getElementById('btn-check-updates');
    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        checkBtn.textContent = 'Checking...';
        try {
          const res = await fetch('https://api.github.com/repos/nandu-projects/build-career/releases/latest');
          if (!res.ok) {
            this.showToast('Current version 1.0.0 is up-to-date.');
            checkBtn.textContent = 'Check for Updates';
            return;
          }
          const data = await res.json();
          if (data.tag_name && data.tag_name !== 'v1.0.0') {
            alert(`New update available: ${data.tag_name}!\nRelease notes: ${data.body || 'New enhancements'}`);
          } else {
            this.showToast('You are running the latest version (v1.0.0).');
          }
        } catch (e) {
          this.showToast('Offline or GitHub API unreachable. You are on v1.0.0.');
        } finally {
          checkBtn.textContent = 'Check for Updates';
        }
      });
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Close modal buttons handler
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.dataset.closeModal;
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    });
  });
});

window.App = App;
