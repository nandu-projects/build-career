/**
 * Build Career - Voice & Audio Engine
 * Supports Web Speech API (SpeechRecognition & SpeechSynthesis)
 * Fallback to pure offline text interface when audio engine is unavailable
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
    const voices = this.synth.getVoices();
    this.availableVoices = voices.map(v => ({
      name: v.name,
      lang: v.lang,
      isIndian: v.lang.includes('IN') || v.lang.includes('kn') || v.lang.includes('hi'),
      voiceObj: v
    }));
  },

  getAvailableVoiceOptions() {
    this.initVoices();
    // Default list of natural voices
    const list = [
      { id: 'en-IN-natural', name: 'Indian English (Natural)', lang: 'en-IN', accent: 'Indian' },
      { id: 'en-US-natural', name: 'English (US Neutral)', lang: 'en-US', accent: 'US' },
      { id: 'en-GB-natural', name: 'English (British)', lang: 'en-GB', accent: 'UK' },
      { id: 'kn-IN-local', name: 'Kannada (ಕನ್ನಡ - Regional)', lang: 'kn-IN', accent: 'Karnataka' }
    ];

    // Merge system installed voices if available
    this.availableVoices.forEach(v => {
      if (v.isIndian && !list.some(x => x.name === v.name)) {
        list.push({
          id: v.name,
          name: v.name,
          lang: v.lang,
          accent: 'System Indian'
        });
      }
    });

    return list;
  },

  startListening(onResultCallback, onEndCallback, onErrorCallback) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onErrorCallback) onErrorCallback('Speech recognition is not supported in this browser/device. Please use text input.');
      return false;
    }

    // Stop speaking if currently outputting audio (barge-in / interrupt support)
    this.stopSpeaking();

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
        if (onErrorCallback) onErrorCallback(event.error);
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
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  },

  speakText(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported on this platform.');
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
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
