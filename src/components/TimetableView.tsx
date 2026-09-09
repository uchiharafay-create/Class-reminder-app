import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ClassItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { formatTime12H, getTodayDayOfWeek } from '../utils/time';

interface TimetableViewProps {
  classes: ClassItem[];
  onOpenAddClass: (initialDay?: DayOfWeek) => void;
  onEditClass: (classItem: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onResetToPreloaded: () => void;
  currentTime: Date;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  classes,
  onOpenAddClass,
  onEditClass,
  onDeleteClass,
  onResetToPreloaded,
  currentTime,
}) => {
  const todayDay = getTodayDayOfWeek(currentTime);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('All');
  const [displayMode, setDisplayMode] = useState<'grid' | 'days'>('grid');

  const activeDays = DAYS_OF_WEEK;

  // Group classes by day
  const classesByDay: Record<DayOfWeek, ClassItem[]> = activeDays.reduce((acc, day) => {
    acc[day] = classes
      .filter((c) => c.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, ClassItem[]>);

  const totalClasses = classes.length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              <h2 className="text-xl font-bold text-white tracking-tight">Weekly Class Timetable</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                Class Schedule (Blue)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Section A • Spring 2023 BBA-8AB recurring timetable. Automated 5-minute pre-alerts before class.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                type="button"
                id="btn-view-grid"
                onClick={() => setDisplayMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  displayMode === 'grid'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Full Week Grid</span>
              </button>
              <button
                type="button"
                id="btn-view-days"
                onClick={() => setDisplayMode('days')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  displayMode === 'days'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Day Cards</span>
              </button>
            </div>

            <button
              type="button"
              id="btn-reset-schedule"
              onClick={() => {
                if (window.confirm('Reset schedule to the default Section A Spring 2023 timetable?')) {
                  onResetToPreloaded();
                }
              }}
              title="Reset to preloaded Section A schedule"
              className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              id="btn-add-class"
              onClick={() => onOpenAddClass(selectedDay !== 'All' ? selectedDay : undefined)}
              className="px-3 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Add Recurring Class</span>
            </button>
          </div>
        </div>

        {/* Day Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-zinc-800 pb-1">
          <button
            type="button"
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedDay === 'All'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            All Days ({totalClasses})
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = classesByDay[day]?.length || 0;
            const isToday = day === todayDay;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-white text-black shadow-xs font-bold'
                    : isToday
                    ? 'bg-zinc-800 text-white border border-zinc-600 hover:bg-zinc-750'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-200'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-black' : 'bg-white'
                    }`}
                  />
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-zinc-200 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid or Day Cards Display */}
      {displayMode === 'grid' && selectedDay === 'All' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayClasses = classesByDay[day] || [];
            const isToday = day === todayDay;

            return (
              <div
                key={day}
                className={`rounded-2xl border bg-zinc-900 p-4 transition-all flex flex-col ${
                  isToday
                    ? 'border-zinc-500 ring-1 ring-white/30 shadow-md'
                    : 'border-zinc-800'
                }`}
              >
                {/* Day Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{day}</h3>
                    {isToday && (
                      <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide bg-white text-black rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenAddClass(day)}
                    title={`Add class on ${day}`}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Classes */}
                {dayClasses.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-zinc-500">
                    <p className="text-xs">No classes scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 flex-1">
                    {dayClasses.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 hover:border-blue-500/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-300">
                              <Clock className="w-3.5 h-3.5 text-blue-400" />
                              <span>{formatTime12H(item.startTime)} – {formatTime12H(item.endTime)}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                              {item.subject}
                            </h4>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditClass(item)}
                              title="Edit class"
                              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${item.subject} on ${item.day}?`)) {
                                  onDeleteClass(item.id);
                                }
                              }}
                              title="Delete class"
                              className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 bg-zinc-850 px-1.5 py-0.5 rounded font-bold text-zinc-200 border border-zinc-750">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            Room {item.room}
                          </span>
                          {item.notes && (
                            <span className="text-zinc-400 truncate max-w-[120px]" title={item.notes}>
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List by Day */
        <div className="space-y-4">
          {(selectedDay === 'All' ? DAYS_OF_WEEK : [selectedDay]).map((day) => {
            const dayClasses = classesByDay[day] || [];
            const isToday = day === todayDay;

            if (selectedDay === 'All' && dayClasses.length === 0) {
              return null;
            }

            return (
              <div
                key={day}
                className={`bg-zinc-900 rounded-2xl border p-5 shadow-sm transition-all ${
                  isToday ? 'border-zinc-500 ring-1 ring-white/20' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{day}</h3>
                    {isToday && (
                      <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-white text-black rounded">
                        Today
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      • {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAddClass(day)}
                    className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Class</span>
                  </button>
                </div>

                {dayClasses.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    No classes scheduled for {day}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dayClasses.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800/60 mb-1.5">
                              Class
                            </span>
                            <h4 className="text-sm font-bold text-white">{item.subject}</h4>
                            {item.section && (
                              <p className="text-xs text-zinc-400">{item.section}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditClass(item)}
                              title="Edit class"
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${item.subject} on ${item.day}?`)) {
                                  onDeleteClass(item.id);
                                }
                              }}
                              title="Delete class"
                              className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-1 font-mono font-bold text-blue-300">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            {formatTime12H(item.startTime)} – {formatTime12H(item.endTime)}
                          </span>

                          <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-200 border border-zinc-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            Room: {item.room}
                          </span>
                        </div>

                        {item.notes && (
                          <div className="mt-2 text-xs text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800">
                            <span className="font-semibold text-zinc-300">Note: </span>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
