import React, { useState, useEffect } from 'react';
import { X, Bookmark } from 'lucide-react';
import { AcademicTask, TaskType } from '../types';
import { getRelativeDateString } from '../data/preloadData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<AcademicTask, 'id' | 'createdAt'>, id?: string) => void;
  initialTask?: AcademicTask | null;
  defaultType?: TaskType;
}

const COMMON_SUBJECTS = [
  'MGT401 - Corporate Governance',
  'LSM506 - Decision Modeling in Supply Chain',
  'LSM507 - Supply Chain Software',
  'MGT501 - Strategic Management',
  'MGT461 - Project Management',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultType = 'Quiz',
}) => {
  const [type, setType] = useState<TaskType>(defaultType);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(getRelativeDateString(1));
  const [time, setTime] = useState('11:30');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setType(initialTask.type);
      setTitle(initialTask.title);
      setSubject(initialTask.subject);
      setDate(initialTask.date);
      setTime(initialTask.time);
      setRoom(initialTask.room || '');
      setNotes(initialTask.notes || '');
    } else {
      setType(defaultType);
      setTitle('');
      setSubject(COMMON_SUBJECTS[0]);
      setDate(getRelativeDateString(1));
      setTime('11:30');
      setRoom('');
      setNotes('');
    }
    setError('');
  }, [initialTask, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    if (!subject.trim()) {
      setError('Please choose or enter a subject');
      return;
    }
    if (!date) {
      setError('Please choose a date');
      return;
    }
    if (!time) {
      setError('Please choose a time');
      return;
    }

    onSave(
      {
        type,
        title: title.trim(),
        subject: subject.trim(),
        date,
        time,
        room: room.trim() || undefined,
        notes: notes.trim() || undefined,
        completed: initialTask?.completed || false,
        expired: initialTask?.expired || false,
      },
      initialTask?.id
    );
    onClose();
  };

  const isQuiz = type === 'Quiz';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold ${
                isQuiz ? 'bg-rose-600' : 'bg-amber-600'
              }`}
            >
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {initialTask ? `Edit ${initialTask.type}` : `Add New ${type}`}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Automatic 5-minute pre-alert with alarm chime
              </p>
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

          {/* Type Selector (Quiz vs Assignment) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('Quiz')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  isQuiz
                    ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isQuiz ? 'bg-white' : 'bg-rose-500'}`} />
                <span>Quiz (Red)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('Assignment')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  !isQuiz
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${!isQuiz ? 'bg-white' : 'bg-amber-500'}`} />
                <span>Assignment (Orange)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Title / Description
            </label>
            <input
              type="text"
              required
              placeholder={
                isQuiz
                  ? 'e.g. Mid-term Quiz on Chapter 4'
                  : 'e.g. Final Group Report & Excel Model'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white font-medium"
            />
          </div>

          {/* Subject / Course */}
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
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
            />
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

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white focus:outline-none focus:ring-1 focus:ring-white font-mono"
              />
            </div>
          </div>

          {/* Room/Location (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Room / Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. G07, Hall 209, or Online LMS"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder='e.g. "bring calculator", "submit online as PDF"'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-750 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Actions */}
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
              {initialTask ? 'Save Changes' : `Add ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
