import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  CheckSquare,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { NotificationStatus } from '../utils/notifications';

interface NavbarProps {
  activeTab: 'today' | 'timetable' | 'upcoming';
  setActiveTab: (tab: 'today' | 'timetable' | 'upcoming') => void;
  notificationStatus: NotificationStatus;
  onRequestNotification: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTestSound: () => void;
  onOpenAddClass: () => void;
  onOpenAddTask: (type?: 'Quiz' | 'Assignment') => void;
  todayCount: number;
  upcomingCount: number;
  currentTime: Date;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notificationStatus,
  onRequestNotification,
  soundEnabled,
  onToggleSound,
  onTestSound,
  onOpenAddClass,
  onOpenAddTask,
  todayCount,
  upcomingCount,
  currentTime,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDay = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 shadow-sm">
      {/* Top Banner / Info Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Section Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black shadow-xs">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Schedule<span className="text-zinc-400 font-light">Desk</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-700">
                  Section A • BBA-8AB
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Spring 2023 Timetable &amp; 5-Min Reminders
              </p>
            </div>
          </div>

          {/* Current Live Time & Alert Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formattedDay}</span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono font-semibold text-white">{formattedTime}</span>
            </div>

            {/* Sound Toggle & Test */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              <button
                type="button"
                id="btn-toggle-sound"
                onClick={onToggleSound}
                title={soundEnabled ? 'Alarm Sound: Enabled (click to mute)' : 'Alarm Sound: Muted (click to enable)'}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                  soundEnabled
                    ? 'text-white bg-zinc-800 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden lg:inline text-xs">{soundEnabled ? 'Sound On' : 'Muted'}</span>
              </button>

              <button
                type="button"
                id="btn-test-chime"
                onClick={onTestSound}
                title="Test 5-min alarm chime"
                className="px-2 py-1 text-xs text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
              >
                Test Chime
              </button>
            </div>

            {/* Notification Permission Button */}
            {notificationStatus.supported && (
              <button
                type="button"
                id="btn-notification-perm"
                onClick={onRequestNotification}
                title={
                  notificationStatus.permission === 'granted'
                    ? 'Browser Notifications are Active'
                    : 'Click to enable Browser Notifications'
                }
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                  notificationStatus.permission === 'granted'
                    ? 'bg-zinc-900 text-emerald-400 border-emerald-900/50 hover:bg-zinc-850'
                    : notificationStatus.permission === 'denied'
                    ? 'bg-zinc-900 text-amber-400 border-amber-900/50'
                    : 'bg-zinc-100 text-black border-white hover:bg-white animate-pulse font-semibold'
                }`}
              >
                {notificationStatus.permission === 'granted' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Alerts Enabled</span>
                  </>
                ) : notificationStatus.permission === 'denied' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Alerts Blocked</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-black" />
                    <span>Enable Alerts</span>
                  </>
                )}
              </button>
            )}

            {/* Add Action Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="btn-quick-add"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold px-3 py-2 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 text-black" />
                <span className="hidden sm:inline">Add Item</span>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 py-1.5 z-20 text-zinc-200 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Create Academic Item
                    </div>
                    <button
                      type="button"
                      id="menu-add-class"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAddClass();
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                      <div>
                        <div className="font-semibold text-white">Recurring Class</div>
                        <div className="text-[11px] text-zinc-400">Weekly lecture / lab</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="menu-add-quiz"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAddTask('Quiz');
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <div>
                        <div className="font-semibold text-white">Upcoming Quiz</div>
                        <div className="text-[11px] text-zinc-400">Test or midterm (Red)</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      id="menu-add-assignment"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAddTask('Assignment');
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-zinc-800 text-zinc-200 hover:text-white"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <div>
                        <div className="font-semibold text-white">Assignment Deadline</div>
                        <div className="text-[11px] text-zinc-400">Project or homework (Orange)</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-zinc-800/80">
          <button
            type="button"
            id="tab-today"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'today'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'today'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-timetable"
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'timetable'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Timetable</span>
          </button>

          <button
            type="button"
            id="tab-upcoming"
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Upcoming Quizzes &amp; Tasks</span>
            {upcomingCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'upcoming'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {upcomingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
