import { Branch, Subject, Teacher, TimetableSlot, Note } from './types';

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b-cse', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'b-cse-aiml', name: 'Computer Science & Engineering — AI & ML', code: 'CSE-AIML' },
  { id: 'b-cse-ds', name: 'Computer Science & Engineering — Data Science', code: 'CSE-DS' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  // CSE — ABES timetable
  { id: 't-neha-gaur', name: 'Ms. Neha Gaur' },
  { id: 't-shweta-kaushik', name: 'Dr. Shweta Kaushik' },
  { id: 't-komal', name: 'Ms. Komal' },
  { id: 't-shaili-gupta', name: 'Ms. Shaili Gupta' },
  { id: 't-pks', name: 'PKS (name not expanded on the timetable)' },
  { id: 't-shruti-singh', name: 'Ms. Shruti Singh' },
  { id: 't-satwik', name: 'Ms. Satwik' },
  { id: 't-neha-gaur-2', name: 'Ms. Neha Gaur' },
  { id: 't-abriti-thakur', name: 'Ms. Abriti Thakur' },
  { id: 't-shaili-neha', name: 'Ms. Shaili Gupta / Ms. Neha Gaur' },

  // CSE-DS — ABES timetable
  { id: 't-ashish-prakash', name: 'Dr. Ashish Prakash' },
  { id: 't-aishwarya-shahil', name: 'Ms. Aishwarya Singh (P) + Mr. Shahil Kr. Aggarwal (S)' },
  { id: 't-anupriya', name: 'Dr. Anupriya' },
  { id: 't-dilip-bharti', name: 'Mr. Dilip Kr. Bharti' },
  { id: 't-dilip-seema', name: 'Mr. Dilip Kr. Bharti + Ms. Seema Luthra' },
  { id: 't-neha-dv', name: 'Dr. Neha Yadav + Ms. Divya Verma' },
  { id: 't-ravi-megha', name: 'Mr. Ravi Kumar + Ms. Megha Agarwal' },
  { id: 't-shreya-dhruwajita', name: 'Ms. Shreya + Ms. Dhruwajita' },
  { id: 't-shruti-x', name: 'Ms. Shruti Singh + X' },
  { id: 't-dilip-megha', name: 'Mr. Dilip Bharti + Ms. Megha Agarwal' },
];

// Helper to create the full list of 16 semester 3 subjects for a given branch
function createSemester3Subjects(branchId: string, prefix: string): Subject[] {
  return [
    { id: `${prefix}-301`, name: 'Object Oriented Programming Paradigm', code: '25CS301', branch_id: branchId, semester: 3 },
    { id: `${prefix}-302`, name: 'Operating System', code: '25CS302', branch_id: branchId, semester: 3 },
    { id: `${prefix}-303`, name: 'Advanced Data Structure', code: '25CS303', branch_id: branchId, semester: 3 },
    { id: `${prefix}-351`, name: 'Object Oriented Programming Paradigm Lab', code: '25CS351', branch_id: branchId, semester: 3 },
    { id: `${prefix}-352`, name: 'Operating System Lab', code: '25CS352', branch_id: branchId, semester: 3 },
    { id: `${prefix}-353`, name: 'Advanced Data Structure Lab', code: '25CS353', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va301`, name: 'Data Visualization using Python', code: '25VA301', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va302`, name: 'Fundamentals of Cloud Computing', code: '25VA302', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va309`, name: 'Employability Skills', code: '25VA309', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va351`, name: 'FSD Workshop-I', code: '25VA351', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va352`, name: 'Holistic Skill & Innovation III', code: '25VA352', branch_id: branchId, semester: 3 },
    { id: `${prefix}-hu301`, name: 'Universal Human Values', code: '25HU301', branch_id: branchId, semester: 3 },
    { id: `${prefix}-hu302`, name: 'Technical Communication', code: '25HU302', branch_id: branchId, semester: 3 },
    { id: `${prefix}-as301`, name: 'Applied Maths for Computing Applications', code: '25AS301', branch_id: branchId, semester: 3 },
    { id: `${prefix}-oe3xx`, name: 'Discrete Structure & Theory of Logic', code: '25OE3XX', branch_id: branchId, semester: 3 },
    { id: `${prefix}-va`, name: 'Verbal Ability', code: 'VA', branch_id: branchId, semester: 3 },
  ];
}

export const INITIAL_SUBJECTS: Subject[] = [
  ...createSemester3Subjects('b-cse', 's-cse'),
  ...createSemester3Subjects('b-cse-ds', 's-ds'),
  ...createSemester3Subjects('b-cse-aiml', 's-aiml'),
  
  // Extra specific combo subject for DS timetable compatibility
  { id: 's-ds-va301-302', name: 'Data Visualization using Python / Fundamentals of Cloud Computing', code: '25VA301 / 25VA302', branch_id: 'b-cse-ds', semester: 3 },
];

const CSE_ROOM = 'KC-FF-408';
const DS_ROOM = 'KC-6F-LT605';

export const INITIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  // =========================
  // CSE — Semester III
  // =========================
  { id: 'cse-mon-oop-lab', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '08:50', end_time: '10:30', subject_id: 's-cse-351', teacher_id: 't-shweta-kaushik', session_type: 'lab', room: 'LAB 9', group: 'G1' },
  { id: 'cse-mon-ads-lab', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '08:50', end_time: '10:30', subject_id: 's-cse-353', teacher_id: 't-shaili-gupta', session_type: 'lab', room: 'LAB 10', group: 'G2' },
  { id: 'cse-mon-logic', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '10:40', end_time: '11:30', subject_id: 's-cse-oe3xx', teacher_id: 't-neha-gaur', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-mon-ads', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '11:30', end_time: '12:20', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-mon-viz', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '12:20', end_time: '13:10', subject_id: 's-cse-va301', teacher_id: 't-pks', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-mon-oop', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '14:00', end_time: '14:50', subject_id: 's-cse-301', teacher_id: 't-shweta-kaushik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-mon-tc', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '14:50', end_time: '15:40', subject_id: 's-cse-hu302', teacher_id: 't-shruti-singh', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-mon-os', branch_id: 'b-cse', semester: 3, day_of_week: 1, start_time: '15:40', end_time: '16:30', subject_id: 's-cse-302', teacher_id: 't-komal', session_type: 'lecture', room: CSE_ROOM },

  { id: 'cse-tue-fsd1', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '08:50', end_time: '09:40', subject_id: 's-cse-va351', teacher_id: 't-satwik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-oop', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '09:40', end_time: '10:30', subject_id: 's-cse-301', teacher_id: 't-shweta-kaushik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-fsd2', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '10:40', end_time: '11:30', subject_id: 's-cse-va351', teacher_id: 't-satwik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-logic', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '11:30', end_time: '12:20', subject_id: 's-cse-oe3xx', teacher_id: 't-neha-gaur', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-ads', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '12:20', end_time: '13:10', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-os', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '14:00', end_time: '14:50', subject_id: 's-cse-302', teacher_id: 't-komal', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-viz', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '14:50', end_time: '15:40', subject_id: 's-cse-va301', teacher_id: 't-pks', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-tue-logic2', branch_id: 'b-cse', semester: 3, day_of_week: 2, start_time: '15:40', end_time: '16:30', subject_id: 's-cse-oe3xx', teacher_id: 't-neha-gaur', session_type: 'lecture', room: CSE_ROOM },

  { id: 'cse-wed-os-lab', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '08:50', end_time: '10:30', subject_id: 's-cse-352', teacher_id: 't-komal', session_type: 'lab', room: 'LAB 10', group: 'G1' },
  { id: 'cse-wed-oop-lab', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '08:50', end_time: '10:30', subject_id: 's-cse-351', teacher_id: 't-shweta-kaushik', session_type: 'lab', room: 'LAB 9', group: 'G2' },
  { id: 'cse-wed-tc', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '10:40', end_time: '11:30', subject_id: 's-cse-hu302', teacher_id: 't-shruti-singh', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-wed-ads', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '11:30', end_time: '12:20', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-wed-oop', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '12:20', end_time: '13:10', subject_id: 's-cse-301', teacher_id: 't-shweta-kaushik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-wed-va', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '14:00', end_time: '14:50', subject_id: 's-cse-va', teacher_id: 't-abriti-thakur', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-wed-ads2', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '14:50', end_time: '15:40', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-wed-logic', branch_id: 'b-cse', semester: 3, day_of_week: 3, start_time: '15:40', end_time: '16:30', subject_id: 's-cse-oe3xx', teacher_id: 't-neha-gaur', session_type: 'lecture', room: CSE_ROOM },

  { id: 'cse-thu-viz', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '08:50', end_time: '09:40', subject_id: 's-cse-va301', teacher_id: 't-pks', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-os', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '09:40', end_time: '10:30', subject_id: 's-cse-302', teacher_id: 't-komal', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-fsd', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '10:40', end_time: '11:30', subject_id: 's-cse-va351', teacher_id: 't-satwik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-ads1', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '11:30', end_time: '12:20', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-ads2', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '12:20', end_time: '13:10', subject_id: 's-cse-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-os2', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '14:00', end_time: '14:50', subject_id: 's-cse-302', teacher_id: 't-komal', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-hsi1', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '14:50', end_time: '15:40', subject_id: 's-cse-va352', teacher_id: 't-shaili-neha', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-thu-hsi2', branch_id: 'b-cse', semester: 3, day_of_week: 4, start_time: '15:40', end_time: '16:30', subject_id: 's-cse-va352', teacher_id: 't-shaili-neha', session_type: 'lecture', room: CSE_ROOM },

  { id: 'cse-fri-oop', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '08:50', end_time: '09:40', subject_id: 's-cse-301', teacher_id: 't-shweta-kaushik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-fri-tc', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '09:40', end_time: '10:30', subject_id: 's-cse-hu302', teacher_id: 't-shruti-singh', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-fri-ads-lab', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '10:40', end_time: '12:20', subject_id: 's-cse-353', teacher_id: 't-shaili-gupta', session_type: 'lab', room: 'LAB 9', group: 'G1' },
  { id: 'cse-fri-os-lab', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '10:40', end_time: '12:20', subject_id: 's-cse-352', teacher_id: 't-komal', session_type: 'lab', room: 'LAB 10', group: 'G2' },
  { id: 'cse-fri-fsd', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '12:20', end_time: '13:10', subject_id: 's-cse-va351', teacher_id: 't-satwik', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-fri-viz', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '14:00', end_time: '14:50', subject_id: 's-cse-va301', teacher_id: 't-pks', session_type: 'lecture', room: CSE_ROOM },
  { id: 'cse-fri-es', branch_id: 'b-cse', semester: 3, day_of_week: 5, start_time: '14:50', end_time: '16:30', subject_id: 's-cse-va309', teacher_id: 't-shruti-singh', session_type: 'lecture', room: CSE_ROOM },

  // =========================
  // CSE-DS — Semester III / Section III/C
  // =========================
  { id: 'ds-mon-fsd', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '08:50', end_time: '10:30', subject_id: 's-ds-va351', teacher_id: 't-shreya-dhruwajita', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-mon-oop-lab', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '10:40', end_time: '12:20', subject_id: 's-ds-351', teacher_id: 't-dilip-seema', session_type: 'lab', room: DS_ROOM },
  { id: 'ds-mon-viz-cloud', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '13:10', end_time: '14:00', subject_id: 's-ds-va301-302', teacher_id: 't-aishwarya-shahil', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-mon-ads', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '14:00', end_time: '14:50', subject_id: 's-ds-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-mon-maths', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '14:50', end_time: '15:40', subject_id: 's-ds-as301', teacher_id: 't-ashish-prakash', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-mon-os', branch_id: 'b-cse-ds', semester: 3, day_of_week: 1, start_time: '15:40', end_time: '16:30', subject_id: 's-ds-302', teacher_id: 't-neha-dv', session_type: 'lecture', room: DS_ROOM },

  { id: 'ds-tue-ads', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '08:50', end_time: '09:40', subject_id: 's-ds-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-maths', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '09:40', end_time: '10:30', subject_id: 's-ds-as301', teacher_id: 't-ashish-prakash', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-es', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '10:40', end_time: '11:30', subject_id: 's-ds-va309', teacher_id: 't-shruti-x', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-hsi', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '11:30', end_time: '12:20', subject_id: 's-ds-va352', teacher_id: 't-dilip-megha', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-fsd', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '13:10', end_time: '14:00', subject_id: 's-ds-va351', teacher_id: 't-shreya-dhruwajita', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-oop', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '14:00', end_time: '14:50', subject_id: 's-ds-301', teacher_id: 't-dilip-bharti', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-os', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '14:50', end_time: '15:40', subject_id: 's-ds-302', teacher_id: 't-neha-dv', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-tue-os2', branch_id: 'b-cse-ds', semester: 3, day_of_week: 2, start_time: '15:40', end_time: '16:30', subject_id: 's-ds-302', teacher_id: 't-neha-dv', session_type: 'lecture', room: DS_ROOM },

  { id: 'ds-wed-ads', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '08:50', end_time: '09:40', subject_id: 's-ds-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-wed-maths', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '09:40', end_time: '10:30', subject_id: 's-ds-as301', teacher_id: 't-ashish-prakash', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-wed-oop', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '10:40', end_time: '11:30', subject_id: 's-ds-301', teacher_id: 't-dilip-bharti', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-wed-hsi', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '11:30', end_time: '12:20', subject_id: 's-ds-va352', teacher_id: 't-dilip-megha', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-wed-uhv', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '13:10', end_time: '14:00', subject_id: 's-ds-hu301', teacher_id: 't-anupriya', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-wed-os-lab', branch_id: 'b-cse-ds', semester: 3, day_of_week: 3, start_time: '14:00', end_time: '16:30', subject_id: 's-ds-352', teacher_id: 't-neha-dv', session_type: 'lab', room: DS_ROOM },

  { id: 'ds-thu-viz-cloud', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '08:50', end_time: '09:40', subject_id: 's-ds-va301-302', teacher_id: 't-aishwarya-shahil', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-oop', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '09:40', end_time: '10:30', subject_id: 's-ds-301', teacher_id: 't-dilip-bharti', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-es', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '10:40', end_time: '11:30', subject_id: 's-ds-va309', teacher_id: 't-shruti-x', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-os', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '11:30', end_time: '12:20', subject_id: 's-ds-302', teacher_id: 't-neha-dv', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-uhv', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '13:10', end_time: '14:00', subject_id: 's-ds-hu301', teacher_id: 't-anupriya', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-maths', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '14:00', end_time: '14:50', subject_id: 's-ds-as301', teacher_id: 't-ashish-prakash', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-thu-ads-lab', branch_id: 'b-cse-ds', semester: 3, day_of_week: 4, start_time: '14:50', end_time: '16:30', subject_id: 's-ds-353', teacher_id: 't-ravi-megha', session_type: 'lab', room: DS_ROOM },

  { id: 'ds-fri-maths', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '08:50', end_time: '09:40', subject_id: 's-ds-as301', teacher_id: 't-ashish-prakash', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-ads', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '09:40', end_time: '10:30', subject_id: 's-ds-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-viz-cloud', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '10:40', end_time: '12:20', subject_id: 's-ds-va301-302', teacher_id: 't-aishwarya-shahil', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-oop', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '13:10', end_time: '14:00', subject_id: 's-ds-301', teacher_id: 't-dilip-bharti', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-os', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '14:00', end_time: '14:50', subject_id: 's-ds-302', teacher_id: 't-neha-dv', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-uhv', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '14:50', end_time: '15:40', subject_id: 's-ds-hu301', teacher_id: 't-anupriya', session_type: 'lecture', room: DS_ROOM },
  { id: 'ds-fri-ads2', branch_id: 'b-cse-ds', semester: 3, day_of_week: 5, start_time: '15:40', end_time: '16:30', subject_id: 's-ds-303', teacher_id: 't-shaili-gupta', session_type: 'lecture', room: DS_ROOM },
];

export const INITIAL_NOTES: Note[] = [];

