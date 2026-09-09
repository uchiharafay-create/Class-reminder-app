import { ClassItem, AcademicTask } from '../types';

export const PRELOADED_CLASSES: ClassItem[] = [
  {
    id: 'class-wed-1',
    day: 'Wednesday',
    subject: 'MGT401 - Corporate Governance',
    startTime: '11:30',
    endTime: '13:00',
    room: 'G07',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'Lecture Hall G07 (AB-1)',
  },
  {
    id: 'class-wed-2',
    day: 'Wednesday',
    subject: 'MGT401 - Corporate Governance',
    startTime: '13:00',
    endTime: '14:30',
    room: 'G07',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'Case study discussion & governance frameworks',
  },
  {
    id: 'class-fri-1',
    day: 'Friday',
    subject: 'LSM506 - Decision Modeling in Supply Chain',
    startTime: '08:30',
    endTime: '11:30',
    room: '209',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'Bring laptop for Excel Solver simulations',
  },
  {
    id: 'class-fri-2',
    day: 'Friday',
    subject: 'LSM507 - Supply Chain Software',
    startTime: '14:30',
    endTime: '17:30',
    room: 'B11',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'SAP / ERP module lab session',
  },
  {
    id: 'class-sat-1',
    day: 'Saturday',
    subject: 'MGT501 - Strategic Management',
    startTime: '08:30',
    endTime: '11:30',
    room: 'G08',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'Lecture Hall G08 (AB-1)',
  },
  {
    id: 'class-sat-2',
    day: 'Saturday',
    subject: 'MGT461 - Project Management',
    startTime: '11:30',
    endTime: '14:30',
    room: 'G08',
    section: 'Section A, Spring 2023 BBA-8AB',
    notes: 'Gantt chart and Agile sprint analysis',
  },
];

// Helper to format YYYY-MM-DD
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultTasks(): AcademicTask[] {
  return [
    {
      id: 'task-preload-1',
      type: 'Quiz',
      title: 'Mid-term Quiz on Corporate Board Roles',
      subject: 'MGT401 - Corporate Governance',
      date: getRelativeDateString(1), // Tomorrow
      time: '11:30',
      room: 'G07',
      notes: 'Bring student ID and scientific calculator',
      completed: false,
      expired: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'task-preload-2',
      type: 'Assignment',
      title: 'Supply Chain Optimization Model (Case 3)',
      subject: 'LSM506 - Decision Modeling in Supply Chain',
      date: getRelativeDateString(3), // In 3 days
      time: '23:59',
      room: 'Online Portal',
      notes: 'Submit PDF report and .xlsx workbook online',
      completed: false,
      expired: false,
      createdAt: Date.now() - 43200000,
    },
    {
      id: 'task-preload-3',
      type: 'Quiz',
      title: 'Industry Analysis & Porter 5 Forces Assessment',
      subject: 'MGT501 - Strategic Management',
      date: getRelativeDateString(5), // In 5 days
      time: '09:00',
      room: 'G08',
      notes: 'Chapters 4–7 covered. Closed book test',
      completed: false,
      expired: false,
      createdAt: Date.now() - 21600000,
    },
    {
      id: 'task-preload-4',
      type: 'Assignment',
      title: 'Sprint Planning & WBS Project Charter',
      subject: 'MGT461 - Project Management',
      date: getRelativeDateString(7), // In 1 week
      time: '18:00',
      room: 'LMS Portal',
      notes: 'Group project submission (max 5 members)',
      completed: false,
      expired: false,
      createdAt: Date.now() - 10000000,
    },
  ];
}
