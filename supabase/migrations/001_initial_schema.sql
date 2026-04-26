-- supabase/migrations/001_initial_schema.sql

-- Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Application Status Enum
create type application_status as enum (
  'saved', 'applied', 'followed_up', 'interview', 'rejected', 'offer'
);

-- Job Applications Table
create table public.job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null,
  job_position text not null,
  job_link text,
  application_date date default current_date,
  status application_status default 'saved',
  resume_version text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Application Timeline Table
create table public.application_timeline (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references job_applications on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  action text not null,
  notes text,
  created_at timestamptz default now()
);

-- Reminder Type Enum
create type reminder_type as enum (
  'follow_up', 'interview_prep', 'research', 'update_resume'
);

-- Reminders Table
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  application_id uuid references job_applications on delete cascade,
  reminder_type reminder_type not null,
  label text,
  scheduled_for timestamptz not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Resume Files Table
create table public.resume_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  version_label text,
  uploaded_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.job_applications enable row level security;
alter table public.application_timeline enable row level security;
alter table public.reminders enable row level security;
alter table public.resume_files enable row level security;

-- RLS Policies
create policy "Users can manage their own profiles" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can manage their own job applications" on public.job_applications
  for all using (auth.uid() = user_id);

create policy "Users can manage their own application timeline" on public.application_timeline
  for all using (auth.uid() = user_id);

create policy "Users can manage their own reminders" on public.reminders
  for all using (auth.uid() = user_id);

create policy "Users can manage their own resume files" on public.resume_files
  for all using (auth.uid() = user_id);

-- Profile Trigger on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
