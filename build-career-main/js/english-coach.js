/**
 * Build Career - Spoken English Interactive Coach
 * 1. Prompts speaking or typing a sentence.
 * 2. Analyzes grammatical accuracy, verb tenses, prepositions, professional clarity.
 * 3. Explains corrections gently with natural alternatives.
 * 4. Asks user to repeat / try again.
 * 5. Uses native SpeechRecognition / Web Speech API + SpeechSynthesis audio feedback.
 */

const EnglishCoach = {
  // Grammar & natural phrasing analysis rules for common student speech patterns
  analysisRules: [
    {
      pattern: /\byesterday\s+(?:i\s+)?go\b/i,
      issue: 'Past tense error with "go"',
      correction: 'Yesterday I went',
      explanation: 'Use simple past "went" instead of present "go" when describing yesterday.',
      naturalAlternative: 'Yesterday I went to campus / class.'
    },
    {
      pattern: /\bdid\s+(?:\w+\s+)?(?:completed|went|saw|played|done)\b/i,
      issue: 'Double past tense with auxiliary "did"',
      correction: 'did + base verb (e.g. did complete, did go, did see)',
      explanation: 'After "did", always use the root/base form of the verb without "-ed" or irregular past forms.',
      naturalAlternative: 'Did you complete the lab assignment?'
    },
    {
      pattern: /\bi\s+am\s+agree\b/i,
      issue: 'Incorrect verb structure with "agree"',
      correction: 'I agree',
      explanation: '"Agree" is an active verb, not an adjective. Say "I agree", not "I am agree".',
      naturalAlternative: 'I completely agree with that perspective.'
    },
    {
      pattern: /\bdiscuss\s+about\b/i,
      issue: 'Redundant preposition "about" after discuss',
      correction: 'discuss the project',
      explanation: 'The verb "discuss" already means "talk about", so adding "about" is redundant.',
      naturalAlternative: 'Let us discuss our hackathon architecture.'
    },
    {
      pattern: /\bme\s+and\s+my\s+friend\b/i,
      issue: 'Subject pronoun order & case',
      correction: 'My friend and I',
      explanation: 'When you are the subject doing the action, use "My friend and I" rather than "Me and my friend".',
      naturalAlternative: 'My teammate and I implemented the backend API.'
    },
    {
      pattern: /\bpass\s+out\b/i,
      issue: 'Colloquial idiom confusion ("pass out" means faint)',
      correction: 'graduate / graduated from college',
      explanation: 'In standard international English, "pass out" means to lose consciousness. Use "graduate" or "completed college".',
      naturalAlternative: 'I will graduate in 2027 from Computer Science & Cybersecurity.'
    },
    {
      pattern: /\bi\s+have\s+completed\s+yesterday\b/i,
      issue: 'Present perfect with specific past time marker',
      correction: 'I completed it yesterday',
      explanation: 'Do not use present perfect ("have completed") with specific past times like "yesterday". Use simple past "completed".',
      naturalAlternative: 'I completed the Python script yesterday.'
    }
  ],

  practiceScenarios: [
    {
      id: 'sc-1',
      title: 'College Routine & Daily Work',
      prompt: 'Describe in one sentence what you worked on yesterday in your college or coding lab.',
      sampleGoodResponse: 'Yesterday I practiced Linux permissions and built a Python file organizer.'
    },
    {
      id: 'sc-2',
      title: 'Technical Project Introduction',
      prompt: 'Introduce your project "Build Career" in one clear, confident sentence to an interviewer.',
      sampleGoodResponse: 'Build Career is an offline-first Android companion designed to help engineering students master Python, Cybersecurity, and AI through hands-on practice.'
    },
    {
      id: 'sc-3',
      title: 'Explaining a Bug / Problem',
      prompt: 'Explain to a teammate how you resolved a network timeout error during testing.',
      sampleGoodResponse: 'We noticed the API request was timing out due to slow database queries, so we added connection pooling and indexed the user table.'
    },
    {
      id: 'sc-4',
      title: 'Placement Interview: Strength',
      prompt: 'Answer the question: "Why are you interested in Cybersecurity?"',
      sampleGoodResponse: 'I am passionate about defensive engineering and understanding how network protocols interact to protect real-world infrastructure.'
    }
  ],

  analyzeSentence(rawText) {
    const text = (rawText || '').trim();
    if (!text) {
      return {
        success: false,
        message: 'Please speak or type a sentence first.'
      };
    }

    const detectedIssues = [];
    for (const rule of this.analysisRules) {
      if (rule.pattern.test(text)) {
        detectedIssues.push({
          issue: rule.issue,
          correction: rule.correction,
          explanation: rule.explanation,
          naturalAlternative: rule.naturalAlternative
        });
      }
    }

    const state = StorageManager.getEnglishCoachState();
    state.practiceCount = (state.practiceCount || 0) + 1;

    let feedback = '';
    let isFullyCorrect = detectedIssues.length === 0;

    if (isFullyCorrect) {
      feedback = `Great job! Your sentence is grammatically sound and clear:\n"${text}"\nTry expanding your thought with a connecting reason (e.g. "because...", "in order to...").`;
    } else {
      const topIssue = detectedIssues[0];
      feedback = `Good attempt! Here is a gentle correction:\n\nCorrection: ${topIssue.correction}\nWhy: ${topIssue.explanation}\nNatural phrase: "${topIssue.naturalAlternative}"\n\nNow, tap "Try Again" or repeat the sentence with this improvement!`;
      state.mistakesLogged.push({
        text,
        issue: topIssue.issue,
        timestamp: new Date().toISOString()
      });
    }

    StorageManager.saveEnglishCoachState(state);

    return {
      success: true,
      userText: text,
      isCorrect: isFullyCorrect,
      issues: detectedIssues,
      feedback
    };
  }
};

window.EnglishCoach = EnglishCoach;
