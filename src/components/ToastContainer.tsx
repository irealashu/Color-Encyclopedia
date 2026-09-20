import React from 'react';
import { ToastMessage } from '../types';
import { Copy, Heart, Download, Info, CheckCircle2, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toast.type === 'copy' ? Copy :
          toast.type === 'favorite' ? Heart :
          toast.type === 'download' ? Download :
          toast.type === 'success' ? CheckCircle2 : Info;

        const iconColor = toast.type === 'favorite' ? 'text-rose-500' :
          toast.type === 'download' ? 'text-emerald-500' :
          toast.type === 'copy' ? 'text-blue-500' : 'text-amber-500';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-950/10 dark:shadow-black/40 animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all"
          >
            <div className={`mt-0.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {toast.title}
              </p>
              {toast.detail && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-mono">
                  {toast.detail}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
