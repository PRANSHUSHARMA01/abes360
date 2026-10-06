'use client';

import React, { useEffect, useState } from 'react';
import { TimetableSlot, SessionType } from '@/lib/types';
import { formatTime12, parseTimeToMinutes } from '@/lib/time-utils';
import { BookOpen, CalendarDays, FlaskConical, Layers3, MapPin, UserRound } from 'lucide-react';

const daysList = [
  { index: 1, name: 'Monday', short: 'Mon' }, { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' }, { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' }, { index: 6, name: 'Saturday', short: 'Sat' },
];

function badge(type: SessionType) {
  if (type === 'lab') return { label: 'Lab', icon: FlaskConical, cls: 'bg-purple-50 text-purple-700' };
  if (type === 'tutorial') return { label: 'Tutorial', icon: Layers3, cls: 'bg-blue-50 text-blue-700' };
  return { label: 'Lecture', icon: BookOpen, cls: 'bg-zinc-100 text-zinc-600' };
}

export const TimetableGrid: React.FC<{ slots: TimetableSlot[]; branchCode?: string; semester?: number }> = ({ slots, branchCode = 'CSE', semester = 3 }) => {
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const today = new Date().getDay();
    setCurrentDay(today >= 1 && today <= 6 ? today : 1);
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const todayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isOngoing = (slot: TimetableSlot) => slot.day_of_week === todayIndex && currentMinutes >= parseTimeToMinutes(slot.start_time) && currentMinutes < parseTimeToMinutes(slot.end_time);
  const sortSlots = (day: number) => slots.filter((slot) => slot.day_of_week === day).sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));

  const SlotCard = ({ slot }: { slot: TimetableSlot }) => {
    const live = isOngoing(slot);
    const b = badge(slot.session_type);
    const Icon = b.icon;
    return <article className={`apple-card relative p-5 ${live ? 'ring-2 ring-emerald-400/50' : ''}`}>
      {live && <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Live now</span>}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${b.cls}`}><Icon className="h-3.5 w-3.5" />{b.label}</span>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{slot.subject?.name || 'Class'}</h3>
          {slot.subject?.code && <p className="mt-1 text-xs text-zinc-400">{slot.subject.code}{slot.group ? ` · ${slot.group}` : ''}</p>}
        </div>
        <div className="shrink-0 text-right"><div className="text-sm font-semibold text-zinc-900">{formatTime12(slot.start_time)}</div><div className="mt-0.5 text-xs text-zinc-400">{formatTime12(slot.end_time)}</div></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5"><MapPin className="h-3.5 w-3.5" />{slot.room || 'Room TBD'}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5"><UserRound className="h-3.5 w-3.5" />{slot.teacher?.name || 'Faculty'}</span>
      </div>
    </article>;
  };

  return <div className="space-y-5">
    <div className="apple-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><CalendarDays className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold text-zinc-950">Weekly schedule</h2><p className="text-xs text-zinc-400">{branchCode} · Semester {semester}</p></div></div>
      <div className="flex rounded-full bg-zinc-100 p-1"><button onClick={() => setViewMode('daily')} className={`rounded-full px-4 py-2 text-xs font-medium ${viewMode === 'daily' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}>Day</button><button onClick={() => setViewMode('weekly')} className={`rounded-full px-4 py-2 text-xs font-medium ${viewMode === 'weekly' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'}`}>Week</button></div>
    </div>

    {viewMode === 'daily' ? <>
      <div className="flex gap-2 overflow-x-auto pb-1">{daysList.map((day) => { const selected = currentDay === day.index; const today = todayIndex === day.index; return <button key={day.index} onClick={() => setCurrentDay(day.index)} className={`min-w-[82px] rounded-2xl border px-4 py-3 text-center ${selected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600'}`}><div className="text-xs font-semibold">{day.short}</div><div className={`mt-1 text-[11px] ${selected ? 'text-zinc-300' : 'text-zinc-400'}`}>{sortSlots(day.index).length} classes{today ? ' · today' : ''}</div></button>; })}</div>
      {sortSlots(currentDay).length ? <div className="grid gap-4 md:grid-cols-2">{sortSlots(currentDay).map((slot) => <SlotCard key={slot.id} slot={slot} />)}</div> : <div className="apple-card p-14 text-center"><h3 className="text-lg font-semibold text-zinc-900">No classes scheduled</h3><p className="mt-1 text-sm text-zinc-500">Enjoy the free time or catch up on your notes.</p></div>}
    </> : <div className="grid gap-4 lg:grid-cols-3">{daysList.map((day) => <section key={day.index} className={`rounded-3xl border p-4 ${day.index === todayIndex ? 'border-blue-200 bg-blue-50/40' : 'border-zinc-200 bg-white'}`}><div className="flex items-center justify-between"><h3 className="font-semibold text-zinc-900">{day.name}</h3><span className="text-xs text-zinc-400">{sortSlots(day.index).length}</span></div><div className="mt-3 space-y-2">{sortSlots(day.index).map((slot) => <div key={slot.id} className="rounded-2xl bg-zinc-50 p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-zinc-800">{slot.subject?.name}</p><span className="text-[11px] text-zinc-400">{formatTime12(slot.start_time)}</span></div><p className="mt-1 text-xs text-zinc-400">{slot.subject?.code} · {slot.room || 'Room TBD'}{slot.group ? ` · ${slot.group}` : ''}</p><p className="mt-1 text-xs text-zinc-400">{slot.teacher?.name || 'Faculty'}</p></div>)}</div></section>)}</div>}
  </div>;
};
