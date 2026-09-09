import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ClassItem,
  AcademicTask,
  TodayItem,
  DayOfWeek,
  TriggeredAlert,
  TaskType,
} from './types';
import {
  PRELOADED_CLASSES,
  getDefaultTasks,
} from './data/preloadData';
import {
  checkNotificationSupport,
  requestNotificationPermission,
  sendBrowserNotification,
  NotificationStatus,
} from './utils/notifications';
import {
  playChimeSound,
  triggerFullAlarm,
  unlockAudioContext,
} from './utils/audio';
import {
  getTodayItems,
  getTodayDayOfWeek,
  formatToDateString,
  formatTime12H,
  parseTimeToTodayDate,
  parseDateTime,
} from './utils/time';
import { Navbar } from './components/Navbar';
import { TodayView } from './components/TodayView';
import { TimetableView } from './components/TimetableView';
import { UpcomingView } from './components/UpcomingView';
import { ClassModal } from './components/ClassModal';
import { TaskModal } from './components/TaskModal';
import { ActiveAlertModal } from './components/ActiveAlertModal';
import {
  Bell,
  Volume2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY_CLASSES = 'academic_schedule_classes_v1';
const STORAGE_KEY_TASKS = 'academic_schedule_tasks_v1';
const STORAGE_KEY_ALERTED = 'academic_schedule_alerted_v1';
const STORAGE_KEY_SOUND = 'academic_schedule_sound_v1';

export default function App() {
  // Navigation active tab: 'today' | 'timetable' | 'upcoming'
  const [activeTab, setActiveTab] = useState<'today' | 'timetable' | 'upcoming'>('today');

  // Real-time clock updated every second
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Data state with LocalStorage persistence
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved classes from localStorage', e);
    }
    return PRELOADED_CLASSES;
  });

  const [tasks, setTasks] = useState<AcademicTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved tasks from localStorage', e);
    }
    return getDefaultTasks();
  });

  // Alerted item tracking keys to prevent duplicate alerting
  const [alertedKeys, setAlertedKeys] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse alerted keys', e);
    }
    return {};
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  // Notification API status
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>({
    supported: false,
    permission: 'default',
  });

  // Active in-app alerts (shown in modal / top popup)
  const [activeAlerts, setActiveAlerts] = useState<TriggeredAlert[]>([]);

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [initialClassDay, setInitialClassDay] = useState<DayOfWeek | undefined>(undefined);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AcademicTask | null>(null);
  const [defaultTaskType, setDefaultTaskType] = useState<TaskType>('Quiz');

  // Toast banner for feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Error saving classes to storage', e);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to storage', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTED, JSON.stringify(alertedKeys));
    } catch (e) {
      console.error('Error saving alerted keys to storage', e);
    }
  }, [alertedKeys]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, soundEnabled ? 'true' : 'false');
    } catch {}
  }, [soundEnabled]);

  // Request notification permission on initial load as required
  useEffect(() => {
    const status = checkNotificationSupport();
    setNotificationStatus(status);

    if (status.supported && status.permission === 'default') {
      requestNotificationPermission().then((perm) => {
        setNotificationStatus({
          supported: true,
          permission: perm,
        });
      });
    }

    // Unlock Web Audio context on user's first interaction
    const handleFirstInteraction = () => {
      unlockAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Clock interval: updates every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Main Alert Check Routine:
   * Runs every 30 seconds (and also when items change)
   * Evaluates:
   * 1. 5-minute pre-alert for classes recurring today
   * 2. 5-minute pre-alert for one-time tasks (quizzes & assignments)
   * 3. Marks tasks as expired/done once their scheduled time has passed
   */
  const checkSchedulesAndAlerts = useCallback(() => {
    const now = new Date();
    const nowMs = now.getTime();
    const todayDay = getTodayDayOfWeek(now);
    const todayDateStr = formatToDateString(now);

    const newAlerts: TriggeredAlert[] = [];
    const newAlertedKeys = { ...alertedKeys };
    let tasksUpdated = false;
    const updatedTasks = tasks.map((task) => ({ ...task }));

    // 1. Check Recurring Classes for Today
    for (const c of classes) {
      if (c.day === todayDay) {
        const classStart = parseTimeToTodayDate(c.startTime, now);
        const classStartMs = classStart.getTime();
        const triggerTimeMs = classStartMs - 5 * 60 * 1000; // exactly 5 minutes before start
        const alertKey = `class_${c.id}_${todayDateStr}`;

        // Alert window: between 5 minutes before and start time
        // Give a generous 75s window or any time in the 5 minutes if not yet alerted
        if (nowMs >= triggerTimeMs && nowMs < classStartMs) {
          if (!newAlertedKeys[alertKey]) {
            newAlertedKeys[alertKey] = nowMs;

            const timeLabel = `${formatTime12H(c.startTime)} – ${formatTime12H(c.endTime)}`;
            newAlerts.push({
              id: `${alertKey}_${Date.now()}`,
              type: 'Class',
              title: c.subject,
              subject: c.subject,
              time: timeLabel,
              room: c.room,
              notes: c.notes,
              triggeredAt: nowMs,
            });

            // Dispatch browser notification
            sendBrowserNotification({
              type: 'Class',
              title: c.subject,
              subject: c.subject,
              room: c.room,
              time: timeLabel,
              notes: c.notes,
            });
          }
        }
      }
    }

    // 2. Check One-time Tasks (Quizzes & Assignments)
    for (let i = 0; i < updatedTasks.length; i++) {
      const task = updatedTasks[i];
      if (task.completed) continue;

      const taskDateTime = parseDateTime(task.date, task.time);
      const taskTimeMs = taskDateTime.getTime();
      const triggerTimeMs = taskTimeMs - 5 * 60 * 1000;
      const alertKey = `task_${task.id}_${task.date}_${task.time}`;

      // Check if task has already passed
      if (nowMs >= taskTimeMs) {
        if (!task.expired) {
          task.expired = true;
          tasksUpdated = true;
        }
        continue;
      }

      // Check if in 5-minute pre-alert window
      if (nowMs >= triggerTimeMs && nowMs < taskTimeMs) {
        if (!newAlertedKeys[alertKey]) {
          newAlertedKeys[alertKey] = nowMs;

          const timeLabel = formatTime12H(task.time);
          newAlerts.push({
            id: `${alertKey}_${Date.now()}`,
            type: task.type,
            title: task.title,
            subject: task.subject,
            time: timeLabel,
            room: task.room,
            notes: task.notes,
            triggeredAt: nowMs,
          });

          // Dispatch browser notification
          sendBrowserNotification({
            type: task.type,
            title: task.title,
            subject: task.subject,
            room: task.room,
            time: timeLabel,
            notes: task.notes,
          });
        }
      }
    }

    if (tasksUpdated) {
      setTasks(updatedTasks);
    }

    if (newAlerts.length > 0) {
      // Play audible alarm sound if sound is enabled
      if (soundEnabled) {
        triggerFullAlarm();
      }
      setAlertedKeys(newAlertedKeys);
      setActiveAlerts((prev) => [...prev, ...newAlerts]);
    }
  }, [classes, tasks, alertedKeys, soundEnabled]);

  // Background timer: runs every 30 seconds to evaluate scheduled items
  useEffect(() => {
    checkSchedulesAndAlerts();
    const interval = setInterval(() => {
      checkSchedulesAndAlerts();
    }, 30000); // 30 seconds interval as per technical requirements
    return () => clearInterval(interval);
  }, [checkSchedulesAndAlerts]);

  // Handle manual alert test
  const handleTriggerManualAlert = (item: TodayItem | AcademicTask) => {
    unlockAudioContext();
    if (soundEnabled) {
      playChimeSound(0.8);
    }

    const isTask = 'type' in item && (item.type === 'Quiz' || item.type === 'Assignment');
    const type = isTask ? (item as AcademicTask).type : (item as TodayItem).kind;
    const title = isTask ? (item as AcademicTask).title : (item as TodayItem).title;
    const subject = item.subject;
    const time = isTask
      ? formatTime12H((item as AcademicTask).time)
      : `${formatTime12H((item as TodayItem).startTime)}${
          (item as TodayItem).endTime ? ` - ${formatTime12H((item as TodayItem).endTime!)}` : ''
        }`;
    const room = item.room;
    const notes = item.notes;

    sendBrowserNotification({
      type,
      title,
      subject,
      room,
      time,
      notes,
    });

    setActiveAlerts((prev) => [
      ...prev,
      {
        id: `manual_${Date.now()}`,
        type,
        title,
        subject,
        time,
        room,
        notes,
        triggeredAt: Date.now(),
      },
    ]);

    showToast(`Triggered test alarm for ${title}`);
  };

  // Sound testing
  const handleTestSound = () => {
    unlockAudioContext();
    playChimeSound(0.85);
    showToast('Testing 5-minute pre-alert chime sound');
  };

  // Notification permission request
  const handleRequestNotification = async () => {
    const result = await requestNotificationPermission();
    setNotificationStatus({
      supported: true,
      permission: result,
    });
    if (result === 'granted') {
      showToast('Browser notifications enabled successfully!');
      sendBrowserNotification({
        type: 'Class',
        title: 'Notifications Active',
        subject: 'Academic Reminders',
        time: 'Ready',
        notes: 'You will receive 5-minute pre-alerts for classes, quizzes, and assignments.',
      });
    } else if (result === 'denied') {
      showToast('Notifications blocked in browser settings. In-app audio alerts remain active.');
    }
  };

  // Class Management Handlers
  const handleSaveClass = (classData: Omit<ClassItem, 'id'>, id?: string) => {
    if (id) {
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? { ...classData, id } : c))
      );
      showToast(`Updated recurring class: ${classData.subject}`);
    } else {
      const newClass: ClassItem = {
        ...classData,
        id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setClasses((prev) => [...prev, newClass]);
      showToast(`Added recurring class: ${classData.subject}`);
    }
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    showToast('Class deleted from schedule');
  };

  const handleResetToPreloaded = () => {
    setClasses(PRELOADED_CLASSES);
    showToast('Reset schedule to Section A Spring 2023 timetable');
  };

  // Task Management Handlers
  const handleSaveTask = (taskData: Omit<AcademicTask, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...taskData } : t))
      );
      showToast(`Updated ${taskData.type}: ${taskData.title}`);
    } else {
      const newTask: AcademicTask = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, newTask]);
      showToast(`Added new ${taskData.type}: ${taskData.title}`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted');
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Dismiss in-app alerts
  const handleDismissAlert = (alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleDismissAllAlerts = () => {
    setActiveAlerts([]);
  };

  // Compile today's items
  const todayItems = getTodayItems(classes, tasks, currentTime);

  // Active upcoming tasks count
  const upcomingCount = tasks.filter((t) => !t.completed && !t.expired).length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans antialiased">
      {/* Active 5-minute pre-alert modal */}
      <ActiveAlertModal
        alerts={activeAlerts}
        onDismiss={handleDismissAlert}
        onDismissAll={handleDismissAllAlerts}
      />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationStatus={notificationStatus}
        onRequestNotification={handleRequestNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onTestSound={handleTestSound}
        onOpenAddClass={() => {
          setEditingClass(null);
          setInitialClassDay(undefined);
          setIsClassModalOpen(true);
        }}
        onOpenAddTask={(type) => {
          setEditingTask(null);
          setDefaultTaskType(type || 'Quiz');
          setIsTaskModalOpen(true);
        }}
        todayCount={todayItems.length}
        upcomingCount={upcomingCount}
        currentTime={currentTime}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-black px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-200 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Subtle Preload Information Badge Banner */}
        <div className="mb-6 bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="font-bold text-white">
              Spring 2023 BBA-8AB Preloaded Schedule:
            </span>
            <span className="text-zinc-400 hidden md:inline">
              MGT401 (Wed), LSM506 &amp; LSM507 (Fri), MGT501 &amp; MGT461 (Sat)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-400">
              Alarm window: <strong className="text-white">T - 5 minutes</strong>
            </span>
            <button
              type="button"
              onClick={handleTestSound}
              className="text-white hover:text-zinc-300 font-bold underline underline-offset-2"
            >
              Test Audio
            </button>
          </div>
        </div>

        {/* View Switching */}
        {activeTab === 'today' && (
          <TodayView
            todayItems={todayItems}
            currentTime={currentTime}
            onOpenAddClass={() => {
              setEditingClass(null);
              setInitialClassDay(undefined);
              setIsClassModalOpen(true);
            }}
            onOpenAddTask={(type) => {
              setEditingTask(null);
              setDefaultTaskType(type || 'Quiz');
              setIsTaskModalOpen(true);
            }}
            onToggleTaskCompleted={handleToggleTaskCompleted}
            onTriggerManualAlert={handleTriggerManualAlert}
            onEditClass={(c) => {
              setEditingClass(c);
              setIsClassModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            classes={classes}
            onOpenAddClass={(day) => {
              setEditingClass(null);
              setInitialClassDay(day);
              setIsClassModalOpen(true);
            }}
            onEditClass={(c) => {
              setEditingClass(c);
              setIsClassModalOpen(true);
            }}
            onDeleteClass={handleDeleteClass}
            onResetToPreloaded={handleResetToPreloaded}
            currentTime={currentTime}
          />
        )}

        {activeTab === 'upcoming' && (
          <UpcomingView
            tasks={tasks}
            onOpenAddTask={(type) => {
              setEditingTask(null);
              setDefaultTaskType(type || 'Quiz');
              setIsTaskModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleCompleted={handleToggleTaskCompleted}
            onTriggerManualAlert={handleTriggerManualAlert}
            currentTime={currentTime}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Department of Management Sciences</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">Spring 2023 - BBA-8AB Section A</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Local Storage Persistent</span>
            <span className="text-zinc-700">•</span>
            <span>Web Audio 5-Min Chime</span>
          </div>
        </div>
      </footer>

      {/* Class Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        initialClass={editingClass}
        initialDay={initialClassDay}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultType={defaultTaskType}
      />
    </div>
  );
}
