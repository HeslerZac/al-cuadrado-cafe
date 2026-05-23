import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../utils/cn';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: number;
  type: NotificationType;
  message: string;
};

type NotificationContextValue = {
  notify: (type: NotificationType, message: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = Date.now() + Math.random();
    setNotifications((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const remove = (id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => notify('error', String(message ?? 'Ocurrio un error.'));
    return () => {
      window.alert = originalAlert;
    };
  }, [notify]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              className="overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur"
            >
              <div className="flex items-start gap-3 p-4">
                <div className={cn(
                  'mt-0.5 rounded-xl p-2',
                  notification.type === 'success' && 'bg-emerald-50 text-emerald-600',
                  notification.type === 'error' && 'bg-rose-50 text-rose-600',
                  notification.type === 'info' && 'bg-sky-50 text-sky-600',
                )}>
                  {notification.type === 'success' && <CheckCircle2 size={18} />}
                  {notification.type === 'error' && <AlertCircle size={18} />}
                  {notification.type === 'info' && <Info size={18} />}
                </div>
                <p className="flex-1 text-sm font-semibold leading-relaxed text-slate-800">{notification.message}</p>
                <button
                  type="button"
                  onClick={() => remove(notification.id)}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Cerrar notificacion"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
