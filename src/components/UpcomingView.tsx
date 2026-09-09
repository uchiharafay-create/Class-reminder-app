import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  Bell,
} from 'lucide-react';
import { AcademicTask, TaskType } from '../types';
import { formatTime12H, parseDateTime } from '../utils/time';

interface UpcomingViewProps {
  tasks: AcademicTask[];
  onOpenAddTask: (type?: TaskType) => void;
  onEditTask: (task: AcademicTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
  onTriggerManualAlert: (task: AcademicTask) => void;
  currentTime: Date;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
  onToggleCompleted,
  onTriggerManualAlert,
  currentTime,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'Quiz' | 'Assignment' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentTimestamp = currentTime.getTime();

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterType === 'Quiz' && task.type !== 'Quiz') return false;
        if (filterType === 'Assignment' && task.type !== 'Assignment') return false;
        if (filterType === 'COMPLETED' && !task.completed && !task.expired) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchSubject = task.subject.toLowerCase().includes(q);
          const matchNotes = task.notes?.toLowerCase().includes(q);
          const matchRoom = task.room?.toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchNotes && !matchRoom) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = parseDateTime(a.date, a.time).getTime();
        const dateB = parseDateTime(b.date, b.time).getTime();
        const aFinished = a.completed || a.expired;
        const bFinished = b.completed || b.expired;
        if (aFinished && !bFinished) return 1;
        if (!aFinished && bFinished) return -1;
        return dateA - dateB;
      });
  }, [tasks, filterType, searchQuery]);

  const quizCount = tasks.filter((t) => t.type === 'Quiz' && !t.completed && !t.expired).length;
  const assignmentCount = tasks.filter((t) => t.type === 'Assignment' && !t.completed && !t.expired).length;
  const completedCount = tasks.filter((t) => t.completed || t.expired).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Upcoming Quizzes &amp; Assignments</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Color-coded: Quizzes (<span className="text-rose-400 font-semibold">Red</span>) and
              Assignments (<span className="text-amber-400 font-semibold">Orange</span>) with automated 5-minute pre-alert.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-quiz"
              onClick={() => onOpenAddTask('Quiz')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Quiz (Red)</span>
            </button>

            <button
              type="button"
              id="btn-add-assignment"
              onClick={() => onOpenAddTask('Assignment')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-600 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Assignment (Orange)</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === 'ALL'
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
              }`}
            >
              All Active ({quizCount + assignmentCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('Quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                filterType === 'Quiz'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-zinc-800 text-rose-300 border border-rose-900/50 hover:bg-zinc-750'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Quizzes ({quizCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('Assignment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                filterType === 'Assignment'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-zinc-800 text-amber-300 border border-amber-900/50 hover:bg-zinc-750'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Assignments ({assignmentCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === 'COMPLETED'
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
              }`}
            >
              Completed / Past ({completedCount})
            </button>
          </div>

          {/* Search input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search title, subject, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">No tasks found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No quizzes or assignments match "${searchQuery}".`
              : 'You have no scheduled quizzes or assignments in this category.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAddTask('Quiz')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950 border border-rose-800/60 rounded-lg hover:bg-rose-900"
            >
              Create Quiz
            </button>
            <button
              type="button"
              onClick={() => onOpenAddTask('Assignment')}
              className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950 border border-amber-800/60 rounded-lg hover:bg-amber-900"
            >
              Create Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const taskDateTime = parseDateTime(task.date, task.time);
            const taskTimestamp = taskDateTime.getTime();
            const diffMs = taskTimestamp - currentTimestamp;
            const isDueSoon = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
            const isWithin5Min = diffMs > 0 && diffMs <= 5 * 60 * 1000;
            const isPassed = diffMs <= 0 || task.expired;
            const isCompleted = task.completed;

            const isQuiz = task.type === 'Quiz';

            const containerStyle = isQuiz
              ? 'border-zinc-800 hover:border-rose-500/50 bg-zinc-950/80'
              : 'border-zinc-800 hover:border-amber-500/50 bg-zinc-950/80';

            const badgeStyle = isQuiz
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
              : 'bg-amber-950/80 text-amber-300 border-amber-800/60';

            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            let relativeLabel = '';
            if (isPassed) {
              relativeLabel = 'Passed / Expired';
            } else if (diffDays === 0) {
              relativeLabel = 'Due Today';
            } else if (diffDays === 1) {
              relativeLabel = 'Due Tomorrow';
            } else {
              relativeLabel = `In ${diffDays} days`;
            }

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${containerStyle} ${
                  isCompleted || isPassed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Completion checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleCompleted(task.id)}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as done'}
                      className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-zinc-600 hover:border-emerald-400 flex items-center justify-center" />
                      )}
                    </button>

                    <div className="space-y-1.5">
                      {/* Badge and tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}
                        >
                          {task.type}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPassed
                              ? 'bg-zinc-800 text-zinc-400'
                              : isWithin5Min
                              ? 'bg-red-950 text-red-300 border border-red-800 animate-bounce'
                              : isDueSoon
                              ? 'bg-red-950 text-red-300 border border-red-800/60'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {relativeLabel}
                        </span>

                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Title & Subject */}
                      <h3
                        className={`text-base font-bold text-white ${
                          isCompleted ? 'line-through text-zinc-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        <span>Course:</span>
                        <span className="text-zinc-200">{task.subject}</span>
                      </p>

                      {/* Meta information */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 pt-1">
                        <span className="flex items-center gap-1 font-mono font-medium text-zinc-200">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {task.date}
                        </span>

                        <span className="flex items-center gap-1 font-mono font-medium text-zinc-200">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {formatTime12H(task.time)}
                        </span>

                        {task.room && (
                          <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {task.room}
                          </span>
                        )}

                        {task.notes && (
                          <span className="flex items-center gap-1 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-700 text-amber-300">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            Note: {task.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start pt-1">
                    <button
                      type="button"
                      onClick={() => onTriggerManualAlert(task)}
                      title="Test 5-min alarm on this item"
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete ${task.type} "${task.title}"?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      title="Delete task"
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
