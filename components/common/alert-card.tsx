"use client";

import { cn } from "@/lib/utils";
import { formatTime, getRelativeTime } from "@/lib/utils";
import { ALERT_TYPE_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import type { Alert, Case, User } from "@/lib/types";
import { Check, Eye, ArrowRight, X } from "lucide-react";

interface AlertCardProps {
  alert: Alert & {
    case?: Case;
    target_user?: User;
  };
  onView?: () => void;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onForward?: () => void;
  onDismiss?: (alertId?: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function AlertCard({
  alert,
  onView,
  onAcknowledge,
  onResolve,
  onForward,
  onDismiss,
  showActions = true,
  compact = false,
  className,
}: AlertCardProps) {
  const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type] || {
    label: alert.alert_type,
    icon: "Bell",
    color: "text-gray-500",
  };

  const isPending = alert.status === "pending";
  const isResolved = alert.status === "resolved";

  return (
    <Card
      className={cn(
        "transition-all",
        isPending && "border-l-4",
        isPending && alert.priority === "critical" && "border-l-red-500 bg-red-50/30",
        isPending && alert.priority === "urgent" && "border-l-yellow-500 bg-yellow-50/30",
        isPending && alert.priority === "stable" && "border-l-blue-500",
        isResolved && "opacity-60",
        className
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium uppercase", typeConfig.color)}>
              {typeConfig.label}
            </span>
            <PriorityBadge priority={alert.priority} size="sm" />
          </div>
          <span className="text-xs text-gray-400">
            {getRelativeTime(alert.created_at)}
          </span>
        </div>

        {/* Title & Message */}
        <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
        {alert.message && !compact && (
          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
        )}

        {/* Case reference */}
        {alert.case && (
          <div className="text-xs text-gray-500 mb-3">
            Case: <span className="font-mono">{alert.case.case_number}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && !compact && !isResolved && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}

            {isPending && onAcknowledge && (
              <Button variant="secondary" size="sm" onClick={onAcknowledge}>
                <Check className="h-3 w-3 mr-1" />
                Acknowledge
              </Button>
            )}

            {!isResolved && onResolve && (
              <Button variant="success" size="sm" onClick={onResolve}>
                <Check className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}

            {onForward && (
              <Button variant="ghost" size="sm" onClick={onForward}>
                <ArrowRight className="h-3 w-3 mr-1" />
                Forward
              </Button>
            )}

            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={() => onDismiss?.(alert.id)}>
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
