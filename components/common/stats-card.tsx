"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string | number;
  };
  variant?: "default" | "critical" | "urgent" | "stable" | "primary";
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  default: {
    icon: "bg-gray-100 text-gray-600",
    card: "",
  },
  critical: {
    icon: "bg-red-100 text-red-600",
    card: "border-l-4 border-l-red-500",
  },
  urgent: {
    icon: "bg-yellow-100 text-yellow-600",
    card: "border-l-4 border-l-yellow-500",
  },
  stable: {
    icon: "bg-green-100 text-green-600",
    card: "border-l-4 border-l-green-500",
  },
  primary: {
    icon: "bg-blue-100 text-blue-600",
    card: "border-l-4 border-l-blue-500",
  },
};

const trendStyles = {
  up: { icon: ArrowUp, color: "text-green-600" },
  down: { icon: ArrowDown, color: "text-red-600" },
  neutral: { icon: Minus, color: "text-gray-500" },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = "default",
  onClick,
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const TrendIcon = trend ? trendStyles[trend.direction].icon : null;

  return (
    <Card
      className={cn(
        "transition-all",
        styles.card,
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", styles.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && TrendIcon && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                trendStyles[trend.direction].color
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
