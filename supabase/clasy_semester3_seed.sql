-- Clasy — ABES Semester III timetable seed
-- Run this after supabase/schema.sql in Supabase SQL Editor.
-- The timetable below is transcribed from the ABES CSE and CSE-DS timetable images supplied with the project.

insert into public.branches (name, code) values
  ('Computer Science & Engineering', 'CSE'),
  ('Computer Science & Engineering — AI & ML', 'CSE-AIML'),
  ('Computer Science & Engineering — Data Science', 'CSE-DS')
on conflict (code) do update set name = excluded.name;

-- Teachers visible on the supplied timetables.
insert into public.teachers (name) values
  ('Ms. Neha Gaur'),
  ('Dr. Shweta Kaushik'),
  ('Ms. Komal'),
  ('Ms. Shaili Gupta'),
  ('PKS (name not expanded on the timetable)'),
  ('Ms. Shruti Singh'),
  ('Ms. Satwik'),
  ('Ms. Abriti Thakur'),
  ('Dr. Ashish Prakash'),
  ('Ms. Aishwarya Singh (P) + Mr. Shahil Kr. Aggarwal (S)'),
  ('Dr. Anupriya'),
  ('Mr. Dilip Kr. Bharti'),
  ('Mr. Dilip Kr. Bharti + Ms. Seema Luthra'),
  ('Dr. Neha Yadav + Ms. Divya Verma'),
  ('Mr. Ravi Kumar + Ms. Megha Agarwal'),
  ('Ms. Shreya + Ms. Dhruwajita'),
  ('Ms. Shruti Singh + X'),
  ('Mr. Dilip Bharti + Ms. Megha Agarwal'),
  ('Ms. Shaili Gupta / Ms. Neha Gaur')
on conflict do nothing;

-- Semester III subjects for CSE.
insert into public.subjects (name, code, branch_id, semester)
select v.name, v.code, b.id, 3
from (values
  ('Object Oriented Programming Paradigm', '25CS301'),
  ('Operating System', '25CS302'),
  ('Advanced Data Structure', '25CS303'),
  ('Object Oriented Programming Paradigm Lab', '25CS351'),
  ('Operating System Lab', '25CS352'),
  ('Advanced Data Structure Lab', '25CS353'),
  ('Data Visualization using Python', '25VA301'),
  ('Fundamentals of Cloud Computing', '25VA302'),
  ('Employability Skills', '25VA309'),
  ('FSD Workshop-I', '25VA351'),
  ('Holistic Skill & Innovation III', '25VA352'),
  ('Universal Human Values', '25HU301'),
  ('Technical Communication', '25HU302'),
  ('Applied Maths for Computing Applications', '25AS301'),
  ('Discrete Structure & Theory of Logic', '25OE3XX'),
  ('Verbal Ability', 'VA')
) as v(name, code)
join public.branches b on b.code = 'CSE'
where not exists (
  select 1 from public.subjects s
  where s.branch_id = b.id and s.semester = 3 and s.code = v.code
);

-- Semester III subjects for CSE-DS.
insert into public.subjects (name, code, branch_id, semester)
select v.name, v.code, b.id, 3
from (values
  ('Object Oriented Programming Paradigm', '25CS301'),
  ('Operating System', '25CS302'),
  ('Advanced Data Structure', '25CS303'),
  ('Object Oriented Programming Paradigm Lab', '25CS351'),
  ('Operating System Lab', '25CS352'),
  ('Advanced Data Structure Lab', '25CS353'),
  ('Data Visualization using Python', '25VA301'),
  ('Fundamentals of Cloud Computing', '25VA302'),
  ('Data Visualization using Python / Fundamentals of Cloud Computing', '25VA301 / 25VA302'),
  ('Employability Skills', '25VA309'),
  ('FSD Workshop-I', '25VA351'),
  ('Holistic Skill & Innovation III', '25VA352'),
  ('Universal Human Values', '25HU301'),
  ('Technical Communication', '25HU302'),
  ('Applied Maths for Computing Applications', '25AS301'),
  ('Discrete Structure & Theory of Logic', '25OE3XX'),
  ('Verbal Ability', 'VA')
) as v(name, code)
join public.branches b on b.code = 'CSE-DS'
where not exists (
  select 1 from public.subjects s
  where s.branch_id = b.id and s.semester = 3 and s.code = v.code
);

-- Helper insert pattern: only add a slot when the exact branch/day/time/subject is not already present.

-- CSE — Semester III, room KC-FF-408. Monday through Friday.
with b as (select id from public.branches where code='CSE'),
t as (select id, name from public.teachers)
insert into public.timetable_slots (branch_id, semester, day_of_week, start_time, end_time, subject_id, teacher_id, session_type, room)
select b.id, 3, x.day_no, x.start_time::time, x.end_time::time,
       s.id, t.id, x.session_type, x.room
from b
cross join lateral (values
  (1,'08:50','10:30','25CS351','Dr. Shweta Kaushik','lab','LAB 9'),
  (1,'08:50','10:30','25CS353','Ms. Shaili Gupta','lab','LAB 10'),
  (1,'10:40','11:30','25OE3XX','Ms. Neha Gaur','lecture','KC-FF-408'),
  (1,'11:30','12:20','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (1,'12:20','13:10','25VA301','PKS (name not expanded on the timetable)','lecture','KC-FF-408'),
  (1,'14:00','14:50','25CS301','Dr. Shweta Kaushik','lecture','KC-FF-408'),
  (1,'14:50','15:40','25HU302','Ms. Shruti Singh','lecture','KC-FF-408'),
  (1,'15:40','16:30','25CS302','Ms. Komal','lecture','KC-FF-408'),
  (2,'08:50','09:40','25VA351','Ms. Satwik','lecture','KC-FF-408'),
  (2,'09:40','10:30','25CS301','Dr. Shweta Kaushik','lecture','KC-FF-408'),
  (2,'10:40','11:30','25VA351','Ms. Satwik','lecture','KC-FF-408'),
  (2,'11:30','12:20','25OE3XX','Ms. Neha Gaur','lecture','KC-FF-408'),
  (2,'12:20','13:10','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (2,'14:00','14:50','25CS302','Ms. Komal','lecture','KC-FF-408'),
  (2,'14:50','15:40','25VA301','PKS (name not expanded on the timetable)','lecture','KC-FF-408'),
  (2,'15:40','16:30','25OE3XX','Ms. Neha Gaur','lecture','KC-FF-408'),
  (3,'08:50','10:30','25CS352','Ms. Komal','lab','LAB 10'),
  (3,'08:50','10:30','25CS351','Dr. Shweta Kaushik','lab','LAB 9'),
  (3,'10:40','11:30','25HU302','Ms. Shruti Singh','lecture','KC-FF-408'),
  (3,'11:30','12:20','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (3,'12:20','13:10','25CS301','Dr. Shweta Kaushik','lecture','KC-FF-408'),
  (3,'14:00','14:50','VA','Ms. Abriti Thakur','lecture','KC-FF-408'),
  (3,'14:50','15:40','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (3,'15:40','16:30','25OE3XX','Ms. Neha Gaur','lecture','KC-FF-408'),
  (4,'08:50','09:40','25VA301','PKS (name not expanded on the timetable)','lecture','KC-FF-408'),
  (4,'09:40','10:30','25CS302','Ms. Komal','lecture','KC-FF-408'),
  (4,'10:40','11:30','25VA351','Ms. Satwik','lecture','KC-FF-408'),
  (4,'11:30','12:20','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (4,'12:20','13:10','25CS303','Ms. Shaili Gupta','lecture','KC-FF-408'),
  (4,'14:00','14:50','25CS302','Ms. Komal','lecture','KC-FF-408'),
  (4,'14:50','15:40','25VA352','Ms. Shaili Gupta / Ms. Neha Gaur','lecture','KC-FF-408'),
  (4,'15:40','16:30','25VA352','Ms. Shaili Gupta / Ms. Neha Gaur','lecture','KC-FF-408'),
  (5,'08:50','09:40','25CS301','Dr. Shweta Kaushik','lecture','KC-FF-408'),
  (5,'09:40','10:30','25HU302','Ms. Shruti Singh','lecture','KC-FF-408'),
  (5,'10:40','12:20','25CS353','Ms. Shaili Gupta','lab','LAB 9'),
  (5,'10:40','12:20','25CS352','Ms. Komal','lab','LAB 10'),
  (5,'12:20','13:10','25VA351','Ms. Satwik','lecture','KC-FF-408'),
  (5,'14:00','14:50','25VA301','PKS (name not expanded on the timetable)','lecture','KC-FF-408'),
  (5,'14:50','16:30','25VA309','Ms. Shruti Singh','lecture','KC-FF-408')
) as x(day_no,start_time,end_time,subject_code,teacher_name,session_type,room)
join public.subjects s on s.branch_id=b.id and s.semester=3 and s.code=x.subject_code
join t on t.name=x.teacher_name
where not exists (
  select 1 from public.timetable_slots z
  where z.branch_id=b.id and z.semester=3 and z.day_of_week=x.day_no
    and z.start_time=x.start_time::time and z.end_time=x.end_time::time and z.subject_id=s.id
);

-- CSE-DS — Semester III, class room KC-6F-LT605.
with b as (select id from public.branches where code='CSE-DS'),
t as (select id, name from public.teachers)
insert into public.timetable_slots (branch_id, semester, day_of_week, start_time, end_time, subject_id, teacher_id, session_type, room)
select b.id, 3, x.day_no, x.start_time::time, x.end_time::time,
       s.id, t.id, x.session_type, x.room
from b
cross join lateral (values
  (1,'08:50','10:30','25VA351','Ms. Shreya + Ms. Dhruwajita','lecture','KC-6F-LT605'),
  (1,'10:40','12:20','25CS351','Mr. Dilip Kr. Bharti + Ms. Seema Luthra','lab','KC-6F-LT605'),
  (1,'13:10','14:00','25VA301 / 25VA302','Ms. Aishwarya Singh (P) + Mr. Shahil Kr. Aggarwal (S)','lecture','KC-6F-LT605'),
  (1,'14:00','14:50','25CS303','Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (1,'14:50','15:40','25AS301','Dr. Ashish Prakash','lecture','KC-6F-LT605'),
  (1,'15:40','16:30','25CS302','Dr. Neha Yadav + Ms. Divya Verma','lecture','KC-6F-LT605'),
  (2,'08:50','09:40','25CS303','Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (2,'09:40','10:30','25AS301','Dr. Ashish Prakash','lecture','KC-6F-LT605'),
  (2,'10:40','11:30','25VA309','Ms. Shruti Singh + X','lecture','KC-6F-LT605'),
  (2,'11:30','12:20','25VA352','Mr. Dilip Bharti + Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (2,'13:10','14:00','25VA351','Ms. Shreya + Ms. Dhruwajita','lecture','KC-6F-LT605'),
  (2,'14:00','14:50','25CS301','Mr. Dilip Kr. Bharti','lecture','KC-6F-LT605'),
  (2,'14:50','15:40','25CS302','Dr. Neha Yadav + Ms. Divya Verma','lecture','KC-6F-LT605'),
  (2,'15:40','16:30','25CS302','Dr. Neha Yadav + Ms. Divya Verma','lecture','KC-6F-LT605'),
  (3,'08:50','09:40','25CS303','Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (3,'09:40','10:30','25AS301','Dr. Ashish Prakash','lecture','KC-6F-LT605'),
  (3,'10:40','11:30','25CS301','Mr. Dilip Kr. Bharti','lecture','KC-6F-LT605'),
  (3,'11:30','12:20','25VA352','Mr. Dilip Bharti + Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (3,'13:10','14:00','25HU301','Dr. Anupriya','lecture','KC-6F-LT605'),
  (3,'14:00','16:30','25CS352','Dr. Neha Yadav + Ms. Divya Verma','lab','KC-6F-LT605'),
  (4,'08:50','09:40','25VA301 / 25VA302','Ms. Aishwarya Singh (P) + Mr. Shahil Kr. Aggarwal (S)','lecture','KC-6F-LT605'),
  (4,'09:40','10:30','25CS301','Mr. Dilip Kr. Bharti','lecture','KC-6F-LT605'),
  (4,'10:40','11:30','25VA309','Ms. Shruti Singh + X','lecture','KC-6F-LT605'),
  (4,'11:30','12:20','25CS302','Dr. Neha Yadav + Ms. Divya Verma','lecture','KC-6F-LT605'),
  (4,'13:10','14:00','25HU301','Dr. Anupriya','lecture','KC-6F-LT605'),
  (4,'14:00','14:50','25AS301','Dr. Ashish Prakash','lecture','KC-6F-LT605'),
  (4,'14:50','16:30','25CS353','Mr. Ravi Kumar + Ms. Megha Agarwal','lab','KC-6F-LT605'),
  (5,'08:50','09:40','25AS301','Dr. Ashish Prakash','lecture','KC-6F-LT605'),
  (5,'09:40','10:30','25CS303','Ms. Megha Agarwal','lecture','KC-6F-LT605'),
  (5,'10:40','12:20','25VA301 / 25VA302','Ms. Aishwarya Singh (P) + Mr. Shahil Kr. Aggarwal (S)','lecture','KC-6F-LT605'),
  (5,'13:10','14:00','25CS301','Mr. Dilip Kr. Bharti','lecture','KC-6F-LT605'),
  (5,'14:00','14:50','25CS302','Dr. Neha Yadav + Ms. Divya Verma','lecture','KC-6F-LT605'),
  (5,'14:50','15:40','25HU301','Dr. Anupriya','lecture','KC-6F-LT605'),
  (5,'15:40','16:30','25CS303','Ms. Megha Agarwal','lecture','KC-6F-LT605')
) as x(day_no,start_time,end_time,subject_code,teacher_name,session_type,room)
join public.subjects s on s.branch_id=b.id and s.semester=3 and s.code=x.subject_code
join t on t.name=x.teacher_name
where not exists (
  select 1 from public.timetable_slots z
  where z.branch_id=b.id and z.semester=3 and z.day_of_week=x.day_no
    and z.start_time=x.start_time::time and z.end_time=x.end_time::time and z.subject_id=s.id
);
