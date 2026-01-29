"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getRemainingTime } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

export interface SLATimerProps {
  deadline: string | Date;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  onBreach?: () => void;
  className?: string;
  compact?: boolean;
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function SLATimer({
  deadline,
  size = "md",
  showIcon = true,
  onBreach,
  className,
  compact = false,
}: SLATimerProps) {
  const [timeInfo, setTimeInfo] = useState(() => getRemainingTime(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      const newInfo = getRemainingTime(deadline);
      setTimeInfo(newInfo);

      // Trigger breach callback once when SLA is breached
      if (newInfo.expired && !timeInfo.expired && onBreach) {
        onBreach();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onBreach, timeInfo.expired]);

  const statusColors = {
    safe: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    expired: "text-red-700 font-semibold",
  };

  const Icon = timeInfo.expired ? AlertTriangle : Clock;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        statusColors[timeInfo.status],
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size])} />}
      <span>{timeInfo.text}</span>
    </div>
  );
}
