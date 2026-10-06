import { TimetableSlot, RealtimeClassStatus } from './types';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function formatTime12(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parts[1] ? parts[1].padStart(2, '0') : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Monday';
}

export function computeRealtimeStatus(
  slots: TimetableSlot[],
  currentDate: Date = new Date()
): RealtimeClassStatus {
  const currentDay = currentDate.getDay();
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const todaySlots = slots
    .filter((slot) => slot.day_of_week === currentDay)
    .sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));

  if (todaySlots.length === 0) {
    return {
      currentSlot: null, currentSlots: [], nextSlot: null,
      timeRemainingMinutes: 0, durationMinutes: 0, elapsedMinutes: 0, percentageComplete: 0,
      status: 'free_day',
    };
  }

  const currentSlots = todaySlots.filter((slot) => {
    const start = parseTimeToMinutes(slot.start_time);
    const end = parseTimeToMinutes(slot.end_time);
    return currentMinutes >= start && currentMinutes < end;
  });

  if (currentSlots.length > 0) {
    const currentSlot = currentSlots[0];
    const latestEnd = Math.max(...currentSlots.map((slot) => parseTimeToMinutes(slot.end_time)));
    const nextSlot = todaySlots.find((slot) => parseTimeToMinutes(slot.start_time) >= latestEnd) || null;
    const startMins = parseTimeToMinutes(currentSlot.start_time);
    const endMins = parseTimeToMinutes(currentSlot.end_time);
    const durationMinutes = endMins - startMins;
    const elapsedMinutes = Math.max(0, currentMinutes - startMins);
    const timeRemainingMinutes = Math.max(0, latestEnd - currentMinutes);
    const percentageComplete = Math.min(100, Math.max(0, Math.round((elapsedMinutes / durationMinutes) * 100)));

    return {
      currentSlot,
      currentSlots,
      nextSlot,
      timeRemainingMinutes,
      durationMinutes,
      elapsedMinutes,
      percentageComplete,
      status: 'ongoing',
    };
  }

  const nextSlot = todaySlots.find((slot) => parseTimeToMinutes(slot.start_time) > currentMinutes) || null;
  if (nextSlot) {
    return {
      currentSlot: null,
      currentSlots: [],
      nextSlot,
      timeRemainingMinutes: parseTimeToMinutes(nextSlot.start_time) - currentMinutes,
      durationMinutes: 0,
      elapsedMinutes: 0,
      percentageComplete: 0,
      status: 'upcoming',
    };
  }

  return {
    currentSlot: null,
    currentSlots: [],
    nextSlot: null,
    timeRemainingMinutes: 0,
    durationMinutes: 0,
    elapsedMinutes: 0,
    percentageComplete: 100,
    status: 'day_ended',
  };
}
