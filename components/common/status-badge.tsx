"use client";

import { cn } from "@/lib/utils";
import { 
  CASE_STATUS_CONFIG, 
  REQUEST_STATUS_CONFIG, 
  ALERT_STATUS_CONFIG 
} from "@/lib/constants";
import type { CaseStatus, RequestStatus, AlertStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: CaseStatus | RequestStatus | AlertStatus;
  type?: "case" | "request" | "alert";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function StatusBadge({
  status,
  type = "case",
  size = "md",
  className,
}: StatusBadgeProps) {
  const configMap = {
    case: CASE_STATUS_CONFIG,
    request: REQUEST_STATUS_CONFIG,
    alert: ALERT_STATUS_CONFIG,
  };

  const config = configMap[type][status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
