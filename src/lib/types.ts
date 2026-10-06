export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  semester: number;
}

export interface Teacher {
  id: string;
  name: string;
  email?: string;
}

export type SessionType = 'lecture' | 'lab' | 'tutorial';

export interface TimetableSlot {
  id: string;
  branch_id: string;
  semester: number;
  day_of_week: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  start_time: string; // HH:mm format
  end_time: string;   // HH:mm format
  subject_id: string;
  teacher_id?: string;
  session_type: SessionType;
  room?: string;
  subject?: Subject;
  teacher?: Teacher;
  branch?: Branch;
  group?: string;
}

export interface Note {
  id: string;
  branch_id: string;
  subject_id: string;
  semester: number;
  unit?: number; // 1 to 5
  title: string;
  file_path: string;
  description?: string;
  content?: string;
  uploaded_by?: string;
  created_at: string;
  subject?: Subject;
  branch?: Branch;
}

export interface UserPreferences {
  branch_id: string;
  semester: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
}

export interface AdminProfile {
  id: string;
  is_admin: boolean;
}

export interface RealtimeClassStatus {
  currentSlot: TimetableSlot | null;
  currentSlots: TimetableSlot[];
  nextSlot: TimetableSlot | null;
  timeRemainingMinutes: number;
  durationMinutes: number;
  elapsedMinutes: number;
  percentageComplete: number;
  status: 'ongoing' | 'upcoming' | 'free_day' | 'day_ended';
}

export interface NoteReport {
  id: string;
  note_id: string;
  note_title?: string;
  reason: 'incorrect_content' | 'copyright_violation' | 'poor_quality' | 'wrong_subject' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  type: 'bug' | 'idea' | 'improvement' | 'other';
  message: string;
  contact_email?: string;
  created_at: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  badge?: string;
  changes: string[];
}

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type ExamTarget = 'mid_term_1' | 'mid_term_2' | 'end_term' | 'all';
export type SubjectCategory = 'theory' | 'lab' | 'workshop' | 'skill' | 'innovation';
export type ElectiveTrack = 'AI' | 'Cloud' | 'VLSI' | 'EV' | 'Industrial Automation' | 'Digital Automotive' | 'Humanities' | 'Math' | 'Core';

export interface SyllabusUnit {
  unitNumber: number;
  unitName: string;
  topics: string[];
}

export interface PracticalModule {
  moduleNumber: number;
  title: string;
  tasks: string[];
}

export interface SkillCategory {
  categoryName: string;
  tasks: string[];
}

export interface SyllabusSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: 3 | 4;
  category: SubjectCategory;
  electiveTrack?: ElectiveTrack;
  isElective?: boolean;
  alternativeTo?: string;
  isLab?: boolean;
  units?: SyllabusUnit[];
  experiments?: string[];
  vivaTopics?: string[];
  modules?: PracticalModule[];
  skillCategories?: SkillCategory[];
  notesNotice?: string;
}

export interface TopicProgressRecord {
  [topicKey: string]: {
    status: TopicStatus;
    priority?: PriorityLevel;
    examTarget?: ExamTarget;
    notes?: string;
    updatedAt: string;
  };
}

export interface StudySession {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  semester: number;
  unit?: number;
  unit_name?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  duration_minutes: number;
  priority: PriorityLevel;
  exam_target: ExamTarget;
  completed: boolean;
  created_at: string;
}

