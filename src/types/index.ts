// src/types/index.ts
export type ApplicationStatus = 'saved' | 'applied' | 'followed_up' | 'interview' | 'rejected' | 'offer';
export type ReminderType = 'follow_up' | 'interview_prep' | 'research' | 'update_resume';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_position: string;
  job_link: string | null;
  application_date: string;
  status: ApplicationStatus;
  resume_version: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationTimeline {
  id: string;
  application_id: string;
  user_id: string;
  action: string;
  notes: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  application_id: string | null;
  reminder_type: ReminderType;
  label: string | null;
  scheduled_for: string;
  is_completed: boolean;
  created_at: string;
}

export interface ResumeFile {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  version_label: string | null;
  uploaded_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      job_applications: {
        Row: JobApplication;
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          job_position: string;
          job_link?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          resume_version?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_position?: string;
          job_link?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          resume_version?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      application_timeline: {
        Row: ApplicationTimeline;
        Insert: {
          id?: string;
          application_id: string;
          user_id: string;
          action: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          user_id?: string;
          action?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      reminders: {
        Row: Reminder;
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          reminder_type: ReminderType;
          label?: string | null;
          scheduled_for: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          reminder_type?: ReminderType;
          label?: string | null;
          scheduled_for?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      resume_files: {
        Row: ResumeFile;
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          storage_path: string;
          version_label?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          storage_path?: string;
          version_label?: string | null;
          uploaded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: ApplicationStatus;
      reminder_type: ReminderType;
    };
  };
}
