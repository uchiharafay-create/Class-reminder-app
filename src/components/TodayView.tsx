import React, { useMemo } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  Plus,
  Bell,
} from 'lucide-react';
import { TodayItem, AcademicTask, ClassItem } from '../types';
import { formatTime12H, formatCountdown } from '../utils/time';

interface TodayViewProps {
  todayItems: TodayItem[];
  currentTime: Date;
  onOpenAddClass: () => void;
  onOpenAddTask: (type?: 'Quiz' | 'Assignment') => void;
  onToggleTaskCompleted: (taskId: string) => void;
  onTriggerManualAlert: (item: TodayItem) => void;
  onEditClass: (item: ClassItem) => void;
  onEditTask: (item: AcademicTask) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  todayItems,
  currentTime,
  onOpenAddClass,
  onOpenAddTask,
  onToggleTaskCompleted,
  onTriggerManualAlert,
  onEditClass,
  onEditTask,
}) => {
  const currentTimestamp = currentTime.getTime();

  // Find the currently active or next item
  const { activeItem, nextItem, diffMsToNext } = useMemo(() => {
    let active: TodayItem | null = null;
    let next: TodayItem | null = null;
    let minFutureDiff = Infinity;

    for (const item of todayItems) {
      if (item.isCompleted) continue;

      const startTimeMs = item.targetDateTime.getTime();
      const endTimeMs = item.endDateTime
        ? item.endDateTime.getTime()
        : startTimeMs + 60 * 60 * 1000;

      if (currentTimestamp >= startTimeMs && currentTimestamp <= endTimeMs) {
        if (!active) active = item;
      } else if (startTimeMs > currentTimestamp) {
        const diff = startTimeMs - currentTimestamp;
        if (diff < minFutureDiff) {
          minFutureDiff = diff;
          next = item;
        }
      }
    }

    return {
      activeItem: active,
      nextItem: next,
      diffMsToNext: minFutureDiff !== Infinity ? minFutureDiff : 0,
    };
  }, [todayItems, currentTimestamp]);

  const targetForCountdown = nextItem || activeItem;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Countdown in Black & White Monochrome Style */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle monochrome mesh background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-750">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {currentTime.toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {activeItem && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  In Session Now
                </span>
              )}
            </div>

            {targetForCountdown ? (
              <div>
                <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold pt-1">
                  {activeItem && !nextItem
                    ? 'Current Activity Ending Soon'
                    : 'Next Scheduled Academic Event'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  {targetForCountdown.title}
                </h2>
                {targetForCountdown.subject && targetForCountdown.subject !== targetForCountdown.title && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{targetForCountdown.subject}</p>
                )}

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 mt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider border ${
                      targetForCountdown.kind === 'Class'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                        : targetForCountdown.kind === 'Quiz'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    {targetForCountdown.kind}
                  </span>

                  <span className="flex items-center gap-1.5 font-mono text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {formatTime12H(targetForCountdown.startTime)}
                    {targetForCountdown.endTime && ` – ${formatTime12H(targetForCountdown.endTime)}`}
                  </span>

                  {targetForCountdown.room && (
                    <span className="flex items-center gap-1 text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      Room {targetForCountdown.room}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  No More Events Today
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  You've completed all scheduled classes and deadlines for today.
                </p>
              </div>
            )}
          </div>

          {/* Live Countdown Box (Monochrome Bold) */}
          {targetForCountdown && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center shrink-0 min-w-[220px] text-center shadow-lg">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">
                {nextItem ? 'Time Until Start' : 'Session Remaining'}
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
                {nextItem
                  ? formatCountdown(diffMsToNext)
                  : activeItem?.endDateTime
                  ? formatCountdown(activeItem.endDateTime.getTime() - currentTimestamp)
                  : '--:--'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-amber-400" />
                <span>Alarm sounds at -5m</span>
              </div>
              <button
                type="button"
                onClick={() => onTriggerManualAlert(targetForCountdown)}
                className="mt-3 text-[11px] font-bold text-zinc-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
              >
                Test 5-Min Alarm Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule Timeline Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Today's Academic Schedule</h3>
              <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Chronologically sorted with automatic 5-minute pre-event alarms
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddClass}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAddTask()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {todayItems.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">No events scheduled for today</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Your weekly schedule has no classes today, and no quizzes or assignments are due.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenAddClass}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg"
              >
                Add Class for Today
              </button>
              <button
                type="button"
                onClick={() => onOpenAddTask()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg"
              >
                Add Quiz/Assignment
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayItems.map((item, idx) => {
              const startTimeMs = item.targetDateTime.getTime();
              const endTimeMs = item.endDateTime
                ? item.endDateTime.getTime()
                : startTimeMs + 60 * 60 * 1000;

              const isPast = currentTimestamp > endTimeMs;
              const isHappeningNow =
                currentTimestamp >= startTimeMs && currentTimestamp <= endTimeMs;
              const isWithin5Min =
                startTimeMs - currentTimestamp <= 5 * 60 * 1000 &&
                startTimeMs - currentTimestamp > 0;

              const isClass = item.kind === 'Class';
              const isQuiz = item.kind === 'Quiz';

              // Visual styling mapping in dark mode:
              // Blue for classes, Red for quizzes, Orange for assignments
              const borderTheme = isClass
                ? 'border-zinc-800 hover:border-blue-500/40 bg-zinc-950/60'
                : isQuiz
                ? 'border-zinc-800 hover:border-rose-500/40 bg-zinc-950/60'
                : 'border-zinc-800 hover:border-amber-500/40 bg-zinc-950/60';

              const badgeTheme = isClass
                ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                : isQuiz
                ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                : 'bg-amber-950/70 text-amber-300 border-amber-800/60';

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all ${borderTheme} ${
                    isHappeningNow ? 'ring-1 ring-white shadow-md' : ''
                  } ${isPast || item.isCompleted ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Checkbox for tasks or number for classes */}
                      <div className="pt-0.5">
                        {!isClass && item.rawTask ? (
                          <button
                            type="button"
                            onClick={() => onToggleTaskCompleted(item.rawTask!.id)}
                            title={item.isCompleted ? 'Mark as pending' : 'Mark as completed'}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <div className="w-5 h-5 rounded-md border-2 border-zinc-600 hover:border-emerald-400" />
                            )}
                          </button>
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isClass ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${badgeTheme}`}
                          >
                            {item.kind}
                          </span>

                          {isHappeningNow && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Happening Now
                            </span>
                          )}

                          {isWithin5Min && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-red-950 text-red-300 border border-red-800/60 flex items-center gap-1">
                              <Bell className="w-3 h-3 text-red-400 animate-bounce" />
                              Starts in 5m
                            </span>
                          )}

                          {isPast && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-800 text-zinc-400">
                              Passed
                            </span>
                          )}

                          {item.isCompleted && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                              Done
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-sm sm:text-base font-bold text-white ${
                            item.isCompleted ? 'line-through text-zinc-500' : ''
                          }`}
                        >
                          {item.title}
                        </h4>

                        {item.subject && item.subject !== item.title && (
                          <p className="text-xs text-zinc-400 font-medium">Course: {item.subject}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 pt-1">
                          <span className="flex items-center gap-1 font-mono font-medium text-zinc-200">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {formatTime12H(item.startTime)}
                            {item.endTime && ` – ${formatTime12H(item.endTime)}`}
                          </span>

                          {item.room && (
                            <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-200 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              Room: {item.room}
                            </span>
                          )}

                          {item.notes && (
                            <span className="flex items-center gap-1 bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onTriggerManualAlert(item)}
                        title="Test 5-min alarm on this item"
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      {isClass && item.rawClass && (
                        <button
                          type="button"
                          onClick={() => onEditClass(item.rawClass!)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}

                      {!isClass && item.rawTask && (
                        <button
                          type="button"
                          onClick={() => onEditTask(item.rawTask!)}
                          className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
