'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { DataService } from '@/lib/data-service';
import { Branch, Subject, Teacher, TimetableSlot, SessionType } from '@/lib/types';
import { formatTime12 } from '@/lib/time-utils';
import { Plus, Trash2, Edit3, LogOut, FileText, Calendar, ShieldCheck, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);

  // Filter state
  const [selectedBranch, setSelectedBranch] = useState<string>('b-cse');
  const [selectedSem, setSelectedSem] = useState<number>(4);

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form Fields
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [sessionType, setSessionType] = useState<SessionType>('lecture');
  const [room, setRoom] = useState<string>('LH-301');

  useEffect(() => {
    // Session Auth Guard
    const session = sessionStorage.getItem('clasy_admin_session');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);

    DataService.getBranches().then(setBranches);
    DataService.getTeachers().then((tList) => {
      setTeachers(tList);
      if (tList.length > 0) setTeacherId(tList[0].id);
    });
  }, [router]);

  const loadData = React.useCallback(async () => {
    const subjList = await DataService.getSubjects(selectedBranch, selectedSem);
    setSubjects(subjList);
    if (subjList.length > 0) setSubjectId(subjList[0].id);

    const slotList = await DataService.getTimetableSlots(selectedBranch, selectedSem);
    setSlots(slotList);
  }, [selectedBranch, selectedSem]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, loadData]);

  const handleOpenAddModal = () => {
    setEditingSlotId(null);
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('10:00');
    setRoom('LH-301');
    setSessionType('lecture');
    setIsModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      alert('Please select or create a subject first.');
      return;
    }

    if (editingSlotId) {
      await DataService.updateTimetableSlot(editingSlotId, {
        branch_id: selectedBranch,
        semester: selectedSem,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        subject_id: subjectId,
        teacher_id: teacherId,
        session_type: sessionType,
        room,
      });
    } else {
      await DataService.addTimetableSlot({
        branch_id: selectedBranch,
        semester: selectedSem,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        subject_id: subjectId,
        teacher_id: teacherId,
        session_type: sessionType,
        room,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteSlot = async (id: string) => {
    if (confirm('Are you sure you want to delete this timetable slot?')) {
      await DataService.deleteTimetableSlot(id);
      loadData();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('clasy_admin_session');
    router.push('/');
  };

  if (!authenticated) return null;

  const daysMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border-supabase-border bg-supabase-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-supabase-emerald/10 border border-supabase-emerald/30 flex items-center justify-center text-supabase-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-supabase-subtext">Manage schedules, classrooms, and lecture sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/admin/notes"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-supabase-bg border border-supabase-border text-xs text-white hover:border-supabase-emerald transition-colors"
            >
              <FileText className="w-4 h-4 text-supabase-emerald" />
              <span>Notes Manager</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Filter & Action Controls */}
        <div className="p-4 rounded-xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-supabase-muted mb-1">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-supabase-bg border border-supabase-border text-xs text-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-supabase-muted mb-1">Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-supabase-bg border border-supabase-border text-xs text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-supabase-emerald text-black font-semibold text-xs hover:bg-supabase-emeraldDark shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        </div>

        {/* Slots Table */}
        <div className="rounded-xl glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-supabase-card/80 border-b border-supabase-border font-mono uppercase text-supabase-muted text-[10px]">
                <tr>
                  <th className="p-4">Day</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Session Type</th>
                  <th className="p-4">Room / Lab</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-supabase-border/60">
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-supabase-muted italic">
                      No timetable slots configured for this branch and semester. Click &ldquo;Add Class Slot&rdquo; to create one!
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-supabase-card/40 transition-colors">
                      <td className="p-4 font-semibold text-white">{daysMap[slot.day_of_week]}</td>
                      <td className="p-4 font-mono text-supabase-emerald">
                        {formatTime12(slot.start_time)} - {formatTime12(slot.end_time)}
                      </td>
                      <td className="p-4 text-white font-medium">
                        {slot.subject?.name} <span className="font-mono text-supabase-muted text-[10px]">({slot.subject?.code})</span>
                      </td>
                      <td className="p-4 text-supabase-subtext">{slot.teacher?.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          slot.session_type === 'lab'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                            : 'bg-supabase-emerald/10 text-supabase-emerald border border-supabase-emerald/30'
                        }`}>
                          {slot.session_type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-white">{slot.room}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card bg-supabase-bg/95 p-6 border-supabase-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-supabase-border">
              <h3 className="text-base font-bold text-white">Add Timetable Slot</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-supabase-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-supabase-subtext mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-supabase-subtext mb-1">Session Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as SessionType)}
                    className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Practical Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-supabase-subtext mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                  />
                </div>

                <div>
                  <label className="block text-supabase-subtext mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-supabase-subtext mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-supabase-subtext mb-1">Faculty Member</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-supabase-subtext mb-1">Room / Lab Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Hall LH-301 or Lab B2"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-supabase-card border border-supabase-border text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-supabase-emerald text-black font-semibold shadow-md hover:bg-supabase-emeraldDark transition-all"
              >
                Save Timetable Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
