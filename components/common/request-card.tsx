"use client";

import { cn } from "@/lib/utils";
import { formatPatientInfo, formatTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { SLATimer } from "./sla-timer";
import type { ConsultationRequest, Case, Patient, User } from "@/lib/types";
import { Eye, Check, ArrowRight, User as UserIcon } from "lucide-react";

interface RequestCardProps {
  request: ConsultationRequest & {
    case?: Case & { patient?: Patient };
    requester?: User;
    assigned_consultant?: User;
    target_department?: { name: string };
  };
  onView?: (id?: string) => void;
  onAcknowledge?: () => void;
  onTakeOwnership?: () => void;
  onForward?: () => void;
  onComplete?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function RequestCard({
  request,
  onView,
  onAcknowledge,
  onTakeOwnership,
  onForward,
  onComplete,
  showActions = true,
  compact = false,
  className,
}: RequestCardProps) {
  const patient = request.case?.patient;
  const patientInfo = patient
    ? formatPatientInfo(patient.full_name, patient.age, patient.gender)
    : "Unknown Patient";

  const hasSLA = request.sla_deadline && request.status === "pending";
  const canAcknowledge = request.status === "pending" && onAcknowledge;
  const canTakeOwnership = request.status === "acknowledged" && onTakeOwnership;
  const canComplete = request.status === "in_progress" && onComplete;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow border-l-4",
        request.urgency === "critical" && "border-l-red-500",
        request.urgency === "urgent" && "border-l-yellow-500",
        request.urgency === "stable" && "border-l-green-500",
        request.sla_breached && "ring-2 ring-red-200",
        className
      )}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={request.urgency} size="sm" />
            <span className="font-mono text-sm text-gray-600">
              {request.request_number}
            </span>
          </div>
          {hasSLA && (
            <SLATimer deadline={request.sla_deadline!} size="sm" />
          )}
          {request.sla_breached && (
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
              SLA BREACHED
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-medium text-gray-900 mb-1">{request.title}</h4>

        {/* Case and Patient Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="font-mono">{request.case?.case_number}</span>
          <span>•</span>
          <span>{patientInfo}</span>
        </div>

        {/* Description (if not compact) */}
        {request.description && !compact && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {request.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            <span>
              From: {request.requester?.full_name || "Unknown"}
            </span>
          </div>
          <span>•</span>
          <span>{formatTime(request.requested_at)}</span>
          {request.target_department && (
            <>
              <span>•</span>
              <span>{request.target_department.name}</span>
            </>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Status:</span>
          <StatusBadge status={request.status} type="request" size="sm" />
        </div>

        {/* Assigned Consultant */}
        {request.assigned_consultant && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
            <UserIcon className="h-3 w-3" />
            <span>Assigned to: {request.assigned_consultant.full_name}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && !compact && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => onView?.(request.id)}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>

            {canAcknowledge && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onAcknowledge}
              >
                <Check className="h-3 w-3 mr-1" />
                Acknowledge
              </Button>
            )}

            {canTakeOwnership && (
              <Button size="sm" onClick={onTakeOwnership}>
                Take Ownership
              </Button>
            )}

            {canComplete && (
              <Button variant="success" size="sm" onClick={onComplete}>
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}

            {onForward && request.status !== "completed" && (
              <Button variant="ghost" size="sm" onClick={onForward}>
                <ArrowRight className="h-3 w-3 mr-1" />
                Forward
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
