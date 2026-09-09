import React from 'react';
import { Bell, MapPin, Clock, X, Volume2, FileText } from 'lucide-react';
import { TriggeredAlert } from '../types';
import { formatTime12H } from '../utils/time';

interface ActiveAlertModalProps {
  alerts: TriggeredAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
}

export const ActiveAlertModal: React.FC<ActiveAlertModalProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-800 animate-in zoom-in-95 duration-200">
        {/* Header with pulsating alert style */}
        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-zinc-950 text-white p-5 flex items-center justify-between border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-red-200 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-ping" />
                5-Minute Pre-Event Alert!
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-tight text-white">
                {alerts.length === 1 ? 'Starting in 5 Minutes' : `${alerts.length} Events Starting Soon`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissAll}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of active alerts */}
        <div className="p-5 divide-y divide-zinc-800 max-h-[60vh] overflow-y-auto">
          {alerts.map((alert) => {
            const isClass = alert.type === 'Class';
            const isQuiz = alert.type === 'Quiz';

            return (
              <div key={alert.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isClass
                            ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                            : isQuiz
                            ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border-amber-800/60'
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        At {formatTime12H(alert.time)}
                      </span>
                    </div>

                    {/* Title & Subject */}
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {alert.title || alert.subject}
                    </h4>
                    {alert.title && alert.subject && alert.title !== alert.subject && (
                      <p className="text-xs font-medium text-zinc-400">Course: {alert.subject}</p>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 pt-1">
                      {alert.room && (
                        <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded text-zinc-200 font-medium border border-zinc-700">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          Room: {alert.room}
                        </span>
                      )}
                      {alert.notes && (
                        <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-amber-300">
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          Note: {alert.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dismiss Single */}
                  <button
                    type="button"
                    onClick={() => onDismiss(alert.id)}
                    className="shrink-0 text-xs font-medium text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Volume2 className="w-4 h-4 text-zinc-500" />
            <span>Alarm audio played &amp; notification sent</span>
          </div>
          <button
            type="button"
            onClick={onDismissAll}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Acknowledge &amp; Silence
          </button>
        </div>
      </div>
    </div>
  );
};
