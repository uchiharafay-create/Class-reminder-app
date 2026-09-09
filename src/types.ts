export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface ClassItem {
  id: string;
  day: DayOfWeek;
  subject: string;
  startTime: string; // "HH:mm" (24-hour format e.g. "11:30")
  endTime: string;   // "HH:mm" (24-hour format e.g. "13:00")
  room: string;      // e.g. "G07", "209"
  section?: string;  // e.g. "Section A"
  notes?: string;
  color?: string;
}

export type TaskType = 'Quiz' | 'Assignment';

export interface AcademicTask {
  id: string;
  type: TaskType;
  title: string;
  subject: string;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:mm"
  room?: string;     // optional room/location
  notes?: string;    // e.g. "bring calculator", "submit online"
  completed?: boolean;
  expired?: boolean;
  createdAt: number;
}

export interface TodayItem {
  id: string;
  kind: 'Class' | 'Quiz' | 'Assignment';
  title: string;
  subject: string;
  startTime: string;
  endTime?: string;
  room?: string;
  notes?: string;
  dateStr: string; // YYYY-MM-DD
  targetDateTime: Date;
  endDateTime?: Date;
  isRecurring: boolean;
  rawClass?: ClassItem;
  rawTask?: AcademicTask;
  isCompleted?: boolean;
  isExpired?: boolean;
}

export interface TriggeredAlert {
  id: string;
  type: 'Class' | 'Quiz' | 'Assignment';
  title: string;
  subject: string;
  time: string;
  room?: string;
  notes?: string;
  triggeredAt: number;
}
