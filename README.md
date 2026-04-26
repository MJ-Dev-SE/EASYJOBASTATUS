# EASYJOBASTATUS 🏆

**Smart Job Application Tracker & AI-Powered Job Hunting Assistant**

EasyJobStatus is a comprehensive platform designed to streamline your job search. Track applications, analyze your fit for specific roles, research companies, and generate professional follow-up messages — all powered by Google Gemini AI and Supabase.

## 🚀 Features

- **Dashboard**: High-level overview of your job search progress with status charts and recommended actions.
- **Application Tracker**: Manage all your job applications with a robust filtering and status system.
- **Timeline & History**: Every status update is recorded, creating a clear audit trail of your journey.
- **AI Fit Analyzer**: Paste your resume and a job description to get a compatibility score and skill gap analysis.
- **Company Research**: Get instant AI summaries of company background, legitimacy, and search guidance.
- **Contact Finder**: Strategic guidance on how to find official recruiters and HR contacts professionally.
- **Follow-Up Assistant**: Generate optimized email and LinkedIn templates based on your application timeline.
- **Smart Reminders**: Never miss a follow-up or interview prep task with integrated reminders.

## 🛠 Tech Stack

- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS v4.
- **Routing**: React Router v6.
- **Backend/Auth**: Supabase (PostgreSQL, RLS).
- **AI Engine**: Google Gemini AI (@google/genai).
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **Forms**: React Hook Form + Zod.
- **Notifications**: react-hot-toast.

## ⚙️ Setup Instructions

### 1. External Requirements
- **Supabase Project**: Create a project at [supabase.com](https://supabase.com).
- **Google Gemini API Key**: Get your key from [Google AI Studio](https://aistudio.google.com/).

### 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Migration
1. Log in to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Create a new query.
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`.
5. Run the query to set up tables, enums, triggers, and RLS policies.

### 4. Storage Setup (Optional for Resume Uploads)
1. In Supabase, go to **Storage**.
2. Create a new **Private** bucket named `resumes`.
3. Ensure RLS is enabled for the bucket to allow authenticated users to manage their own files.

### 5. Run Locally
```bash
npm install
npm run dev
```

## 📜 AI Usage Rules
- All AI outputs are framed as **guidance**, not absolute fact.
- Disclaimers are included in Company Research and Contact Finder to encourage independent verification.
- We promote **professional and respectful** communication; spamming recruiters is explicitly discouraged in the UI.

## 📚 Planned Integrations
- **READYSKILLED**: Future integration for direct learning path recommendations for identified skill gaps.

---
*Built with ❤️ for career winners.*
