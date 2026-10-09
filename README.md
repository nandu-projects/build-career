# Build Career - Learn. Practice. Grow.

An offline-first, professional Android application designed for engineering students (specifically B.E. CSE / Cybersecurity) to master practical skills, develop real projects, build spoken English fluency, and gain confidence in hackathons and placements.

## 🎯 Target Daily Plan (120 Minutes)
1. **Python Programming**: 30 minutes daily (Practical scripting, functions, OOP, REST APIs, automation)
2. **Cybersecurity & Defensive Engineering**: 40 minutes daily (Networking, packet inspection, Linux auditing, OWASP Top 10, log analysis)
3. **Artificial Intelligence**: 25 minutes daily (AI/ML taxonomy, prompt engineering, embeddings, RAG architectures)
4. **Spoken English Coach**: 25 minutes daily (Interactive speech feedback, tense corrections, technical pitch structures)

---

## 🚀 Key Features

- **Practice-First Curriculum Engine (70% Practice / 30% Theory)**: Real-world college and startup scenarios, interactive knowledge checks, code templates, and honest progress tracking.
- **Interactive Spoken English Coach**: Speech recognition & text analysis detecting grammar slips (e.g. past tense errors, auxiliary verb slips) with gentle corrections and natural alternatives.
- **Dedicated Hackathon & Presentation Coach (Isolated from Home Dashboard)**: 7-stage guide covering everything from ideation and 24h MVP architecture to 30s elevator pitches, 2-minute judge presentations, and simulated judge Q&A.
- **Study Timers**: Timestamp-based accurate elapsed time calculation with process recovery across app restarts.
- **AI Companion & Tool Execution**: Candid conversation partner and mentor capable of creating notes, recording memories, and explaining concepts.
- **Zero-Cost Architecture (₹0)**: 100% offline-first local persistence, Web Speech API & SpeechSynthesis, and open-source tooling without recurring subscriptions or paid API locks.
- **Local Data Persistence & JSON Backup/Restore**: Full export and import to safeguard study progress and notes.

---

## 🛠️ Tech Stack & Architecture

- **Platform**: Android Native via Capacitor 8
- **Core Engine**: HTML5, Modern Vanilla JavaScript (ES6+), CSS3 Dark Design System
- **Persistence**: LocalStorage / IndexedDB with automated date rollover detection
- **Audio & Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) with native Indian English & regional voice support
- **Testing**: Node.js Automated Test Suite (`tests/run-tests.js`)
- **CI/CD**: GitHub Actions (`.github/workflows/build-and-release.yml`)

---

## 📱 Development & Live-Reload Workflow

### Local Development Server
Run a local lightweight HTTP server:
```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

### Live-Reload on Connected Android Device
For live-reloading UI changes directly on your connected phone or emulator without rebuilding the APK:
1. Update `capacitor.config.json` server URL to your machine's local IP:
   ```json
   "server": {
     "url": "http://<YOUR_LOCAL_IP>:8080",
     "cleartext": true
   }
   ```
2. Run:
   ```bash
   npx cap copy android
   ```
3. When ready for production, remove the `url` property to bundle assets completely offline.

---

## 🏗️ Android Build Instructions

```bash
# Prepare web assets
npm run build

# Copy assets to Android native shell
npx cap copy android

# Compile Debug APK
cd android
./gradlew assembleDebug
```
The compiled APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.
