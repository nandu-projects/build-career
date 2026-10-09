/**
 * Build Career - Curriculum Database
 * 4 Structured Tracks: Python, Cybersecurity, Artificial Intelligence, Spoken English
 * Practical structure: 70% Hands-on Practice, 30% Theory
 * Real examples, interactive code tasks, quizzes, explanations, and milestones
 */

const CURRICULUM = {
  python: {
    id: 'python',
    title: 'Python Programming',
    subtitle: 'From fundamentals to practical backend & automation projects',
    defaultDailyMinutes: 30,
    lessons: [
      {
        id: 'py-01',
        title: 'Python Core & Practical Variables',
        summary: 'Learn variables, data types, and format strings with a real college expense calculator.',
        theory: 'Python is dynamically typed. Memory is allocated automatically based on assignment. Use f-strings for clean formatting.',
        realWorldScenario: 'You are tracking your daily college expenses in Bangalore (canteen, metro, printouts).',
        codeSnippet: `chai = 15\nmetro = 35\nlunch = 80\ntotal = chai + metro + lunch\nprint(f"Daily expense: Rs. {total}")`,
        practiceTask: 'Calculate total marks of 3 subjects and find the average percentage.',
        practiceTemplate: `# Write code to sum 3 subject marks and compute percentage\nsub1 = 85\nsub2 = 90\nsub3 = 78\n\n# Your code here\n`,
        testCases: [
          { input: '85, 90, 78', expected: '84.33' }
        ],
        quiz: {
          question: 'Which string formatting method is recommended in modern Python 3.6+?',
          options: ['% formatting', 'str.format()', 'f-strings (f"...")', 'String concatenation with +'],
          correctIndex: 2,
          explanation: 'f-strings are concise, faster, and improve readability directly at the expression level.'
        }
      },
      {
        id: 'py-02',
        title: 'Conditions & Decision Making',
        summary: 'Control program flow using if, elif, and else to build a college attendance checker.',
        theory: 'Conditional statements evaluate boolean conditions. Python relies on consistent indentation (4 spaces).',
        realWorldScenario: 'VTU/University rule: If attendance is below 75%, student is detained from exams unless medical certificate exists.',
        codeSnippet: `attendance = 72\nhas_medical = True\n\nif attendance >= 75 or has_medical:\n    print("Eligible for semester exam")\nelse:\n    print("Detained: Shortage of attendance")`,
        practiceTask: 'Create an attendance eligibility check that calculates classes needed to reach 75%.',
        practiceTemplate: `total_classes = 50\nattended = 34\npercentage = (attended / total_classes) * 100\n# Determine if eligible and calculate required classes\n`,
        quiz: {
          question: 'What is the boolean result of: (5 > 3) and (10 == "10")?',
          options: ['True', 'False', 'Error', 'None'],
          correctIndex: 1,
          explanation: 'In Python, an integer is never equal to a string representation without explicit casting.'
        }
      },
      {
        id: 'py-03',
        title: 'Loops & Automation Iteration',
        summary: 'Process batch data and automate repetitive tasks using for and while loops.',
        theory: 'Loops repeat code blocks over iterables. Use enumerate() to get indices cleanly and break/continue to handle control.',
        realWorldScenario: 'Processing server logs or batch calculating semester SGPA across multiple course credits.',
        codeSnippet: `courses = [("CS401", 4, 9), ("CS402", 4, 8), ("CS403", 3, 10)]\ntotal_credits = sum(c[1] for c in courses)\nweighted_points = sum(c[1] * c[2] for c in courses)\nsgpa = weighted_points / total_credits\nprint(f"Calculated SGPA: {sgpa:.2f}")`,
        practiceTask: 'Iterate over a list of test scores and count how many students scored distinction (>= 85).',
        practiceTemplate: `scores = [78, 89, 92, 64, 85, 99, 45, 88]\n# Count scores >= 85\n`,
        quiz: {
          question: 'What does the range(2, 10, 3) call generate in Python?',
          options: ['2, 3, 4, 5, 6, 7, 8, 9', '2, 5, 8', '3, 6, 9', '2, 5, 8, 11'],
          correctIndex: 1,
          explanation: 'It starts at 2, stops strictly before 10, stepping by 3: [2, 5, 8].'
        }
      },
      {
        id: 'py-04',
        title: 'Functions & Clean Modular Code',
        summary: 'Write reusable, testable functions with type hinting and docstrings.',
        theory: 'Functions encapsulate logic, accept arguments (*args, **kwargs), and return values. Pure functions avoid side effects.',
        realWorldScenario: 'Creating a salary calculator module for an Indian tech startup payroll system.',
        codeSnippet: `def calculate_inhand_salary(ctc_lpa: float, pf_percent: float = 12.0) -> float:\n    monthly_gross = (ctc_lpa * 100000) / 12\n    pf_deduction = monthly_gross * (pf_percent / 100)\n    inhand = monthly_gross - pf_deduction\n    return round(inhand, 2)`,
        practiceTask: 'Write a function to sanitize user phone numbers to standard 10-digit format.',
        practiceTemplate: `def clean_phone_number(raw: str) -> str:\n    # Strip +91, spaces, hyphens and return 10 digits\n    pass\n`,
        quiz: {
          question: 'What is the default return value of a Python function that does not contain a return statement?',
          options: ['0', 'False', 'None', 'Empty string'],
          correctIndex: 2,
          explanation: 'Python functions implicitly return None if no return expression is executed.'
        }
      },
      {
        id: 'py-05',
        title: 'Data Structures: Lists, Dictionaries, Sets',
        summary: 'Store and manipulate complex nested data for real APIs and applications.',
        theory: 'Lists are ordered & mutable. Dictionaries offer O(1) key lookups. Sets offer unique elements and set theory operations.',
        realWorldScenario: 'Storing student hackathon registrations and filtering duplicate college IDs.',
        codeSnippet: `registrations = [\n    {"id": "CY01", "name": "Nandan", "skills": {"python", "linux"}},\n    {"id": "CY02", "name": "Rahul", "skills": {"react", "node"}}\n]\nall_skills = set().union(*(r["skills"] for r in registrations))\nprint(f"Unique tech stack count: {len(all_skills)}")`,
        practiceTask: 'Build a word frequency counter from an error log message string.',
        practiceTemplate: `log_message = "database error timeout connection error database down"\n# Create a dictionary counting word occurrences\n`,
        quiz: {
          question: 'Which method safely retrieves a dictionary value with a default fallback if the key is missing?',
          options: ['dict[key]', 'dict.get(key, default)', 'dict.fetch(key)', 'dict.find(key)'],
          correctIndex: 1,
          explanation: 'dict.get() avoids raising KeyError when the key does not exist.'
        }
      },
      {
        id: 'py-06',
        title: 'Working with JSON & REST APIs',
        summary: 'Parse incoming JSON data and interact with remote REST APIs using requests and json modules.',
        theory: 'JSON is the standard format for web data. Serialize with json.dumps() and parse with json.loads().',
        realWorldScenario: 'Fetching live crypto or Bangalore weather data from a public weather API.',
        codeSnippet: `import json\n\nraw_response = '{"city": "Bangalore", "temp_c": 24.5, "status": "Clear"}'\ndata = json.loads(raw_response)\nprint(f"Weather in {data['city']}: {data['temp_c']}°C")`,
        practiceTask: 'Parse a GitHub API user response and extract the public repo count and follower count.',
        practiceTemplate: `api_data = '{"login": "nandu-projects", "public_repos": 12, "followers": 30}'\n# Extract and print details cleanly\n`,
        quiz: {
          question: 'Which HTTP status code signifies a successful request returning content?',
          options: ['200 OK', '201 Created', '301 Redirect', '404 Not Found'],
          correctIndex: 0,
          explanation: '200 OK is the standard HTTP response for successful web requests.'
        }
      }
    ]
  },

  cybersecurity: {
    id: 'cybersecurity',
    title: 'Cybersecurity & Defensive Engineering',
    subtitle: 'Practical defense, networking, Linux security, logs & ethical security lab',
    defaultDailyMinutes: 40,
    lessons: [
      {
        id: 'sec-01',
        title: 'Network Fundamentals & Packet Flow',
        summary: 'Understand IP addressing, DNS resolution, TCP three-way handshake, and port scanning.',
        theory: 'Every connected device has an IP. TCP provides reliable ordered transport using SYN, SYN-ACK, ACK handshake.',
        realWorldScenario: 'Analyzing why a college lab client cannot resolve the internal grading portal domain.',
        codeSnippet: `# TCP Handshake Simulation\n# Client -> Server : SYN (seq=100)\n# Server -> Client : SYN-ACK (seq=300, ack=101)\n# Client -> Server : ACK (seq=101, ack=301)\nprint("TCP Connection Established: Ready for TLS handshake")`,
        practiceTask: 'Given an IP header with source 192.168.1.10 and destination 10.0.0.1, classify private vs public address ranges.',
        practiceTemplate: `# Classify RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)\ndef is_private_ip(ip_str: str) -> bool:\n    pass\n`,
        quiz: {
          question: 'Which default port is used for secure encrypted HTTPS web traffic?',
          options: ['Port 80', 'Port 443', 'Port 22', 'Port 8080'],
          correctIndex: 1,
          explanation: 'Port 443 is reserved for HTTPS (HTTP over TLS/SSL).'
        }
      },
      {
        id: 'sec-02',
        title: 'Linux Permissions & System Auditing',
        summary: 'Master file permissions (chmod, chown), sudo privileges, and auditing auth.log.',
        theory: 'Linux permissions follow User, Group, Others with Read(4), Write(2), Execute(1). SUID bits execute with owner permissions.',
        realWorldScenario: 'An attacker leaves a world-writable file /etc/cron.daily/backup.sh allowing privilege escalation.',
        codeSnippet: `# Dangerous: chmod 777 sensitive.key\n# Secure:\n# chmod 600 id_rsa\n# chown root:root /etc/shadow && chmod 640 /etc/shadow`,
        practiceTask: 'Calculate the octal permission code for: User: rwx, Group: r-x, Others: r--',
        practiceTemplate: `# Octal: User(4+2+1=7), Group(4+0+1=5), Others(4+0+0=4)\nresult = "754"\n`,
        quiz: {
          question: 'What does chmod 644 myfile.txt grant to Group members?',
          options: ['Read only', 'Read and Write', 'Read and Execute', 'No permissions'],
          correctIndex: 0,
          explanation: 'The second digit represents Group. 4 = Read only (r--).'
        }
      },
      {
        id: 'sec-03',
        title: 'Web Application Security & OWASP Top 10',
        summary: 'Spot and remediate SQL Injection, Cross-Site Scripting (XSS), and Broken Authentication.',
        theory: 'Never trust user input. Unsanitized strings concatenated into database queries allow query structure alteration.',
        realWorldScenario: 'A vulnerable college login form: query = "SELECT * FROM users WHERE user=\'" + input + "\'"',
        codeSnippet: `# Vulnerable:\n# cursor.execute(f"SELECT * FROM users WHERE user='{user_input}'")\n# Secure parameterized query:\ncursor.execute("SELECT * FROM users WHERE user = ?", (user_input,))`,
        practiceTask: 'Identify the vulnerability in this code snippet: document.getElementById("welcome").innerHTML = userInput;',
        practiceTemplate: `# Explain how to fix DOM-based XSS\n# Fix: use textContent instead of innerHTML\n`,
        quiz: {
          question: 'What is the primary defense against SQL Injection vulnerabilities?',
          options: ['Client-side regex validation', 'Parameterized queries / Prepared statements', 'Encoding output with Base64', 'Using POST instead of GET'],
          correctIndex: 1,
          explanation: 'Parameterized queries treat input strictly as data parameters, never executable SQL commands.'
        }
      },
      {
        id: 'sec-04',
        title: 'Security Log Analysis & Incident Detection',
        summary: 'Analyze Apache/Nginx web server access logs and SSH auth logs to detect brute-force attacks.',
        theory: 'Attackers generate high-frequency failed attempts (HTTP 401/403 or Failed password for root). Correlate timestamps and IPs.',
        realWorldScenario: 'Detecting an automated brute force attacker targeting your cloud VPS SSH port 22.',
        codeSnippet: `sample_logs = [\n  "Oct 10 01:12:00 vps sshd[401]: Failed password for root from 203.0.113.19 port 44122",\n  "Oct 10 01:12:02 vps sshd[405]: Failed password for root from 203.0.113.19 port 44124",\n  "Oct 10 01:12:04 vps sshd[409]: Failed password for root from 203.0.113.19 port 44126"\n]\n# Threshold: 3 failures in < 1 minute -> Auto ban IP in iptables/fail2ban`,
        practiceTask: 'Parse sample log entries and extract the attacking IP address.',
        practiceTemplate: `log = "Failed password for invalid user admin from 198.51.100.42 port 53120"\n# Extract the IP address string\n`,
        quiz: {
          question: 'What is the purpose of an Intrusion Detection System (IDS) like Snort or Suricata?',
          options: ['Encrypt hard drives', 'Monitor network traffic for malicious signatures or anomalies', 'Compile source code securely', 'Host web servers'],
          correctIndex: 1,
          explanation: 'An IDS monitors packets or logs to alert administrators of known exploit attempts and abnormal activity.'
        }
      }
    ]
  },

  ai: {
    id: 'ai',
    title: 'Artificial Intelligence & Practical ML',
    subtitle: 'From AI fundamentals & prompt engineering to fine-tuning, embeddings & RAG',
    defaultDailyMinutes: 25,
    lessons: [
      {
        id: 'ai-01',
        title: 'AI vs ML vs Deep Learning vs GenAI',
        summary: 'Deconstruct the taxonomy of artificial intelligence and explore where LLMs fit.',
        theory: 'AI is the broad field. ML learns patterns from data. Deep Learning uses deep neural nets. GenAI creates novel text/audio/images.',
        realWorldScenario: 'Deciding whether your college project needs a rule-based engine, an ML classifier, or an LLM.',
        codeSnippet: `# Rule-based: if temp > 30: return "Hot"\n# ML: model.predict([temp, humidity]) -> Probability of Rain\n# GenAI: prompt -> "Summarize Bangalore climate trends across monsoon"`,
        practiceTask: 'Categorize three real-world student tasks into ML Classification, Regression, or Generative AI.',
        practiceTemplate: `# Task 1: Predicting housing price in Koramangala -> Regression\n# Task 2: Spam filter -> Classification\n# Task 3: Resume builder bullet generator -> Generative AI\n`,
        quiz: {
          question: 'What distinguishes Generative AI from standard predictive Machine Learning?',
          options: ['It uses larger CSV tables', 'It generates new original content rather than just classifying existing data', 'It does not require training', 'It only works with numbers'],
          correctIndex: 1,
          explanation: 'Generative AI synthesizes new content (text, images, code) modeled on learned probability distributions.'
        }
      },
      {
        id: 'ai-02',
        title: 'Prompt Engineering & System Directives',
        summary: 'Master few-shot prompting, chain-of-thought reasoning, and system role constraints.',
        theory: 'Prompts provide conditioning context for autoregressive next-token prediction. Role clarity + clear constraints maximize output quality.',
        realWorldScenario: 'Building an automated resume bullet refiner for campus placements.',
        codeSnippet: `system_prompt = "You are a senior tech recruiter. Rewrite user bullet points in Action-Verb + Task + Metric format."\nuser_prompt = "I made a website for college events."\n# Good Output: 'Architected full-stack event portal serving 1,200+ attendees with 99.8% uptime.'`,
        practiceTask: 'Construct a Chain-of-Thought prompt asking the AI to verify a math logic step before answering.',
        practiceTemplate: `# Write a prompt containing: "Think step-by-step before concluding the answer."\n`,
        quiz: {
          question: 'What is "Few-Shot Prompting"?',
          options: ['Prompting multiple times until it answers', 'Providing 2-3 input/output examples within the prompt to guide formatting', 'Using a small model', 'Asking short questions'],
          correctIndex: 1,
          explanation: 'Few-shot prompting provides example pairs directly in the context window to steer format and reasoning.'
        }
      },
      {
        id: 'ai-03',
        title: 'Embeddings & Vector Search (RAG Fundamentals)',
        summary: 'Convert text into dense numerical vectors to perform semantic similarity search.',
        theory: 'Embeddings map semantic meaning into high-dimensional geometric space. Cosine similarity calculates angular proximity.',
        realWorldScenario: 'Searching through 500 pages of cybersecurity textbooks using conversational queries.',
        codeSnippet: `# Semantic similarity: cosine_sim(vec("malware"), vec("trojan")) ≈ 0.89\n# Keyword search fails on synonyms, embeddings capture conceptual meaning!`,
        practiceTask: 'Given cosine similarity scores: 0.92, 0.45, 0.12, identify the most semantically related document chunk.',
        practiceTemplate: `scores = [0.92, 0.45, 0.12]\n# Highest score represents highest semantic match\nbest_match = max(scores)\n`,
        quiz: {
          question: 'What does RAG stand for in modern AI architectures?',
          options: ['Random Array Generation', 'Retrieval-Augmented Generation', 'Recursive Automated Gradient', 'Response Action Gateway'],
          correctIndex: 1,
          explanation: 'RAG retrieves relevant external knowledge chunks and injects them into the prompt before generation.'
        }
      }
    ]
  },

  english: {
    id: 'english',
    title: 'Spoken English & Communication Coach',
    subtitle: 'Daily spoken fluency, grammar corrections, tech explanations & placement interviews',
    defaultDailyMinutes: 25,
    lessons: [
      {
        id: 'eng-01',
        title: 'Past Tense in Daily & College Conversations',
        summary: 'Eliminate common past tense errors when describing your day, projects, and activities.',
        theory: 'Use simple past ("I went", "I built") for completed actions. Avoid combining did + past form ("did went" ❌ -> "did go" ✔️).',
        realWorldScenario: 'Answering an interviewer asking: "Tell me what you worked on yesterday."',
        codeSnippet: `Incorrect: "Yesterday I go to college and given presentation."\nCorrect:   "Yesterday I went to college and gave a presentation."\nExplanation: Both verbs must match the simple past tense timeline.`,
        practiceTask: 'Correct this sentence: "Last week our team have submitted the project."',
        practiceTemplate: `# Correct sentence:\n# "Last week our team submitted the project."\n`,
        quiz: {
          question: 'Which of the following sentences is grammatically correct?',
          options: ['Did you completed the assignment?', 'Did you complete the assignment?', 'Did you completing the assignment?', 'Did you had completed the assignment?'],
          correctIndex: 1,
          explanation: 'After the auxiliary verb "did", use the base form of the main verb ("complete").'
        }
      },
      {
        id: 'eng-02',
        title: 'Explaining Technical Projects with Clarity',
        summary: 'Structure project explanations into Problem, Solution, Architecture, and Impact.',
        theory: 'Clear communication avoids jargon dumps. Use transitions: "We identified that...", "To solve this, we built...", "The impact was...".',
        realWorldScenario: 'A campus placement round where the technical lead asks: "Walk me through your best project."',
        codeSnippet: `Pitch Script:\n1. Problem: "College students often lose track of daily deadlines."\n2. Solution: "I built Build Career, a lightweight offline-first Android companion."\n3. Result: "It helps students track 120 minutes of daily hands-on practice."`,
        practiceTask: 'Draft a 2-sentence explanation of your favourite hobby or tech topic using cause-and-effect transitions.',
        practiceTemplate: `# Template: "I chose [X] because [Y]. As a result, [Z]."\n`,
        quiz: {
          question: 'What is the most effective way to start a technical project presentation?',
          options: ['Reciting all the library versions you used', 'Stating the problem your project solves for real users', 'Apologizing for being nervous', 'Reading code line-by-line'],
          correctIndex: 1,
          explanation: 'Leading with the human or business problem immediately captures attention and provides context for the solution.'
        }
      },
      {
        id: 'eng-03',
        title: 'Handling Tough Questions & Confident Recovery',
        summary: 'Master polite clarification, buying time, and graceful recovery when you do not know the answer.',
        theory: 'Never guess blindly. Use professional bridge phrases: "That is an insightful question. While I have not tested X yet, based on Y I would approach it by..."',
        realWorldScenario: 'A hackathon judge asks about scalability under 100,000 concurrent users.',
        codeSnippet: `Bridge phrases:\n- "Could you please elaborate on that scenario?"\n- "Currently our prototype handles local persistence; for 100k users we would introduce Redis caching."\n- "I will certainly verify that edge case."`,
        practiceTask: 'Respond gracefully to the question: "Have you worked with Kubernetes in production?"',
        practiceTemplate: `# "While I have focused on Docker containers locally, I understand the core orchestration concepts and am eager to learn Kubernetes."\n`,
        quiz: {
          question: 'What is the best response if an interviewer asks a concept you genuinely do not know?',
          options: ['Pretend you know and make up terminology', 'Stay completely silent', 'Acknowledge honestly, share what related concepts you do know, and show eagerness to learn', 'Blame your college professor'],
          correctIndex: 2,
          explanation: 'Interviewers value intellectual honesty, problem-solving attitude, and readiness to learn over fabricated answers.'
        }
      }
    ]
  }
};

window.CURRICULUM = CURRICULUM;
