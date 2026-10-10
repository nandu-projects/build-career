/**
 * Build Career - Voice & Audio Engine
 * Supports Web Speech API (SpeechRecognition & SpeechSynthesis)
 * Native Android microphone permission probing via navigator.mediaDevices.getUserMedia
 * Voice settings, speech speed, Indian English & Kannada speech synthesis detection
 */

const VoiceEngine = {
  recognition: null,
  isListening: false,
  isSpeaking: false,
  synth: window.speechSynthesis || null,
  availableVoices: [],

  init() {
    this.initVoices();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoices();
    }
  },

  initVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      this.availableVoices = voices.map(v => ({
        name: v.name,
        lang: v.lang,
        isIndian: v.lang.includes('IN') || v.lang.includes('kn') || v.lang.includes('hi'),
        voiceObj: v
      }));
    } catch (e) {
      console.warn('Error reading voices:', e);
    }
  },

  getAvailableVoiceOptions() {
    this.initVoices();
    const list = [
      { id: 'en-IN-natural', name: 'Indian English (Natural)', lang: 'en-IN', accent: 'Indian' },
      { id: 'en-US-natural', name: 'English (US Neutral)', lang: 'en-US', accent: 'US' },
      { id: 'en-GB-natural', name: 'English (British)', lang: 'en-GB', accent: 'UK' },
      { id: 'kn-IN-local', name: 'Kannada (ಕನ್ನಡ - Regional)', lang: 'kn-IN', accent: 'Karnataka' }
    ];

    this.availableVoices.forEach(v => {
      if (v.isIndian && !list.some(x => x.name === v.name)) {
        list.push({
          id: v.name,
          name: v.name,
          lang: v.lang,
          accent: 'Device Indian'
        });
      }
    });

    return list;
  },

  /**
   * Request microphone permission explicitly through getUserMedia
   * This triggers the Android RECORD_AUDIO permission dialog in Capacitor WebViews
   */
  async requestMicPermission() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop audio tracks after verifying permission
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        console.warn('Microphone permission denied or not available:', err);
        return false;
      }
    }
    return true; // Fallback to SpeechRecognition request
  },

  async startListening(onResultCallback, onEndCallback, onErrorCallback) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onErrorCallback) onErrorCallback('Speech recognition is not supported in this WebView. Please use text input or grant microphone access.');
      return false;
    }

    // Stop speaking if currently speaking (barge-in interrupt)
    this.stopSpeaking();

    // Verify mic permission first
    const hasPermission = await this.requestMicPermission();
    if (!hasPermission) {
      if (onErrorCallback) onErrorCallback('Microphone permission was denied. Please allow microphone in Android Settings > Apps > Build Career > Permissions.');
      return false;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (onResultCallback) onResultCallback(transcript, event.results[0].isFinal);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (onErrorCallback) onErrorCallback(event.error === 'not-allowed' ? 'Microphone permission denied.' : event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEndCallback) onEndCallback();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      this.isListening = false;
      if (onErrorCallback) onErrorCallback(e.message);
      return false;
    }
  },

  stopListening() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.isListening = false;
  },

  speakText(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported on this device.');
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const cleanText = (text || '').replace(/[*_#`]/g, ''); // Strip markdown tokens for speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const settings = StorageManager.getSettings();
    utterance.rate = settings.aiVoice.speed || 1.0;
    utterance.pitch = settings.aiVoice.pitch || 1.0;

    // Pick best matching voice
    const voices = this.synth.getVoices();
    let selected = voices.find(v => v.lang === 'en-IN');
    if (!selected && settings.aiVoice.lang) {
      selected = voices.find(v => v.lang.startsWith(settings.aiVoice.lang.split('-')[0]));
    }
    if (selected) {
      utterance.voice = selected;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('Speech synthesis error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  },

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
};

window.VoiceEngine = VoiceEngine;
