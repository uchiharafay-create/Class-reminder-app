import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { ClassItem, DayOfWeek, DAYS_OF_WEEK } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classItem: Omit<ClassItem, 'id'>, id?: string) => void;
  initialClass?: ClassItem | null;
  initialDay?: DayOfWeek;
}

const COMMON_SUBJECTS = [
  'MGT401 - Corporate Governance',
  'LSM506 - Decision Modeling in Supply Chain',
  'LSM507 - Supply Chain Software',
  'MGT501 - Strategic Management',
  'MGT461 - Project Management',
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClass,
  initialDay,
}) => {
  const [day, setDay] = useState<DayOfWeek>(initialDay || 'Wednesday');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('13:00');
  const [room, setRoom] = useState('G07');
  const [section, setSection] = useState('Section A, Spring 2023 BBA-8AB');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClass) {
      setDay(initialClass.day);
      setSubject(initialClass.subject);
      setStartTime(initialClass.startTime);
      setEndTime(initialClass.endTime);
      setRoom(initialClass.room);
      setSection(initialClass.section || 'Section A, Spring 2023 BBA-8AB');
      setNotes(initialClass.notes || '');
    } else {
      setDay(initialDay || 'Wednesday');
      setSubject('');
      setStartTime('11:30');
      setEndTime('13:00');
      setRoom('G07');
      setSection('Section A, Spring 2023 BBA-8AB');
      setNotes('');
    }
    setError('');
  }, [initialClass, initialDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please enter a course or subject name');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please provide start and end times');
      return;
    }
    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }
    if (!room.trim()) {
      setError('Please enter a room number (e.g., G07, 209, B11)');
      return;
    }

    onSave(
      {
        day,
        subject: subject.trim(),
        startTime,
        endTime,
        room: room.trim(),
        section: section.trim(),
        notes: notes.trim() || undefined,
      },
      initialClass?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {initialClass ? 'Edit Recurring Class' : 'Add Recurring Class'}
              </h3>
              <p className="text-[11px] text-zinc-400">Weekly timetable schedule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs font-semibold text-red-300">
              {error}
            </div>
          )}

          {/* Day of week */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Day of Week
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 text-xs">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`py-1.5 px-1 rounded-lg font-medium text-center transition-colors ${
                    day === d
                      ? 'bg-white text-black font-bold shadow-xs'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Subject with quick suggestions */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Course / Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MGT401 - Corporate Governance"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white font-medium"
            />
            {/* Quick autofills */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {COMMON_SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
                >
                  {s.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
          </div>

          {/* Room Number and Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Room Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. G07, 209, B11"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Section / Cohort
              </label>
              <input
                type="text"
                placeholder="e.g. Section A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bring laptop, case study discussion"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg shadow-xs transition-colors"
            >
              {initialClass ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
