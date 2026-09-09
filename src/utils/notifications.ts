// Browser Notification API helper

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
}

export function checkNotificationSupport(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return { supported: true, permission: Notification.permission };
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export interface ScheduledNotificationPayload {
  type: 'Class' | 'Quiz' | 'Assignment';
  title: string;
  subject: string;
  room?: string;
  time: string;
  notes?: string;
}

export function sendBrowserNotification(payload: ScheduledNotificationPayload): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const titleText = `⏰ 5 min alert: ${payload.type} - ${payload.title || payload.subject}`;
    const roomLine = payload.room ? `• Room: ${payload.room}\n` : '';
    const notesLine = payload.notes ? `• Note: ${payload.notes}\n` : '';

    const bodyText = `Subject: ${payload.subject}\nTime: ${payload.time}\n${roomLine}${notesLine}Starts in 5 minutes!`;

    const notification = new Notification(titleText, {
      body: bodyText,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `academic-alert-${payload.type}-${payload.title}-${payload.time}-${Date.now()}`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to dispatch browser notification:', err);
    return false;
  }
}
