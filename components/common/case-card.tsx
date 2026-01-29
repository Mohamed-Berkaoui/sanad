"use client";

import { cn } from "@/lib/utils";
import { formatPatientInfo, formatTime, getRelativeTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import type { Case, Patient } from "@/lib/types";
import { Clock, FileText, CheckCircle, Loader2 } from "lucide-react";

interface CaseCardProps {
  caseData: Case & { patient?: Patient };
  requestsCount?: number;
  completedRequestsCount?: number;
  onView?: (caseId: string) => void;
  onAssess?: (caseId: string) => void;
  onRequestConsultation?: (caseId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function CaseCard({
  caseData,
  requestsCount = 0,
  completedRequestsCount = 0,
  onView,
  onAssess,
  onRequestConsultation,
  showActions = true,
  compact = false,
  className,
}: CaseCardProps) {
  const patient = caseData.patient;
  const patientInfo = patient
    ? formatPatientInfo(patient.full_name, patient.age, patient.gender)
    : "Unknown Patient";

  const pendingRequests = requestsCount - completedRequestsCount;
  const complaint = caseData.chief_complaint || caseData.initial_complaint;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer border-l-4",
        caseData.priority === "critical" && "border-l-red-500",
        caseData.priority === "urgent" && "border-l-yellow-500",
        caseData.priority === "stable" && "border-l-green-500",
        className
      )}
      onClick={() => onView?.(caseData.id)}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-gray-900">
                {caseData.case_number}
              </span>
              {caseData.is_life_saving && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded">
                  LIFE-SAVING
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{patientInfo}</p>
          </div>
          <PriorityBadge priority={caseData.priority} size="sm" />
        </div>

        {/* Complaint */}
        {complaint && !compact && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {complaint}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Arrived: {formatTime(caseData.arrival_time)}</span>
          </div>
          <StatusBadge status={caseData.status} type="case" size="sm" />
        </div>

        {/* Request summary */}
        {requestsCount > 0 && !compact && (
          <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2 mt-2">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{requestsCount} Requests</span>
            </div>
            {completedRequestsCount > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>{completedRequestsCount} Completed</span>
              </div>
            )}
            {pendingRequests > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Loader2 className="h-3 w-3" />
                <span>{pendingRequests} Pending</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && !compact && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(caseData.id);
              }}
            >
              View Case
            </Button>
            {caseData.status === "open" && onAssess && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssess(caseData.id);
                }}
              >
                Start Assessment
              </Button>
            )}
            {onRequestConsultation && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestConsultation(caseData.id);
                }}
              >
                Request Consultation
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
