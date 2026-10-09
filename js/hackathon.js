/**
 * Build Career - Hackathon & Presentation Coach
 * Strictly kept off the main Home Dashboard (accessible via Learn / Explore)
 * 7 Stages:
 * Stage 1: Understand Hackathons
 * Stage 2: Find a Problem and Idea
 * Stage 3: Build My Project (MVP)
 * Stage 4: Presentation Training (15s, 30s, 1m, 2m, 5m structures)
 * Stage 5: AI Presentation Coach (Judge Q&A simulation)
 * Stage 6: Mock Hackathon Simulation
 * Stage 7: Real Hackathon Tracker & Verification
 */

const HackathonCoach = {
  stages: [
    {
      id: 1,
      title: 'Stage 1: Understand Hackathons',
      objective: 'Learn how collegiate & open hackathons operate, rules, judging, and team dynamics.',
      content: `Hackathons are intense problem-solving events (typically 24 to 48 hours).
Participants collaborate in teams of 2 to 4 (or solo) to build a prototype software or hardware solution.

Key Judging Criteria in Indian & Global Hackathons (SIH, Unstop, Devpost):
1. Innovation & Originality (20%)
2. Technical Complexity & Feasibility (30%)
3. Working Demonstration / MVP (30%)
4. Presentation & Clarity (20%)

What to prepare before event day:
- Pre-configured dev environments (Node.js, Python, Git, Docker).
- Pre-made boilerplate repository templates.
- A functional pitch deck template.`,
      checklist: [
        'Understand judging criteria weighting',
        'Learn team role distribution (Frontend, Backend, Pitcher)',
        'Review standard submission formats (GitHub + YouTube Demo + Deck)'
      ]
    },
    {
      id: 2,
      title: 'Stage 2: Find a Problem & Idea',
      objective: 'Identify real-world pain points rather than building a generic solution in search of a problem.',
      content: `Rule #1: Never pitch an idea because "it uses AI". Pitch it because it solves a concrete friction for a specific target audience.

Validation Checklist:
- Who is the specific user? (e.g. VTU engineering students with attendance anxiety)
- Why is the existing solution inadequate?
- Can an MVP with one killer feature be delivered in under 24 hours?
- Can you explain the solution in one sentence?`,
      checklist: [
        'Write 1-sentence problem statement',
        'Identify 3 competitor gaps',
        'Define the core MVP feature that demo judges can see in 60 seconds'
      ]
    },
    {
      id: 3,
      title: 'Stage 3: Build My Project (MVP)',
      objective: 'Prioritize core functional flows and prevent scope creep during the build phase.',
      content: `MVP Principle: A polished 1-feature app beats a broken 10-feature app every single time.

Development Timeline for 24h Hackathon:
- Hours 0-4: System architecture, Git repo setup, database schemas.
- Hours 4-16: Core business logic and end-to-end user flow.
- Hours 16-20: UI polishing, error handling, mock data fallback.
- Hours 20-24: Screen recording, slide deck, demo rehearsals.`,
      checklist: [
        'Setup clean Git repository with README and license',
        'Create reliable seed/demo data so the app never shows blank screens',
        'Record backup screen demonstration video (in case projector/Wi-Fi fails)'
      ]
    },
    {
      id: 4,
      title: 'Stage 4: Presentation Training',
      objective: 'Master structured elevator pitches and 2-minute judge demonstrations.',
      content: `The 7-Step Pitch Architecture:
1. Hook & Problem (20s) - Introduce the pain point with relatable emotion.
2. Target Audience (10s) - Who feels this pain every single day.
3. Our Solution (20s) - What we built and its core differentiator.
4. Live Demo (40s) - Show the product in action without fluff.
5. Tech Stack & Architecture (15s) - Highlight efficiency and security.
6. Impact & Scalability (10s) - What happens when 10,000 users join.
7. Future Roadmap & Wrap-up (5s) - Thank the judges and invite questions.`,
      checklist: [
        'Practice 30-second elevator pitch',
        'Practice 2-minute live demo run without pausing',
        'Prepare 5-minute extended deck'
      ]
    },
    {
      id: 5,
      title: 'Stage 5: AI Presentation Coach & Judge Q&A',
      objective: 'Simulate realistic judge cross-examinations and polish spoken answers.',
      judgeQuestions: [
        {
          question: "How is your solution different from existing open-source tools or commercial alternatives?",
          tips: "Acknowledge the existing players, then point out your specific advantage: e.g. 100% offline-first privacy, zero subscription cost, or tailored local language support."
        },
        {
          question: "What happens if the device loses internet connection during the middle of a user workflow?",
          tips: "Highlight your local storage layer (IndexedDB/SQLite), offline queuing, and graceful status messaging."
        },
        {
          question: "How will you monetize or sustain this project after the hackathon ends?",
          tips: "Mention open-core model, institutional licensing for colleges, or lightweight developer API tiers."
        }
      ]
    },
    {
      id: 6,
      title: 'Stage 6: Mock Hackathon Simulation',
      objective: 'Run through an interactive 60-minute time-boxed hackathon simulation.',
      challengePrompt: "Challenge: Build an automated, privacy-first attendance shortage notifier for tier-2 college students.",
      deliverables: [
        'One-sentence pitch',
        'Database schema draft',
        'Working demo script',
        'Final judge answer practice'
      ]
    },
    {
      id: 7,
      title: 'Stage 7: Real Hackathon Tracker',
      objective: 'Track real upcoming hackathon deadlines, teammates, and registration links honestly.',
      description: 'Store verified hackathons (Smart India Hackathon, MLH, Hackerearth, Unstop) with deadlines and team rosters.'
    }
  ],

  getStage(stageId) {
    return this.stages.find(s => s.id === Number(stageId)) || this.stages[0];
  }
};

window.HackathonCoach = HackathonCoach;
