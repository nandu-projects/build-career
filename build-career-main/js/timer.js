/**
 * Build Career - Resilient Study Timer Engine
 * Tracks elapsed study time accurately using Date timestamps rather than setInterval increments
 * Recovers state after app pause, backgrounding, or process restart
 * Prevents paused time from counting towards daily study totals
 */

const StudyTimer = {
  activeTrack: null,
  startTime: null,
  accumulatedSeconds: 0,
  isRunning: false,
  intervalId: null,
  onTickCallback: null,

  init(onTick) {
    this.onTickCallback = onTick;
    const saved = StorageManager.getActiveTimer();
    if (saved && saved.activeTrack) {
      this.activeTrack = saved.activeTrack;
      this.accumulatedSeconds = saved.accumulatedSeconds || 0;
      if (saved.isRunning && saved.startTime) {
        // Calculate real elapsed time since backgrounding
        const elapsedSinceSave = Math.floor((Date.now() - saved.startTime) / 1000);
        this.accumulatedSeconds += Math.max(0, elapsedSinceSave);
        this.start(this.activeTrack, true);
      }
    }
  },

  start(trackKey, isResume = false) {
    if (this.isRunning && this.activeTrack === trackKey) return;

    if (this.isRunning) {
      this.stop(); // Stop previous track
    }

    this.activeTrack = trackKey;
    this.startTime = Date.now();
    this.isRunning = true;

    if (!isResume) {
      this.accumulatedSeconds = 0;
    }

    this.saveState();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);

    this.tick();
  },

  pause() {
    if (!this.isRunning) return;
    const now = Date.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    this.accumulatedSeconds += Math.max(0, elapsed);
    this.startTime = null;
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.saveState();
    if (this.onTickCallback) {
      this.onTickCallback({
        trackKey: this.activeTrack,
        elapsedSeconds: this.accumulatedSeconds,
        isRunning: false
      });
    }
  },

  resume() {
    if (this.isRunning || !this.activeTrack) return;
    this.startTime = Date.now();
    this.isRunning = true;
    this.saveState();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);

    this.tick();
  },

  stop() {
    if (!this.activeTrack) return;

    if (this.isRunning && this.startTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - this.startTime) / 1000);
      this.accumulatedSeconds += Math.max(0, elapsed);
    }

    const totalSeconds = this.accumulatedSeconds;
    const completedMinutes = Math.floor(totalSeconds / 60);

    if (completedMinutes > 0) {
      StorageManager.addStudyTime(this.activeTrack, completedMinutes);
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const finishedTrack = this.activeTrack;
    this.isRunning = false;
    this.activeTrack = null;
    this.startTime = null;
    this.accumulatedSeconds = 0;
    StorageManager.saveActiveTimer(null);

    if (this.onTickCallback) {
      this.onTickCallback({
        trackKey: finishedTrack,
        elapsedSeconds: 0,
        isRunning: false,
        finishedMinutes: completedMinutes
      });
    }

    return completedMinutes;
  },

  reset() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.activeTrack = null;
    this.startTime = null;
    this.accumulatedSeconds = 0;
    StorageManager.saveActiveTimer(null);

    if (this.onTickCallback) {
      this.onTickCallback({
        trackKey: null,
        elapsedSeconds: 0,
        isRunning: false
      });
    }
  },

  tick() {
    let currentElapsed = this.accumulatedSeconds;
    if (this.isRunning && this.startTime) {
      currentElapsed += Math.floor((Date.now() - this.startTime) / 1000);
    }

    if (this.onTickCallback) {
      this.onTickCallback({
        trackKey: this.activeTrack,
        elapsedSeconds: currentElapsed,
        isRunning: this.isRunning
      });
    }
  },

  saveState() {
    StorageManager.saveActiveTimer({
      activeTrack: this.activeTrack,
      startTime: this.startTime,
      accumulatedSeconds: this.accumulatedSeconds,
      isRunning: this.isRunning
    });
  },

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};

window.StudyTimer = StudyTimer;
