import { ClassItem, AcademicTask, TodayItem, DayOfWeek } from '../types';

export function getTodayDayOfWeek(date: Date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

export function formatToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts 24-hour HH:mm to 12-hour format e.g. "11:30" -> "11:30 AM", "14:30" -> "2:30 PM"
 */
export function formatTime12H(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, '0');
  return `${displayH}:${displayM} ${ampm}`;
}

export function parseTimeToTodayDate(timeStr: string, baseDate: Date = new Date()): Date {
  const [hStr, mStr] = timeStr.split(':');
  const target = new Date(baseDate);
  target.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0);
  return target;
}

export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/**
 * Compile all items happening today (classes recurring today + quizzes/assignments scheduled for today)
 */
export function getTodayItems(
  classes: ClassItem[],
  tasks: AcademicTask[],
  now: Date = new Date()
): TodayItem[] {
  const todayDay = getTodayDayOfWeek(now);
  const todayDateStr = formatToDateString(now);

  const items: TodayItem[] = [];

  // Recurring classes today
  for (const c of classes) {
    if (c.day === todayDay) {
      const targetDateTime = parseTimeToTodayDate(c.startTime, now);
      const endDateTime = parseTimeToTodayDate(c.endTime, now);
      items.push({
        id: `class-${c.id}`,
        kind: 'Class',
        title: c.subject,
        subject: c.subject,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        notes: c.notes,
        dateStr: todayDateStr,
        targetDateTime,
        endDateTime,
        isRecurring: true,
        rawClass: c,
      });
    }
  }

  // Tasks scheduled today
  for (const t of tasks) {
    if (t.date === todayDateStr) {
      const targetDateTime = parseDateTime(t.date, t.time);
      items.push({
        id: `task-${t.id}`,
        kind: t.type,
        title: t.title,
        subject: t.subject,
        startTime: t.time,
        room: t.room,
        notes: t.notes,
        dateStr: t.date,
        targetDateTime,
        isRecurring: false,
        rawTask: t,
        isCompleted: t.completed,
        isExpired: t.expired,
      });
    }
  }

  // Sort chronologically
  items.sort((a, b) => a.targetDateTime.getTime() - b.targetDateTime.getTime());
  return items;
}

/**
 * Formats seconds remaining into clean "2h 15m 30s" string
 */
export function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return '00:00';
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Checks if a scheduled item is exactly in the 5-minute pre-event reminder window.
 * The reminder triggers when:
 * 5 min before start (targetTime - 5 * 60 * 1000) <= now <= (targetTime - 5 * 60 * 1000 + 75s grace period)
 * Or any time within the 5 minute window before start if not yet alerted.
 */
export function isWithin5MinReminderWindow(targetDate: Date, now: Date): boolean {
  const diffMs = targetDate.getTime() - now.getTime();
  const fiveMinMs = 5 * 60 * 1000;
  // Between 5 minutes before (diffMs <= 5 min) and still before or up to 30s after the 5m threshold
  // That is: diffMs is between 3.5 minutes (210s) and 5 minutes (300s)
  // To avoid missing with 30s intervals: diffMs <= 5 min (300,000ms) AND diffMs >= 0 (hasn't started yet)
  return diffMs <= fiveMinMs && diffMs >= 0;
}
