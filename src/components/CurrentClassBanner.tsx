'use client';

import React, { useEffect, useState } from 'react';
import { TimetableSlot, RealtimeClassStatus } from '@/lib/types';
import { computeRealtimeStatus, formatTime12, getDayName } from '@/lib/time-utils';
import { ArrowRight, CheckCircle2, Clock3, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';

export const CurrentClassBanner: React.FC<{ slots: TimetableSlot[] }> = ({ slots }) => {
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState<RealtimeClassStatus>(() => computeRealtimeStatus(slots, new Date()));

  useEffect(() => {
    const update = () => {
      const next = new Date();
      setNow(next);
      setStatus(computeRealtimeStatus(slots, next));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [slots]);

  const live = status.status === 'ongoing' && status.currentSlot;
  const upcoming = status.status === 'upcoming' && status.nextSlot;
  const primary = status.currentSlot;
  const parallel = status.currentSlots.length > 1 ? status.currentSlots : [];

  return (
    <section className="apple-card overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              {live ? 'Live now' : upcoming ? 'Up next' : 'Today'}
            </span>
            <span>{getDayName(now.getDay())} · {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {live && primary ? <>
            <p className="mt-5 text-sm font-medium text-emerald-600">Ends in {status.timeRemainingMinutes} min</p>
            <h2 className="mt-1 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{primary.subject?.name || 'Current class'}</h2>
            {primary.subject?.code && <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">{primary.subject.code}{primary.group ? ` · ${primary.group}` : ''}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5"><MapPin className="h-3.5 w-3.5" />{primary.room || 'Room TBD'}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5"><UserRound className="h-3.5 w-3.5" />{primary.teacher?.name || 'Instructor'}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5"><Clock3 className="h-3.5 w-3.5" />{formatTime12(primary.start_time)}–{formatTime12(primary.end_time)}</span>
            </div>

            {parallel.length > 1 && <div className="mt-4 rounded-2xl bg-zinc-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Parallel group sessions</p><div className="mt-2 flex flex-wrap gap-2">{parallel.map((slot) => <span key={slot.id} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600">{slot.subject?.code} · {slot.group || 'Group'} · {slot.room || 'Room'}</span>)}</div></div>}

            <div className="mt-5 max-w-xl"><div className="h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${status.percentageComplete}%` }} /></div></div>

            {status.nextSlot && <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Upcoming lecture</p><h3 className="mt-1 text-base font-semibold text-zinc-900">{status.nextSlot.subject?.name || 'Next class'}</h3><p className="mt-1 text-xs text-zinc-400">{status.nextSlot.subject?.code} · {status.nextSlot.teacher?.name || 'Faculty'}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{formatTime12(status.nextSlot.start_time)}</span></div><div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500"><span className="rounded-full bg-zinc-100 px-3 py-1.5">{status.nextSlot.room || 'Room TBD'}</span><span className="rounded-full bg-zinc-100 px-3 py-1.5">Next at {formatTime12(status.nextSlot.start_time)}</span></div></div>}
          </> : upcoming && status.nextSlot ? <>
            <p className="mt-5 text-sm font-medium text-blue-600">Starts in {status.timeRemainingMinutes} min</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{status.nextSlot.subject?.name || 'Next class'}</h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">{status.nextSlot.subject?.code}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-3 py-1.5">{status.nextSlot.room || 'Room TBD'}</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1.5">{status.nextSlot.teacher?.name || 'Faculty'}</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1.5">{formatTime12(status.nextSlot.start_time)}–{formatTime12(status.nextSlot.end_time)}</span>
            </div>
          </> : <>
            <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">{status.status === 'free_day' ? 'A free day.' : 'You’re done for today.'}</h2>
            <p className="mt-2 text-sm text-zinc-500">Take a break, review your notes, or check tomorrow’s classes.</p>
          </>}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Link href="/timetable" className="apple-primary-button justify-center">Timetable <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/notes" className="apple-secondary-button justify-center">Notes</Link>
        </div>
      </div>
    </section>
  );
};
