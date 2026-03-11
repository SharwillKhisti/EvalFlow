# EvalFlow — Team TODO & Build Plan
# Status as of March 11, 2026

## ✅ DONE (Don't touch these)
- Database schema — all 12 tables live on Supabase
- RLS policies — bulletproof, no recursion
- Auth — login/register with VIT email role detection
- Profile trigger — auto-creates profile on signup
- Student dashboard — home, courses, todo tabs
- Course join flow — join code works end to end
- Design system — CSS tokens, cards, bento grid, TopNav

---

## 👤 DEV A — Student Frontend
**Branch: feature/deva-student-pages**

### Priority 1 — CoursePage (start here)
File: `src/pages/CoursePage.jsx`
Route: `/student/courses/:courseId`

- Fetch course details + syllabus units for that course slug
- Display units as accordion or tab list
- Under each unit show:
  - Assignment card (if approved) → links to AssignmentSolvePage
  - Quiz card (if approved) → links to QuizPage
  - Theory materials list
- Empty state if no assignments/quizzes approved yet

### Priority 2 — AssignmentSolvePage
File: `src/pages/AssignmentSolvePage.jsx`
Route: `/student/courses/:courseId/assignment/:assignmentId`

- Monaco editor (npm install @monaco-editor/react)
- Block paste: import noPaste from utils/noPaste.js and attach to editor onMount
- Timer counting up from 0 (use useTimer hook)
- Hint panel on the right:
  - "Ask for a hint" button
  - POST /ai/hint → shows hint response
  - Hint count shown (max 5, each costs 10 points)
  - Hint history scrollable
- Submit button → POST /assignments/:id/submit to FastAPI
- Show result: test cases passed/failed + AI feedback + score

### Priority 3 — QuizPage
File: `src/pages/QuizPage.jsx`
Route: `/student/courses/:courseId/quiz/:quizId`

- Fetch questions from Supabase (correct_index NOT shown)
- One question at a time with prev/next
- Timer counting down (10 min total)
- Radio buttons for options A B C D
- Submit all answers → POST /quiz/submit to FastAPI
- Score reveal screen after submit (no retakes)

### Priority 4 — LeaderboardPage
File: `src/pages/LeaderboardPage.jsx`
Route: `/student/leaderboard`

- Dropdown to select course
- Ranked list filtered to student's division+batch
- Highlight current user's row
- Show badges as emoji pills next to name
- Pull from `leaderboard_with_profiles` view

### Utility files needed:
- `src/hooks/useTimer.js` — counting up timer, returns formatted MM:SS
- `src/utils/noPaste.js` — blocks paste event in Monaco editor

---

## 👤 DEV B — FastAPI Backend
**Branch: feature/devb-backend**

### Setup first
```
backend/
  main.py
  .env              # SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
  requirements.txt
  routers/
    assignments.py
    quiz.py
    ai.py
    generate.py
  services/
    ai_service.py
    piston_service.py
    leaderboard_service.py
  syllabus/         # .txt files per unit (Dev C fills these)
```

```
pip install fastapi uvicorn supabase python-dotenv google-generativeai
```

### Routes to build

#### POST /assignments/{id}/submit
- Receive: { student_id, code, hint_count, time_taken_sec }
- Fetch test_cases from assignments table (use service key)
- For each test case → call Piston API to run code
- Compute pass/fail per test case
- Call AI for code review → get ai_feedback
- Compute score: 100 - (hint_count * 10), min 50. +20 if early
- Save to submissions table
- Call leaderboard_service to update points + check badges
- Return: { test_results, score, ai_feedback, passed }

#### POST /ai/hint
- Receive: { assignment_id, code, hint_count, language }
- Fetch assignment description from Supabase
- Call generate_hint() from ai_service
- Return: { hint }
- Do NOT save to DB — hints are stateless

#### POST /quiz/submit
- Receive: { quiz_id, student_id, answers: [2,0,1,3,...], time_taken_sec }
- Fetch correct_index for each question using SERVICE KEY (never anon)
- Compute score
- Save to quiz_attempts table
- Call leaderboard_service to update quiz_points
- Return: { score, total, correct_answers }

#### POST /ai/generate
- Receive: { course_id, course_slug, unit_number, unit_title }
- Read syllabus txt file for that unit
- Call generate_quiz() → save questions to quizzes + quiz_questions
- Call generate_assignments() → save to assignments table (is_approved=false)
- Return: { quiz_id, assignment_ids }

### Piston API call (no API key needed)
```python
import httpx
async def run_code(language, code, stdin=""):
    payload = {
        "language": language,
        "version": "*",
        "files": [{"content": code}],
        "stdin": stdin
    }
    r = await httpx.AsyncClient().post(
        "https://emkc.org/api/v2/piston/execute",
        json=payload
    )
    return r.json()["run"]  # .stdout, .stderr, .code
```

### Leaderboard scoring rules
- Assignment submitted: 100 - (hint_count × 10), min 50. +20 if before due date
- Quiz: (score/total) × 50
- Badge: +15 each
- Upsert to leaderboard_scores using service key

### Badge triggers
| Badge | When |
|-------|------|
| fast_solver | time_taken < avg time for that assignment |
| independent | hint_count == 0 |
| sharp_shooter | quiz score == total_questions |
| on_a_roll | 3 consecutive hint_count==0 submissions |
| improving | quiz scores increasing across last 3 units |
| top_of_class | rank #1 in division leaderboard |
| persistent | hint_count == max_hints but still submitted |

---

## 👤 DEV C — AI & Syllabus Content
**Branch: feature/devc-ai**

### Priority 1 — Gemini Setup
```python
# backend/.env
GEMINI_API_KEY=your_key_from_aistudio.google.com

# ai_service.py
import google.generativeai as genai
import os, json

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

def call_ai(prompt):
    return model.generate_content(prompt).text
```

### Priority 2 — AI Functions to build

#### generate_hint(code, description, hint_count, language) → str
- Prompt must be SOCRATIC — never give the answer
- Hint 1: broad direction. Hint 2: more specific. Hint 3+: very targeted
- Include hint_count in prompt so hints escalate
- Example prompt shape:
  "You are a lab assistant. The student has asked for hint #{hint_count}.
   Never give the answer directly. Guide them with a question or observation.
   Assignment: {description}
   Their current code: {code}
   Give ONE short hint."

#### generate_quiz(unit_content, unit_title, course_slug) → list[dict]
- Returns 10 MCQ questions as JSON
- Each: { question_text, options: [A,B,C,D], correct_index: 0-3, explanation }
- Prompt must say: "Return ONLY valid JSON array, no markdown, no backticks"
- Parse safely:
  ```python
  raw = call_ai(prompt)
  clean = raw.strip().strip('`').replace('json\n','').replace('```','')
  return json.loads(clean)
  ```

#### generate_assignments(unit_content, unit_title, language) → list[dict]
- Returns 2-3 coding problems as JSON
- Each: { title, description, difficulty, test_cases: [{input, expected_output}] }
- test_cases must be concrete and runnable by Piston API
- Min 3 test cases per assignment

#### generate_report(student_data) → str
- Input: dict with assignment scores, quiz scores, hint usage, badges, division
- Returns ~200 word learning summary for the instructor
- Should identify patterns: e.g. "strong in theory, struggles to implement"

### Priority 3 — Syllabus .txt files
Create `backend/syllabus/` folder with these files:
Fill each with extracted content from your course materials (PPT bullet points, notes, etc.)

```
syllabus/
  python/
    unit1_basics.txt
    unit2_control_flow.txt
    unit3_functions.txt
    unit4_oop.txt
    unit5_files.txt
  c/
    unit1_intro.txt
    unit2_pointers.txt
    unit3_structs.txt
    unit4_files.txt
    unit5_dynamic.txt
  cpp/
    unit1_basics.txt
    unit2_oop.txt
    unit3_templates.txt
    unit4_stl.txt
    unit5_files.txt
  ds/
    unit1_arrays_ll.txt
    unit2_stacks_queues.txt
    unit3_trees.txt
    unit4_graphs.txt
    unit5_sorting.txt
  oop/
    unit1_classes.txt
    unit2_inheritance.txt
    unit3_polymorphism.txt
    unit4_abstraction.txt
    unit5_patterns.txt
```

Each file should have at least 200-300 words of actual topic content.
The more content, the better the AI-generated questions.

---

## 👤 DEV D — Instructor Frontend
**Branch: feature/devd-instructor**

### Priority 1 — InstructorCoursePage
File: `src/pages/InstructorCoursePage.jsx`
Route: `/instructor/courses/:courseId`

- Show course details + join code prominently
- List of units from syllabus_units table
- For each unit:
  - "Generate Content" button → POST /ai/generate
  - Shows pending assignments (is_approved=false) with Approve/Reject buttons
  - Shows approved assignments + quiz
- Theory materials section — add link/PDF/video with title

### Priority 2 — AnalyticsDashboard
File: `src/pages/AnalyticsDashboard.jsx`
Route: `/instructor/analytics`

- Install: `npm install recharts`
- Division + Batch filter dropdowns at top
- Line chart: unit number (X) vs class avg quiz score (Y) — Recharts LineChart
- Bar chart: assignments submitted per unit — Recharts BarChart
- Student table: name, division, batch, assignments submitted, avg score, badges
- Pull from `leaderboard_with_profiles` view filtered by division+batch

### Priority 3 — Update InstructorDashboard
File: `src/pages/InstructorDashboard.jsx` (already exists, needs updates)

- Course cards should link to InstructorCoursePage
- Stats: total students enrolled, assignments pending approval, avg class score
- Add "Generate Report" button per course → POST /ai/generate-report

### Hint Panel component (shared with Dev A)
File: `src/components/assignment/HintPanel.jsx`

- Shows hint history
- "Ask for a hint" button (disabled if hint_count >= max_hints)
- Each hint displayed as a chat bubble
- Counter: "3 of 5 hints used"

---

## 🔗 API Contract (Frontend ↔ FastAPI)
Base URL in frontend: `VITE_BACKEND_URL=http://localhost:8000`

| Method | Endpoint | Who calls it | Who builds it |
|--------|----------|-------------|----------------|
| POST | /assignments/{id}/submit | Dev A | Dev B |
| POST | /ai/hint | Dev A | Dev B + Dev C |
| POST | /quiz/submit | Dev A | Dev B |
| POST | /ai/generate | Dev D | Dev B + Dev C |
| POST | /ai/generate-report | Dev D | Dev B + Dev C |

All routes accept JSON. All return JSON. CORS must allow localhost:5173.

---

## 📦 NPM packages still needed
```
npm install @monaco-editor/react    # Dev A — code editor
npm install recharts                # Dev D — analytics charts
```

## 🐍 Python packages needed
```
pip install fastapi uvicorn supabase python-dotenv google-generativeai httpx
```

---

## 🗓️ Suggested Sprint Order

### Week 1 — Core Loop
- Dev B: FastAPI setup + /assignments/submit + Piston integration
- Dev C: Gemini setup + generate_hint + syllabus txt files
- Dev A: CoursePage + AssignmentSolvePage (Monaco editor + timer)
- Dev D: InstructorCoursePage + Generate Content button

### Week 2 — Quiz + Leaderboard  
- Dev B: /quiz/submit + /ai/generate routes
- Dev C: generate_quiz + generate_assignments
- Dev A: QuizPage + LeaderboardPage
- Dev D: AnalyticsDashboard (Recharts)

### Week 3 — Polish + Reports
- Dev B: Badge computation + leaderboard upsert
- Dev C: generate_report
- Dev A: Badge display + profile page
- Dev D: Report generation UI + approval workflow

### Week 4 — Testing + Demo Prep
- All: end-to-end testing with real data
- All: bug fixes
- Demo: register instructor → create course → generate content → approve
         → student joins → solves assignment → takes quiz → leaderboard updates

---

## ⚠️ Critical Rules for Everyone
1. NEVER commit .env files
2. NEVER use the anon key in backend — always use SERVICE KEY
3. NEVER send correct_index to the frontend
4. Always create a feature branch, never push directly to main
5. PR into dev branch, dev merges into main