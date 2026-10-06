-- ==========================================
-- COLLEGE TIMETABLE & NOTES APP - DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BRANCHES TABLE
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz default now()
);

-- 2. SUBJECTS TABLE
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  branch_id uuid references public.branches(id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  created_at timestamptz default now()
);

-- 3. TEACHERS TABLE
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz default now()
);

-- 4. TIMETABLE SLOTS TABLE
create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday, 1=Monday ... 6=Saturday
  start_time time not null,
  end_time time not null,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  session_type text check (session_type in ('lecture','lab','tutorial')) default 'lecture',
  room text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. NOTES TABLE
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  unit int default 1 check (unit between 1 and 5),
  title text not null,
  file_path text not null,
  description text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 6. ADMIN PROFILES TABLE (Extends Supabase Auth users)
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean default true,
  created_at timestamptz default now()
);

-- 7. USER PREFERENCES TABLE
create table if not exists public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  semester int check (semester between 1 and 8),
  updated_at timestamptz default now()
);

-- INDEXES FOR HIGH-PERFORMANCE QUERIES
create index if not exists idx_timetable_lookup on public.timetable_slots(branch_id, semester, day_of_week);
create index if not exists idx_notes_lookup on public.notes(branch_id, semester, subject_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
alter table public.branches enable row level security;
alter table public.subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.notes enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.user_preferences enable row level security;

-- Public (Anonymous) Read Access Policies
create policy "Allow public read on branches" on public.branches for select using (true);
create policy "Allow public read on subjects" on public.subjects for select using (true);
create policy "Allow public read on teachers" on public.teachers for select using (true);
create policy "Allow public read on timetable_slots" on public.timetable_slots for select using (true);
create policy "Allow public read on notes" on public.notes for select using (true);

-- Admin Modify Policies (Strict check against admin_profiles)
create policy "Admins can insert branches" on public.branches for insert with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can update branches" on public.branches for update using (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can delete branches" on public.branches for delete using (exists (select 1 from public.admin_profiles where id = auth.uid()));

create policy "Admins can insert subjects" on public.subjects for insert with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can update subjects" on public.subjects for update using (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can delete subjects" on public.subjects for delete using (exists (select 1 from public.admin_profiles where id = auth.uid()));

create policy "Admins can insert teachers" on public.teachers for insert with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can update teachers" on public.teachers for update using (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "Admins can delete teachers" on public.teachers for delete using (exists (select 1 from public.admin_profiles where id = auth.uid()));

create policy "Admins can modify timetable_slots" on public.timetable_slots for all
  using (exists (select 1 from public.admin_profiles where id = auth.uid()))
  with check (exists (select 1 from public.admin_profiles where id = auth.uid()));

create policy "Admins can modify notes" on public.notes for all
  using (exists (select 1 from public.admin_profiles where id = auth.uid()))
  with check (exists (select 1 from public.admin_profiles where id = auth.uid()));

-- User Preferences Policy
create policy "Users can manage own preferences" on public.user_preferences for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- ==========================================
-- STORAGE BUCKET POLICIES (FOR NOTES)
-- ==========================================
insert into storage.buckets (id, name, public) 
values ('notes', 'notes', true)
on conflict (id) do nothing;

create policy "Public read notes bucket" on storage.objects for select
  using (bucket_id = 'notes');

create policy "Admins upload to notes bucket" on storage.objects for insert
  with check (bucket_id = 'notes' and exists (select 1 from public.admin_profiles where id = auth.uid()));

create policy "Admins delete from notes bucket" on storage.objects for delete
  using (bucket_id = 'notes' and exists (select 1 from public.admin_profiles where id = auth.uid()));

-- ==========================================
-- SAMPLE DATA SEEDING
-- ==========================================
insert into public.branches (id, name, code) values
  ('b1111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'CSE'),
  ('b2222222-2222-2222-2222-222222222222', 'Electronics & Communication', 'ECE'),
  ('b3333333-3333-3333-3333-333333333333', 'Mechanical Engineering', 'ME'),
  ('b4444444-4444-4444-4444-444444444444', 'Artificial Intelligence & Data Science', 'AI-DS')
on conflict (code) do nothing;

insert into public.teachers (id, name, email) values
  ('t1111111-1111-1111-1111-111111111111', 'Dr. Alan Turing', 'alan.turing@college.edu'),
  ('t2222222-2222-2222-2222-222222222222', 'Prof. Ada Lovelace', 'ada.lovelace@college.edu'),
  ('t3333333-3333-3333-3333-333333333333', 'Dr. Claude Shannon', 'claude.shannon@college.edu'),
  ('t4444444-4444-4444-4444-444444444444', 'Prof. Grace Hopper', 'grace.hopper@college.edu')
on conflict (id) do nothing;

insert into public.subjects (id, name, code, branch_id, semester) values
  ('s1111111-1111-1111-1111-111111111111', 'Data Structures & Algorithms', 'CS401', 'b1111111-1111-1111-1111-111111111111', 4),
  ('s2222222-2222-2222-2222-222222222222', 'Database Management Systems', 'CS402', 'b1111111-1111-1111-1111-111111111111', 4),
  ('s3333333-3333-3333-3333-333333333333', 'DBMS Advanced Practical Lab', 'CS402L', 'b1111111-1111-1111-1111-111111111111', 4),
  ('s4444444-4444-4444-4444-444444444444', 'Operating Systems & Kernel Design', 'CS403', 'b1111111-1111-1111-1111-111111111111', 4)
on conflict (id) do nothing;

-- Seed Timetable Slots for Monday (1) through Friday (5)
insert into public.timetable_slots (branch_id, semester, day_of_week, start_time, end_time, subject_id, teacher_id, session_type, room) values
  ('b1111111-1111-1111-1111-111111111111', 4, 1, '09:00:00', '10:00:00', 's1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 'lecture', 'LH-301'),
  ('b1111111-1111-1111-1111-111111111111', 4, 1, '10:00:00', '11:00:00', 's2222222-2222-2222-2222-222222222222', 't2222222-2222-2222-2222-222222222222', 'lecture', 'LH-301'),
  ('b1111111-1111-1111-1111-111111111111', 4, 1, '11:15:00', '13:15:00', 's3333333-3333-3333-3333-333333333333', 't2222222-2222-2222-2222-222222222222', 'lab', 'Lab-B2 (Database Lab)'),
  ('b1111111-1111-1111-1111-111111111111', 4, 1, '14:00:00', '15:00:00', 's4444444-4444-4444-4444-444444444444', 't3333333-3333-3333-3333-333333333333', 'lecture', 'LH-302');

-- ==========================================
-- CLASY BRANCHES (CSE / CSE-AIML / CSE-DS)
-- ==========================================
insert into public.branches (name, code)
values
  ('Computer Science & Engineering', 'CSE'),
  ('Computer Science & Engineering — AI & ML', 'CSE-AIML'),
  ('Computer Science & Engineering — Data Science', 'CSE-DS')
on conflict (code) do update set name = excluded.name;

-- Example Semester 4 subjects for the three Clasy branches.
insert into public.subjects (name, code, branch_id, semester)
select v.name, v.code, b.id, 4
from (values
  ('Machine Learning', 'AI401', 'CSE-AIML'),
  ('Deep Learning', 'AI402', 'CSE-AIML'),
  ('Natural Language Processing', 'AI403', 'CSE-AIML'),
  ('Python for AI', 'AI404', 'CSE-AIML'),
  ('Statistics for Data Science', 'DS401', 'CSE-DS'),
  ('Data Science with Python', 'DS402', 'CSE-DS'),
  ('Machine Learning', 'DS403', 'CSE-DS'),
  ('Data Visualization', 'DS404', 'CSE-DS')
) as v(name, code, branch_code)
join public.branches b on b.code = v.branch_code
where not exists (
  select 1 from public.subjects s where s.code = v.code and s.branch_id = b.id and s.semester = 4
);
