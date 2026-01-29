"use client";

import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG } from "@/lib/constants";
import type { PriorityLevel } from "@/lib/types";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function PriorityBadge({
  priority,
  size = "md",
  showIcon = true,
  className,
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
