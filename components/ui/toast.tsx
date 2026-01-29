"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: (id: string) => void;
}

const variantConfig = {
  default: {
    icon: null,
    className: "bg-white border-gray-200",
  },
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200",
    iconClass: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200",
    iconClass: "text-yellow-600",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-600",
  },
};

function Toast({
  id,
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
        config.className
      )}
    >
      {Icon && (
        <Icon className={cn("h-5 w-5 shrink-0", (config as typeof variantConfig.success).iconClass)} />
      )}
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-medium text-gray-900">{title}</p>}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="shrink-0 rounded-md p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close notification"
          title="Close"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

// Toast Context
interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto dismiss
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

export { Toast };
