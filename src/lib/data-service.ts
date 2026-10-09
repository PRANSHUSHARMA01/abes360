import { supabase, isSupabaseConfigured } from './supabase';
import { Branch, Subject, Teacher, TimetableSlot, Note, UserPreferences, NoteReport, FeedbackItem, AuthUser } from './types';
import { INITIAL_BRANCHES, INITIAL_SUBJECTS, INITIAL_TEACHERS, INITIAL_TIMETABLE_SLOTS, INITIAL_NOTES } from './sample-data';

const CLASY_BRANCH_CODES = new Set(['CSE', 'CSE-AIML', 'CSE-DS']);

const STORAGE_KEYS = {
  BRANCHES: 'clasy_branches',
  SUBJECTS: 'clasy_subjects',
  TEACHERS: 'clasy_teachers',
  TIMETABLE: 'clasy_timetable_slots',
  NOTES: 'clasy_notes',
  PREFERENCES: 'clasy_user_preferences',
  ADMIN_PIN_HASH: 'clasy_admin_pin_hash',
  REPORTS: 'clasy_note_reports',
  FEEDBACK: 'clasy_user_feedback',
  COOKIE_ACCEPTED: 'clasy_cookie_consent',
  AUTH_USER: 'clasy_auth_user',
};

// LocalStorage Helper
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error('Error reading localStorage key', key, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error setting localStorage key', key, err);
  }
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const DataService = {
  // BRANCHES
  async getBranches(): Promise<Branch[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('branches').select('*').order('name');
      if (!error && data && data.length > 0) {
        return (data as Branch[]).filter((branch: Branch) => CLASY_BRANCH_CODES.has(branch.code));
      }
    }
    return getLocalItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES).filter((branch) => CLASY_BRANCH_CODES.has(branch.code));
  },

  // SUBJECTS
  async getSubjects(branchId?: string, semester?: number): Promise<Subject[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('subjects').select('*');
      if (branchId) query = query.eq('branch_id', branchId);
      if (semester) query = query.eq('semester', semester);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    }
    let subjects = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    if (!subjects.some((s) => s.code === '25HU301' || s.code === '25AS301') || subjects.length < INITIAL_SUBJECTS.length) {
      subjects = INITIAL_SUBJECTS;
      setLocalItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    }
    if (branchId) subjects = subjects.filter((s) => s.branch_id === branchId);
    if (semester) subjects = subjects.filter((s) => s.semester === semester);
    return subjects;
  },

  // TEACHERS
  async getTeachers(): Promise<Teacher[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('teachers').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    }
    const teachers = getLocalItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    const hasClasyTeachers = teachers.some((teacher) => teacher.id === 't-shweta-kaushik' || teacher.id === 't-dilip-bharti');
    if (!hasClasyTeachers) {
      setLocalItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
      return INITIAL_TEACHERS;
    }
    return teachers;
  },

  // TIMETABLE SLOTS
  async getTimetableSlots(branchId: string, semester: number): Promise<TimetableSlot[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          subject:subjects(*),
          teacher:teachers(*),
          branch:branches(*)
        `)
        .eq('branch_id', branchId)
        .eq('semester', semester);

      if (!error && data && data.length > 0) return data;
    }

    let allSlots = getLocalItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE_SLOTS);
    let subjects = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    let teachers = getLocalItem<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    let branches = getLocalItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);

    if (!allSlots.some((slot) => slot.semester === 3 && (slot.branch_id === 'b-cse' || slot.branch_id === 'b-cse-ds'))) {
      allSlots = INITIAL_TIMETABLE_SLOTS;
      setLocalItem(STORAGE_KEYS.TIMETABLE, allSlots);
    }
    if (!subjects.some((subject) => subject.semester === 3 && subject.code === '25CS303')) {
      subjects = INITIAL_SUBJECTS;
      setLocalItem(STORAGE_KEYS.SUBJECTS, subjects);
    }
    if (!teachers.some((teacher) => teacher.id === 't-shweta-kaushik')) {
      teachers = INITIAL_TEACHERS;
      setLocalItem(STORAGE_KEYS.TEACHERS, teachers);
    }
    if (!branches.some((branch) => branch.code === 'CSE-DS')) {
      branches = INITIAL_BRANCHES;
      setLocalItem(STORAGE_KEYS.BRANCHES, branches);
    }

    return allSlots
      .filter((slot) => slot.branch_id === branchId && slot.semester === semester)
      .map((slot) => ({
        ...slot,
        subject: subjects.find((s) => s.id === slot.subject_id),
        teacher: teachers.find((t) => t.id === slot.teacher_id),
        branch: branches.find((b) => b.id === slot.branch_id),
      }));
  },

  async addTimetableSlot(slotData: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: generateUUID(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('timetable_slots')
        .insert([newSlot])
        .select()
        .single();
      if (!error && data) return data;
    }

    const currentSlots = getLocalItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE_SLOTS);
    const updated = [...currentSlots, newSlot];
    setLocalItem(STORAGE_KEYS.TIMETABLE, updated);
    return newSlot;
  },

  async updateTimetableSlot(id: string, updates: Partial<TimetableSlot>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('timetable_slots').update(updates).eq('id', id);
    }
    const currentSlots = getLocalItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE_SLOTS);
    const updated = currentSlots.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setLocalItem(STORAGE_KEYS.TIMETABLE, updated);
  },

  async deleteTimetableSlot(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('timetable_slots').delete().eq('id', id);
    }
    const currentSlots = getLocalItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE_SLOTS);
    const updated = currentSlots.filter((s) => s.id !== id);
    setLocalItem(STORAGE_KEYS.TIMETABLE, updated);
  },

  // NOTES
  async getNotes(branchId?: string, semester?: number, subjectId?: string): Promise<Note[]> {
    let cloudNotes: Note[] = [];
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('notes').select('*').order('created_at', { ascending: false });

        if (branchId) query = query.eq('branch_id', branchId);
        if (semester) query = query.eq('semester', semester);
        if (subjectId) query = query.eq('subject_id', subjectId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          cloudNotes = data;
        }
      } catch (err) {
        console.warn('Supabase getNotes exception:', err);
      }
    }

    let localNotes = getLocalItem<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    // Purge any legacy placeholder notes with empty file_path from local storage
    if (localNotes.some((n) => !n.file_path || n.file_path.trim() === '')) {
      localNotes = localNotes.filter((n) => Boolean(n.file_path && n.file_path.trim().length > 0));
      setLocalItem(STORAGE_KEYS.NOTES, localNotes);
    }

    const subjects = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    const branches = getLocalItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);

    // Merge notes by ID with cloud notes taking precedence
    const noteMap = new Map<string, Note>();
    localNotes.forEach((n) => {
      if (n.file_path && n.file_path.trim().length > 0) noteMap.set(n.id, n);
    });
    cloudNotes.forEach((n) => {
      if (n.file_path && n.file_path.trim().length > 0) noteMap.set(n.id, n);
    });

    let allNotes = Array.from(noteMap.values());
    if (branchId) allNotes = allNotes.filter((n) => n.branch_id === branchId);
    if (semester) allNotes = allNotes.filter((n) => n.semester === semester);
    if (subjectId) allNotes = allNotes.filter((n) => n.subject_id === subjectId);

    return allNotes.map((note) => {
      const isPractice = Boolean(
        note.is_practice || 
        note.unit === 0 || 
        (note.description && note.description.includes('[PRACTICE]')) ||
        (note.title && note.title.toLowerCase().includes('[practice]'))
      );
      return {
        ...note,
        is_practice: isPractice,
        subject: note.subject || subjects.find((s) => s.id === note.subject_id),
        branch: note.branch || branches.find((b) => b.id === note.branch_id),
      };
    });
  },

  async addNote(noteData: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    const isPracticeNote = Boolean(
      noteData.is_practice || 
      noteData.unit === 0 || 
      noteData.description?.includes('[PRACTICE]')
    );

    const safeDescription = isPracticeNote 
      ? (noteData.description?.includes('[PRACTICE]') ? noteData.description : `[PRACTICE] ${noteData.description || ''}`)
      : (noteData.description || '');

    const newNote: Note = {
      ...noteData,
      id: generateUUID(),
      unit: isPracticeNote ? 0 : (noteData.unit !== undefined ? noteData.unit : 1),
      description: safeDescription,
      is_practice: isPracticeNote,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        // Supabase check constraint requires unit to be between 1 and 5
        const supabaseUnit = (noteData.unit && noteData.unit >= 1 && noteData.unit <= 5) ? noteData.unit : 1;
        const { data: supaData, error } = await supabase.from('notes').insert([{
          id: newNote.id,
          branch_id: newNote.branch_id,
          subject_id: newNote.subject_id,
          semester: newNote.semester,
          unit: supabaseUnit,
          title: newNote.title,
          file_path: newNote.file_path || '',
          description: safeDescription,
          created_at: newNote.created_at,
        }]).select().single();

        if (error) {
          console.warn('Supabase insert note notice:', error.message);
        } else if (supaData?.id) {
          newNote.id = supaData.id;
        }
      } catch (err) {
        console.warn('Supabase note insert exception:', err);
      }
    }

    const currentNotes = getLocalItem<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const filtered = currentNotes.filter((n) => {
      if (n.subject_id === newNote.subject_id && n.unit === newNote.unit && !n.file_path) {
        return false;
      }
      return n.id !== newNote.id;
    });

    const updated = [newNote, ...filtered];
    setLocalItem(STORAGE_KEYS.NOTES, updated);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return newNote;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const updatePayload: Record<string, any> = {};
        if (updates.title !== undefined) updatePayload.title = updates.title;
        if (updates.subject_id !== undefined) updatePayload.subject_id = updates.subject_id;
        if (updates.branch_id !== undefined) updatePayload.branch_id = updates.branch_id;
        if (updates.semester !== undefined) updatePayload.semester = updates.semester;
        if (updates.file_path !== undefined) updatePayload.file_path = updates.file_path;
        if (updates.description !== undefined) updatePayload.description = updates.description;
        
        if (updates.unit !== undefined || updates.is_practice !== undefined) {
          const isPractice = updates.is_practice || updates.unit === 0;
          updatePayload.unit = isPractice ? 1 : (updates.unit && updates.unit >= 1 && updates.unit <= 5 ? updates.unit : 1);
          if (isPractice) {
            updatePayload.description = updatePayload.description 
              ? (updatePayload.description.includes('[PRACTICE]') ? updatePayload.description : `[PRACTICE] ${updatePayload.description}`)
              : '[PRACTICE] Practice questions / PYQ';
          }
        }

        await supabase.from('notes').update(updatePayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateNote error:', err);
      }
    }

    const currentNotes = getLocalItem<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const updated = currentNotes.map((n) => {
      if (n.id === id) {
        const isPractice = updates.is_practice !== undefined 
          ? updates.is_practice 
          : (updates.unit === 0 ? true : n.is_practice);
        return {
          ...n,
          ...updates,
          is_practice: isPractice,
        };
      }
      return n;
    });
    setLocalItem(STORAGE_KEYS.NOTES, updated);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
  },

  async deleteNote(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('notes').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase note delete error:', err);
      }
    }
    const currentNotes = getLocalItem<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const updated = currentNotes.filter((n) => n.id !== id);
    setLocalItem(STORAGE_KEYS.NOTES, updated);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
  },

  // PREFERENCES
  getUserPreferences(): UserPreferences | null {
    const prefs = getLocalItem<UserPreferences | null>(STORAGE_KEYS.PREFERENCES, null);
    if (!prefs) return null;
    // The ABES timetable supplied for Clasy is Semester III; migrate any earlier default Semester IV selection.
    if ((prefs.branch_id === 'b-cse' || prefs.branch_id === 'b-cse-ds') && prefs.semester === 4) {
      const migrated = { ...prefs, semester: 3 };
      setLocalItem(STORAGE_KEYS.PREFERENCES, migrated);
      return migrated;
    }
    return prefs;
  },

  setUserPreferences(prefs: UserPreferences): void {
    setLocalItem(STORAGE_KEYS.PREFERENCES, prefs);
  },

  // REPORTS
  async submitReport(reportData: Omit<NoteReport, 'id' | 'created_at' | 'status'>): Promise<NoteReport> {
    const newReport: NoteReport = {
      ...reportData,
      id: 'report-' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('note_reports').insert([newReport]);
      } catch (e) {
        console.error('Supabase report insert error', e);
      }
    }

    const currentReports = getLocalItem<NoteReport[]>(STORAGE_KEYS.REPORTS, []);
    setLocalItem(STORAGE_KEYS.REPORTS, [newReport, ...currentReports]);
    return newReport;
  },

  async getReports(): Promise<NoteReport[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('note_reports').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalItem<NoteReport[]>(STORAGE_KEYS.REPORTS, []);
  },

  // FEEDBACK
  async submitFeedback(feedbackData: Omit<FeedbackItem, 'id' | 'created_at'>): Promise<FeedbackItem> {
    const newFeedback: FeedbackItem = {
      ...feedbackData,
      id: 'fb-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('user_feedback').insert([newFeedback]);
      } catch (e) {
        console.error('Supabase feedback insert error', e);
      }
    }

    const currentFeedback = getLocalItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, []);
    setLocalItem(STORAGE_KEYS.FEEDBACK, [newFeedback, ...currentFeedback]);
    return newFeedback;
  },

  // COOKIE CONSENT
  getCookieConsent(): boolean {
    return getLocalItem<boolean>(STORAGE_KEYS.COOKIE_ACCEPTED, false);
  },

  setCookieConsent(accepted: boolean): void {
    setLocalItem(STORAGE_KEYS.COOKIE_ACCEPTED, accepted);
  },

  // USER DATA EXPORT & DELETION
  exportUserData(): string {
    const preferences = this.getUserPreferences();
    const reports = getLocalItem<NoteReport[]>(STORAGE_KEYS.REPORTS, []);
    const feedback = getLocalItem<FeedbackItem[]>(STORAGE_KEYS.FEEDBACK, []);
    
    const exportPayload = {
      app: 'Clasy ABES Timetable & Notes',
      exportedAt: new Date().toISOString(),
      preferences,
      reportsSubmitted: reports,
      feedbackSubmitted: feedback,
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  clearUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_ACCEPTED);
  },

  // GOOGLE & PERSISTENT AUTH
  async signInWithGoogle(customEmail?: string, customName?: string): Promise<{ error?: string }> {
    if (customEmail) {
      const email = customEmail;
      const name = customName || (email.split('@')[0].replace(/[._-]/g, ' ')) || 'Student User';
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const googleUser: AuthUser = {
        id: 'usr-' + Date.now(),
        name: formattedName,
        email: email,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
        provider: 'google',
        created_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.AUTH_USER, googleUser);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
      return {};
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          },
        });
        if (!error) return {};
        console.warn('OAuth redirect issue, falling back:', error.message);
      } catch (err) {
        console.warn('OAuth redirect exception:', err);
      }
    }

    // Fallback persistent Google user session
    const mockUser: AuthUser = {
      id: 'usr-' + Date.now(),
      name: 'Google Student',
      email: 'student@gmail.com',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=student_abes`,
      provider: 'google',
      created_at: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.AUTH_USER, mockUser);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    return {};
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Student',
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.email || 'S'}`,
          provider: 'google',
          created_at: data.user.created_at,
        };
      }
    }
    return getLocalItem<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          callback({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Student',
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email || 'S'}`,
            provider: 'google',
            created_at: session.user.created_at,
          });
        } else {
          callback(null);
        }
      });
      return () => subscription.unsubscribe();
    }
    this.getCurrentUser().then(callback);
    return () => {};
  },

  // REALTIME SUBSCRIPTION
  subscribeToTimetable(branchId: string, semester: number, callback: () => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('timetable_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timetable_slots' },
        () => callback()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
