'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ABES_SYLLABUS } from '@/lib/syllabus-data';
import { 
  SyllabusSubject, 
  TopicStatus, 
  PriorityLevel, 
  ExamTarget, 
  StudySession, 
  SubjectCategory, 
  ElectiveTrack 
} from '@/lib/types';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Plus, 
  Sparkles, 
  FlaskConical, 
  GraduationCap,
  CalendarDays,
  Trash2,
  Check,
  Hammer,
  Award,
  Lightbulb,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const [semester, setSemester] = useState<3 | 4>(3);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SubjectCategory | 'schedule'>('theory');

  // Elective track selections
  const [selectedTechTrack, setSelectedTechTrack] = useState<ElectiveTrack>('AI');
  const [selectedHumanities, setSelectedHumanities] = useState<'UHV' | 'TC'>('UHV');

  // Topic & Task progress map: key = `${subjectId}_itemKey`
  const [itemProgress, setItemProgress] = useState<Record<string, TopicStatus>>({});
  const [itemPriority, setItemPriority] = useState<Record<string, PriorityLevel>>({});
  const [itemExam, setItemExam] = useState<Record<string, ExamTarget>>({});

  // Study Sessions (Schedule)
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [scheduleDate, setScheduleDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [scheduleView, setScheduleView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // New Session Modal Form
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [sessionSubjectId, setSessionSubjectId] = useState('');
  const [sessionUnit, setSessionUnit] = useState(1);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionStartTime, setSessionStartTime] = useState('18:00');
  const [sessionEndTime, setSessionEndTime] = useState('19:30');
  const [sessionPriority, setSessionPriority] = useState<PriorityLevel>('high');
  const [sessionExamTarget, setSessionExamTarget] = useState<ExamTarget>('mid_term_1');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('clasy_item_progress') || localStorage.getItem('clasy_topic_progress');
      if (savedProgress) setItemProgress(JSON.parse(savedProgress));

      const savedPriority = localStorage.getItem('clasy_item_priority') || localStorage.getItem('clasy_topic_priority');
      if (savedPriority) setItemPriority(JSON.parse(savedPriority));

      const savedExam = localStorage.getItem('clasy_item_exam') || localStorage.getItem('clasy_topic_exam');
      if (savedExam) setItemExam(JSON.parse(savedExam));

      const savedSessions = localStorage.getItem('clasy_study_sessions');
      if (savedSessions) setSessions(JSON.parse(savedSessions));

      const savedTrack = localStorage.getItem('clasy_elective_track');
      if (savedTrack) setSelectedTechTrack(savedTrack as ElectiveTrack);

      const savedHum = localStorage.getItem('clasy_elective_hum');
      if (savedHum) setSelectedHumanities(savedHum as any);
    } catch {
      // ignore
    }
  }, []);

  const saveProgress = (key: string, status: TopicStatus) => {
    const updated = { ...itemProgress, [key]: status };
    setItemProgress(updated);
    localStorage.setItem('clasy_item_progress', JSON.stringify(updated));
  };

  const savePriority = (key: string, p: PriorityLevel) => {
    const updated = { ...itemPriority, [key]: p };
    setItemPriority(updated);
    localStorage.setItem('clasy_item_priority', JSON.stringify(updated));
  };

  const saveExam = (key: string, ex: ExamTarget) => {
    const updated = { ...itemExam, [key]: ex };
    setItemExam(updated);
    localStorage.setItem('clasy_item_exam', JSON.stringify(updated));
  };

  const handleTechTrackChange = (track: ElectiveTrack) => {
    setSelectedTechTrack(track);
    localStorage.setItem('clasy_elective_track', track);
  };

  const handleHumanitiesChange = (val: 'UHV' | 'TC') => {
    setSelectedHumanities(val);
    localStorage.setItem('clasy_elective_hum', val);
  };

  // Filter subjects for semester based on elective choices
  const currentSemesterSubjects = useMemo(() => {
    return ABES_SYLLABUS.filter((s) => s.semester === semester);
  }, [semester]);

  // Active list by category
  const filteredCategorySubjects = useMemo(() => {
    if (activeCategory === 'schedule') return [];
    return currentSemesterSubjects.filter((s) => s.category === activeCategory);
  }, [currentSemesterSubjects, activeCategory]);

  // Set default selected subject when category or semester changes
  useEffect(() => {
    if (filteredCategorySubjects.length > 0) {
      if (!filteredCategorySubjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(filteredCategorySubjects[0].id);
        setSessionSubjectId(filteredCategorySubjects[0].id);
      }
    }
  }, [filteredCategorySubjects, selectedSubjectId]);

  const currentSubject = useMemo(() => {
    return ABES_SYLLABUS.find((s) => s.id === selectedSubjectId) || filteredCategorySubjects[0];
  }, [selectedSubjectId, filteredCategorySubjects]);

  // Helper to calculate progress of any subject
  const getSubjectProgress = useCallback((subject: SyllabusSubject) => {
    let total = 0;
    let done = 0;

    if (subject.units && subject.units.length > 0) {
      subject.units.forEach((u) => {
        u.topics.forEach((t) => {
          total++;
          if (itemProgress[`${subject.id}_u${u.unitNumber}_${t}`] === 'completed') done++;
        });
      });
    } else if (subject.experiments && subject.experiments.length > 0) {
      subject.experiments.forEach((exp, i) => {
        total++;
        if (itemProgress[`${subject.id}_exp_${i}`] === 'completed') done++;
      });
    } else if (subject.modules && subject.modules.length > 0) {
      subject.modules.forEach((mod) => {
        mod.tasks.forEach((tsk, i) => {
          total++;
          if (itemProgress[`${subject.id}_mod_${mod.moduleNumber}_task_${i}`] === 'completed') done++;
        });
      });
    } else if (subject.skillCategories && subject.skillCategories.length > 0) {
      subject.skillCategories.forEach((cat) => {
        cat.tasks.forEach((tsk, i) => {
          total++;
          if (itemProgress[`${subject.id}_cat_${cat.categoryName}_${i}`] === 'completed') done++;
        });
      });
    }

    return {
      total,
      done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [itemProgress]);

  // Category & Overall Statistics Calculation
  const categoryStats = useMemo(() => {
    const calcCategory = (cat: SubjectCategory) => {
      const subs = currentSemesterSubjects.filter((s) => s.category === cat);
      let total = 0;
      let done = 0;
      subs.forEach((s) => {
        const p = getSubjectProgress(s);
        total += p.total;
        done += p.done;
      });
      return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
    };

    const theory = calcCategory('theory');
    const lab = calcCategory('lab');
    const workshop = calcCategory('workshop');
    const skill = calcCategory('skill');
    const innovation = calcCategory('innovation');

    const grandTotal = theory.total + lab.total + workshop.total + skill.total + innovation.total;
    const grandDone = theory.done + lab.done + workshop.done + skill.done + innovation.done;
    const overallPercent = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;

    const totalStudyMinutes = sessions.reduce((acc, s) => acc + (s.completed ? s.duration_minutes : 0), 0);

    return {
      theory,
      lab,
      workshop,
      skill,
      innovation,
      overallPercent,
      grandTotal,
      grandDone,
      grandPending: grandTotal - grandDone,
      studyHours: (totalStudyMinutes / 60).toFixed(1),
    };
  }, [currentSemesterSubjects, getSubjectProgress, sessions]);

  // Create Study Session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim() || !sessionSubjectId) return;

    const [startH, startM] = sessionStartTime.split(':').map(Number);
    const [endH, endM] = sessionEndTime.split(':').map(Number);
    const duration = Math.max(15, (endH * 60 + endM) - (startH * 60 + startM));

    const sub = ABES_SYLLABUS.find((s) => s.id === sessionSubjectId);
    const unitObj = sub?.units?.find((u) => u.unitNumber === sessionUnit);

    const newSession: StudySession = {
      id: 'sess-' + Date.now(),
      subject_id: sessionSubjectId,
      subject_name: sub?.name || 'Subject',
      subject_code: sub?.code || 'CSE',
      semester,
      unit: sessionUnit,
      unit_name: unitObj?.unitName,
      topic: sessionTopic.trim(),
      date: sessionDate,
      start_time: sessionStartTime,
      end_time: sessionEndTime,
      duration_minutes: duration,
      priority: sessionPriority,
      exam_target: sessionExamTarget,
      completed: false,
      created_at: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('clasy_study_sessions', JSON.stringify(updated));
    setSessionTopic('');
    setNewSessionModalOpen(false);
  };

  const toggleSessionCompleted = (sessionId: string) => {
    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, completed: !s.completed } : s));
    setSessions(updated);
    localStorage.setItem('clasy_study_sessions', JSON.stringify(updated));
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('clasy_study_sessions', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      {/* Top Academic Banner */}
      <div className="rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <GraduationCap className="h-4 w-4" /> ABES Engineering College · 2nd Year (2026–27)
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Study Planner &amp; Academic Database</h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Complete official scheme: 5-unit theory syllabi, lab experiments, practical workshops, and employability skill tracks.
            </p>
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2 rounded-2xl bg-black/30 p-1.5 backdrop-blur-md self-start sm:self-auto border border-white/10">
            <button
              onClick={() => setSemester(3)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                semester === 3 ? 'bg-white text-blue-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Semester III
            </button>
            <button
              onClick={() => setSemester(4)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                semester === 4 ? 'bg-white text-blue-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Semester IV
            </button>
          </div>
        </div>

        {/* Real-time Category Progress Dashboard Bar */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-white/15 pt-6">
          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Overall Semester</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold">{categoryStats.overallPercent}%</span>
              <span className="text-[10px] text-blue-200">done</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${categoryStats.overallPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Theory (5-Unit)</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-blue-200">{categoryStats.theory.percent}%</span>
              <span className="text-[10px] text-blue-200">{categoryStats.theory.done}/{categoryStats.theory.total}</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200">Topics Mastered</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Labs &amp; Practicals</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-purple-200">{categoryStats.lab.percent}%</span>
              <span className="text-[10px] text-blue-200">{categoryStats.lab.done}/{categoryStats.lab.total}</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200">Experiments Performed</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">FSD Workshops</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-300">{categoryStats.workshop.percent}%</span>
              <span className="text-[10px] text-blue-200">{categoryStats.workshop.done}/{categoryStats.workshop.total}</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200">Tasks Completed</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Skills &amp; Innovation</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-300">
                {Math.round((categoryStats.skill.percent + categoryStats.innovation.percent) / 2)}%
              </span>
              <span className="text-[10px] text-blue-200">{categoryStats.studyHours}h logged</span>
            </div>
            <p className="mt-1 text-[10px] text-blue-200">Aptitude &amp; Industry</p>
          </div>
        </div>
      </div>

      {/* Elective Track Configuration Card */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">Emerging Technology &amp; Humanities Elective Options</h3>
              <p className="text-[11px] text-zinc-500">Configure your chosen track for Semester {semester}.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Professional Elective Track */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Professional Elective Track
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { track: 'AI', label: 'AI (Data Vis / AI)' },
                { track: 'Cloud', label: 'Cloud Computing' },
                { track: 'VLSI', label: 'VLSI / SPICE' },
                { track: 'EV', label: 'Electric Mobility' },
                { track: 'Industrial Automation', label: 'Automation / PLC' },
                { track: 'Digital Automotive', label: 'Digital Automotive' },
              ].map((t) => (
                <button
                  key={t.track}
                  onClick={() => handleTechTrackChange(t.track as ElectiveTrack)}
                  className={`rounded-xl border p-2 text-left text-[11px] font-semibold transition ${
                    selectedTechTrack === t.track
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Humanities Track */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Humanities Elective Choice
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleHumanitiesChange('UHV')}
                className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                  selectedHumanities === 'UHV'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="font-bold">25HU301 / 25HU401</div>
                <div className="text-[10px] text-zinc-500">Universal Human Values</div>
              </button>
              <button
                onClick={() => handleHumanitiesChange('TC')}
                className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                  selectedHumanities === 'TC'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="font-bold">25HU302 / 25HU402</div>
                <div className="text-[10px] text-zinc-500">Technical Communication</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('theory')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'theory'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Theory Subjects
          </button>
          <button
            onClick={() => setActiveCategory('lab')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'lab'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <FlaskConical className="h-4 w-4" /> Practical Labs
          </button>
          <button
            onClick={() => setActiveCategory('workshop')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'workshop'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <Hammer className="h-4 w-4" /> FSD Workshops
          </button>
          <button
            onClick={() => setActiveCategory('skill')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'skill'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <Award className="h-4 w-4" /> Employability Skills
          </button>
          <button
            onClick={() => setActiveCategory('innovation')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'innovation'
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <Lightbulb className="h-4 w-4" /> Holistic Skill &amp; Innovation
          </button>
          <button
            onClick={() => setActiveCategory('schedule')}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === 'schedule'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <Calendar className="h-4 w-4" /> Study Timetable ({sessions.length})
          </button>
        </div>

        {activeCategory === 'schedule' && (
          <button
            onClick={() => setNewSessionModalOpen(true)}
            className="apple-primary-button text-xs py-2 px-3.5"
          >
            <Plus className="h-4 w-4" /> Schedule Study Session
          </button>
        )}
      </div>

      {/* ========================================================== */}
      {/* 1. THEORY 5-UNIT SYLLABUS TRACKER */}
      {/* ========================================================== */}
      {activeCategory === 'theory' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              Semester {semester} Theory Subjects
            </h3>
            <div className="space-y-2">
              {filteredCategorySubjects.map((sub) => {
                const isSelected = sub.id === currentSubject?.id;
                const p = getSubjectProgress(sub);
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`flex w-full flex-col rounded-2xl border p-3.5 text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                        : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">
                        {sub.code}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600">{p.percent}%</span>
                    </div>
                    <h4 className="mt-1.5 text-xs font-bold text-zinc-900 leading-snug">{sub.name}</h4>
                    <div className="mt-2.5 h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${p.percent}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            {currentSubject && (
              <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 border-b border-zinc-100 pb-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                      {currentSubject.code}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">Credits: {currentSubject.credits}</span>
                    {currentSubject.electiveTrack && (
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                        Track: {currentSubject.electiveTrack}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">{currentSubject.name}</h2>
                </div>

                {/* If units are not available (e.g. 25HU302 or electives without extracted topics), show official notice */}
                {!currentSubject.units || currentSubject.units.length === 0 ? (
                  <div className="my-8 rounded-2xl bg-amber-50/70 p-6 border border-amber-200/80 text-center">
                    <Info className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-amber-900">Detailed unit-wise syllabus notice</h4>
                    <p className="mt-1 text-xs text-amber-800 max-w-md mx-auto">
                      {currentSubject.notesNotice || 'Detailed unit-wise syllabus not provided in the available booklet.'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {currentSubject.units.map((unit) => {
                      const unitDone = unit.topics.filter(
                        (t) => itemProgress[`${currentSubject.id}_u${unit.unitNumber}_${t}`] === 'completed'
                      ).length;
                      const unitPercent = Math.round((unitDone / unit.topics.length) * 100);

                      return (
                        <div key={unit.unitNumber} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-5">
                          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
                                U{unit.unitNumber}
                              </span>
                              <h3 className="text-sm font-bold text-zinc-900">
                                Unit {unit.unitNumber} – {unit.unitName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-600">{unitPercent}%</span>
                              <div className="h-2 w-16 rounded-full bg-zinc-200 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${unitPercent}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {unit.topics.map((topic) => {
                              const key = `${currentSubject.id}_u${unit.unitNumber}_${topic}`;
                              const status = itemProgress[key] || 'not_started';
                              const priority = itemPriority[key] || 'medium';
                              const examTarget = itemExam[key] || 'all';

                              return (
                                <div
                                  key={topic}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition ${
                                    status === 'completed'
                                      ? 'border-emerald-200 bg-emerald-50/40 text-zinc-800'
                                      : status === 'in_progress'
                                      ? 'border-amber-200 bg-amber-50/40 text-zinc-900'
                                      : 'border-zinc-200/80 bg-white text-zinc-700'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextStatus: TopicStatus =
                                          status === 'not_started'
                                            ? 'in_progress'
                                            : status === 'in_progress'
                                            ? 'completed'
                                            : 'not_started';
                                        saveProgress(key, nextStatus);
                                      }}
                                      className="mt-0.5 shrink-0"
                                      title="Toggle topic status"
                                    >
                                      {status === 'completed' ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                      ) : status === 'in_progress' ? (
                                        <div className="h-4 w-4 rounded-full border-2 border-amber-500 bg-amber-500" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-zinc-300 hover:text-zinc-500" />
                                      )}
                                    </button>
                                    <p className={`text-xs font-semibold leading-snug ${status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-900'}`}>
                                      {topic}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <select
                                      value={priority}
                                      onChange={(e) => savePriority(key, e.target.value as PriorityLevel)}
                                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-bold text-zinc-700"
                                    >
                                      <option value="high">High</option>
                                      <option value="medium">Med</option>
                                      <option value="low">Low</option>
                                    </select>

                                    <select
                                      value={examTarget}
                                      onChange={(e) => saveExam(key, e.target.value as ExamTarget)}
                                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-bold text-blue-700"
                                    >
                                      <option value="all">General</option>
                                      <option value="mid_term_1">Mid Term I</option>
                                      <option value="mid_term_2">Mid Term II</option>
                                      <option value="end_term">End Term</option>
                                    </select>

                                    <button
                                      onClick={() => {
                                        setSessionSubjectId(currentSubject.id);
                                        setSessionUnit(unit.unitNumber);
                                        setSessionTopic(topic);
                                        setNewSessionModalOpen(true);
                                      }}
                                      className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition"
                                    >
                                      + Schedule
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. PRACTICAL LABS */}
      {/* ========================================================== */}
      {activeCategory === 'lab' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredCategorySubjects.map((lab) => {
            const p = getSubjectProgress(lab);
            return (
              <div key={lab.id} className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-950">{lab.name}</h3>
                      <p className="text-xs text-zinc-400">{lab.code} · Credits: {lab.credits}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    {p.percent}% ({p.done}/{p.total})
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                      Official Experiment List ({lab.experiments?.length || 0})
                    </h4>
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {lab.experiments?.map((exp, i) => {
                        const expKey = `${lab.id}_exp_${i}`;
                        const isDone = itemProgress[expKey] === 'completed';
                        return (
                          <li
                            key={i}
                            onClick={() => saveProgress(expKey, isDone ? 'not_started' : 'completed')}
                            className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                              isDone
                                ? 'border-emerald-200 bg-emerald-50/50 line-through text-zinc-500'
                                : 'border-zinc-200 bg-zinc-50/60 text-zinc-800 hover:bg-zinc-100'
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${isDone ? 'text-emerald-600' : 'text-zinc-300'}`} />
                            <span>{exp}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {lab.vivaTopics && (
                    <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                        💡 Viva Preparation Questions
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {lab.vivaTopics.map((v, i) => (
                          <span key={i} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-purple-800 shadow-sm border border-purple-200/60">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. FSD WORKSHOPS */}
      {/* ========================================================== */}
      {activeCategory === 'workshop' && (
        <div className="space-y-6">
          {filteredCategorySubjects.map((ws) => {
            const p = getSubjectProgress(ws);
            return (
              <div key={ws.id} className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Hammer className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-950">{ws.name}</h3>
                      <p className="text-xs text-zinc-400">{ws.code} · Node.js, Express, MongoDB, Docker &amp; Cloud</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {p.percent}% Completed
                  </span>
                </div>

                {ws.modules ? (
                  <div className="mt-6 space-y-4">
                    {ws.modules.map((mod) => (
                      <div key={mod.moduleNumber} className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Module {mod.moduleNumber}: {mod.title}
                        </h4>
                        <ul className="mt-2.5 space-y-1.5">
                          {mod.tasks.map((tsk, i) => {
                            const key = `${ws.id}_mod_${mod.moduleNumber}_task_${i}`;
                            const isDone = itemProgress[key] === 'completed';
                            return (
                              <li
                                key={i}
                                onClick={() => saveProgress(key, isDone ? 'not_started' : 'completed')}
                                className={`flex items-center gap-2 rounded-xl p-2 text-xs cursor-pointer transition ${
                                  isDone ? 'bg-emerald-50 line-through text-zinc-500' : 'bg-white border border-zinc-200 text-zinc-800'
                                }`}
                              >
                                <CheckCircle2 className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-600' : 'text-zinc-300'}`} />
                                <span>{tsk}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 space-y-2">
                    {ws.experiments?.map((exp, i) => {
                      const expKey = `${ws.id}_exp_${i}`;
                      const isDone = itemProgress[expKey] === 'completed';
                      return (
                        <div
                          key={i}
                          onClick={() => saveProgress(expKey, isDone ? 'not_started' : 'completed')}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition ${
                            isDone ? 'border-emerald-200 bg-emerald-50/50 line-through text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-800'
                          }`}
                        >
                          <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${isDone ? 'text-emerald-600' : 'text-zinc-300'}`} />
                          <span>{exp}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. EMPLOYABILITY SKILLS */}
      {/* ========================================================== */}
      {activeCategory === 'skill' && (
        <div className="space-y-6">
          {filteredCategorySubjects.map((sk) => (
            <div key={sk.id} className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">{sk.name}</h3>
                    <p className="text-xs text-zinc-400">{sk.code} · Skill-Centric Practical Course</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {sk.skillCategories?.map((cat) => (
                  <div key={cat.categoryName} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 border-b border-zinc-200/60 pb-2">
                      {cat.categoryName}
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {cat.tasks.map((tsk, i) => {
                        const key = `${sk.id}_cat_${cat.categoryName}_${i}`;
                        const isDone = itemProgress[key] === 'completed';
                        return (
                          <li
                            key={i}
                            onClick={() => saveProgress(key, isDone ? 'not_started' : 'completed')}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs cursor-pointer transition ${
                              isDone ? 'bg-emerald-50 line-through text-zinc-500' : 'bg-white border border-zinc-200 text-zinc-800'
                            }`}
                          >
                            <CheckCircle2 className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-600' : 'text-zinc-300'}`} />
                            <span>{tsk}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. HOLISTIC SKILL & INNOVATION */}
      {/* ========================================================== */}
      {activeCategory === 'innovation' && (
        <div className="space-y-6">
          {filteredCategorySubjects.map((inn) => (
            <div key={inn.id} className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">{inn.name}</h3>
                    <p className="text-xs text-zinc-400">{inn.code} · Innovation, Entrepreneurship &amp; Industry Connect</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {inn.skillCategories?.map((cat) => (
                  <div key={cat.categoryName} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-zinc-200/60 pb-2">
                      {cat.categoryName}
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {cat.tasks.map((tsk, i) => {
                        const key = `${inn.id}_cat_${cat.categoryName}_${i}`;
                        const isDone = itemProgress[key] === 'completed';
                        return (
                          <li
                            key={i}
                            onClick={() => saveProgress(key, isDone ? 'not_started' : 'completed')}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs cursor-pointer transition ${
                              isDone ? 'bg-emerald-50 line-through text-zinc-500' : 'bg-white border border-zinc-200 text-zinc-800'
                            }`}
                          >
                            <CheckCircle2 className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-600' : 'text-zinc-300'}`} />
                            <span>{tsk}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. STUDY TIMETABLE SCHEDULER */}
      {/* ========================================================== */}
      {activeCategory === 'schedule' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Scheduled Study Sessions</h3>
              <p className="text-xs text-zinc-500">Plan exam revisions by date, time slot, and study duration.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-800"
              />
              <div className="flex rounded-xl bg-zinc-100 p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setScheduleView(mode)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition ${
                      scheduleView === mode ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-12 text-center shadow-sm">
              <CalendarDays className="mx-auto h-12 w-12 text-zinc-300" />
              <h4 className="mt-3 text-base font-bold text-zinc-900">No study sessions scheduled</h4>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Schedule study sessions for your Semester {semester} subjects to build consistent study habits before Mid-Terms.
              </p>
              <button
                onClick={() => setNewSessionModalOpen(true)}
                className="apple-primary-button mt-5 mx-auto text-xs"
              >
                <Plus className="h-4 w-4" /> Schedule First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`rounded-2xl border p-5 shadow-sm transition ${
                    sess.completed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-zinc-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {sess.subject_code} · Unit {sess.unit}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 uppercase">
                      {sess.priority}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-zinc-950 leading-snug">{sess.topic}</h4>
                  <p className="mt-1 text-xs text-zinc-500">{sess.subject_name}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-blue-600" /> {sess.start_time} - {sess.end_time} ({sess.duration_minutes}m)
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">{sess.date}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleSessionCompleted(sess.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition ${
                        sess.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" /> {sess.completed ? 'Completed' : 'Mark Done'}
                    </button>
                    <button
                      onClick={() => deleteSession(sess.id)}
                      className="rounded-xl border border-zinc-200 p-1.5 text-zinc-400 hover:text-red-600 transition"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Study Session Modal */}
      {newSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-zinc-950">Schedule Study Session</h3>
            <p className="text-xs text-zinc-500">Plan a targeted revision session for an assigned unit topic.</p>

            <form onSubmit={handleCreateSession} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Subject</label>
                <select
                  value={sessionSubjectId}
                  onChange={(e) => setSessionSubjectId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-semibold text-zinc-800"
                >
                  {currentSemesterSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} – {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Unit</label>
                  <select
                    value={sessionUnit}
                    onChange={(e) => setSessionUnit(Number(e.target.value))}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-semibold text-zinc-800"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Priority</label>
                  <select
                    value={sessionPriority}
                    onChange={(e) => setSessionPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-semibold text-zinc-800"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Topic Name</label>
                <input
                  required
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="e.g., Dynamic Object Management & Smart Pointers"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2 text-[11px] text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={sessionStartTime}
                    onChange={(e) => setSessionStartTime(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2 text-[11px] text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1">End</label>
                  <input
                    type="time"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-2 text-[11px] text-zinc-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewSessionModalOpen(false)}
                  className="apple-secondary-button flex-1 justify-center py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-primary-button flex-1 justify-center py-2.5 text-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
