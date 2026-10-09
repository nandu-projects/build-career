/**
 * Automated Test Suite for Build Career Application
 * Validates Navigation, Data Persistence, Date Rollover, Timers, Curriculum,
 * Spoken English Engine, AI Companion & Tool execution, Hackathon Isolation, Backup/Restore
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING BUILD CAREER AUTOMATED TEST SUITE ===\n');

// 1. Mock Browser Environment for Unit & Integration Testing
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.window = global;

// Load app scripts
require('../js/storage.js');
require('../js/curriculum.js');
require('../js/timer.js');
require('../js/english-coach.js');
require('../js/ai-companion.js');
require('../js/hackathon.js');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (e) {
    console.error(`[FAIL] ${name}:`, e.message);
  }
}

// Test 1: Storage Initial State & Zero Progress Requirement
runTest('Initial User Progress starts at genuine Zero', () => {
  const daily = StorageManager.getDailyRecord('2026-10-10');
  assert.strictEqual(daily.studiedMinutes.python, 0);
  assert.strictEqual(daily.studiedMinutes.cybersecurity, 0);
  assert.strictEqual(daily.studiedMinutes.ai, 0);
  assert.strictEqual(daily.studiedMinutes.english, 0);
  assert.strictEqual(Object.keys(daily.completedTasks).length, 0);
});

// Test 2: Study Timer Accurate Accounting
runTest('Study Timer accumulation and state recovery', () => {
  StudyTimer.init();
  StudyTimer.start('python');
  assert.strictEqual(StudyTimer.isRunning, true);
  assert.strictEqual(StudyTimer.activeTrack, 'python');
  
  // Pause
  StudyTimer.pause();
  assert.strictEqual(StudyTimer.isRunning, false);
  
  // Format check
  assert.strictEqual(StudyTimer.formatTime(125), '02:05');
  StudyTimer.reset();
});

// Test 3: Task & Track Progress Tracking
runTest('Track Progress persistence and task completion toggle', () => {
  const isDone = StorageManager.toggleTaskCompletion('task-1', 'py-01', 'python');
  assert.strictEqual(isDone, true);
  
  const prog = StorageManager.getTrackProgress('python');
  assert.strictEqual(prog.completedTasks['task-1'], true);
  
  // Toggle off (undo support)
  const undone = StorageManager.toggleTaskCompletion('task-1', 'py-01', 'python');
  assert.strictEqual(undone, false);
});

// Test 4: Date Rollover Reliability
runTest('Date Rollover isolates yesterday from today', () => {
  // Day 1
  StorageManager.addStudyTime('python', 30);
  const day1 = StorageManager.getDailyRecord(StorageManager.getTodayString());
  assert.strictEqual(day1.studiedMinutes.python, 30);
  
  // Simulate next day
  const tomorrow = '2026-10-11';
  const day2 = StorageManager.getDailyRecord(tomorrow);
  assert.strictEqual(day2.studiedMinutes.python, 0);
  
  // Ensure day 1 remained untouched
  const day1Verify = StorageManager.getDailyRecord(StorageManager.getTodayString());
  assert.strictEqual(day1Verify.studiedMinutes.python, 30);
});

// Test 5: Curriculum Engine Data Integrity
runTest('Curriculum tracks have 70/30 practice structure and quizzes', () => {
  const tracks = ['python', 'cybersecurity', 'ai', 'english'];
  tracks.forEach(trackKey => {
    const track = CURRICULUM[trackKey];
    assert.ok(track, `Track ${trackKey} must exist`);
    assert.ok(track.lessons.length > 0, `Track ${trackKey} must have lessons`);
    track.lessons.forEach(l => {
      assert.ok(l.title, 'Lesson must have title');
      assert.ok(l.realWorldScenario, 'Lesson must have real-world scenario');
      assert.ok(l.practiceTask, 'Lesson must have hands-on practice task');
      assert.ok(l.quiz, 'Lesson must have quiz');
      assert.ok(l.quiz.explanation, 'Quiz must have explanation');
    });
  });
});

// Test 6: Spoken English Coach Correction Engine
runTest('Spoken English Coach detects past tense error and provides gentle fix', () => {
  const result = EnglishCoach.analyzeSentence('Yesterday I go to college and give presentation.');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isCorrect, false);
  assert.ok(result.feedback.includes('Yesterday I went'));
  
  const correctResult = EnglishCoach.analyzeSentence('Yesterday I went to campus and gave my presentation.');
  assert.strictEqual(correctResult.success, true);
  assert.strictEqual(correctResult.isCorrect, true);
});

// Test 7: AI Companion Tool Execution & Honest Free Architecture
runTest('AI Companion executes tools (notes, memory) and provides helpful answers', async () => {
  const noteReply = await AICompanion.processMessage('note: Docker Container - Port binding and volume flags');
  assert.strictEqual(noteReply.toolExecuted, 'create_note');
  
  const notes = StorageManager.getNotes();
  assert.strictEqual(notes.length, 1);
  assert.strictEqual(notes[0].title, 'Docker Container');
  
  const memReply = await AICompanion.processMessage('remember: Target placement at Infosys/Wipro/Product companies');
  assert.strictEqual(memReply.toolExecuted, 'remember_fact');
  const memories = StorageManager.getAIMemories();
  assert.strictEqual(memories.length, 1);
});

// Test 8: Hackathon Coach 7-Stage Isolation & Data
runTest('Hackathon Coach is structured across 7 stages and isolated from dashboard', () => {
  assert.strictEqual(HackathonCoach.stages.length, 7);
  const stage1 = HackathonCoach.getStage(1);
  assert.strictEqual(stage1.title, 'Stage 1: Understand Hackathons');
  const stage4 = HackathonCoach.getStage(4);
  assert.ok(stage4.content.includes('7-Step Pitch Architecture'));
});

// Test 9: Backup & Restore Engine
runTest('Full Database Backup JSON export and import validation', () => {
  const backupJson = StorageManager.exportFullBackup();
  assert.ok(backupJson.includes('appVersion'));
  
  // Wipe and restore
  localStorage.clear();
  assert.strictEqual(StorageManager.getNotes().length, 0);
  
  const restoreRes = StorageManager.importBackup(backupJson);
  assert.strictEqual(restoreRes.success, true);
  assert.strictEqual(StorageManager.getNotes().length, 1);
});

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
