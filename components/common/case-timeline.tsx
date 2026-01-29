"use client";

import { cn } from "@/lib/utils";
import { formatTime, getRelativeTime } from "@/lib/utils";
import { TIMELINE_ACTION_CONFIG } from "@/lib/constants";
import type { CaseTimeline, User } from "@/lib/types";
import {
  LogIn,
  ClipboardCheck,
  Stethoscope,
  Send,
  RefreshCw,
  FileText,
  Edit3,
  ArrowRightCircle,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn,
  ClipboardCheck,
  Stethoscope,
  Send,
  RefreshCw,
  FileText,
  Edit3,
  ArrowRightCircle,
  LogOut,
};

interface TimelineEntryProps {
  entry: CaseTimeline & { creator?: User };
  isLast?: boolean;
}

function TimelineEntry({ entry, isLast }: TimelineEntryProps) {
  const config = TIMELINE_ACTION_CONFIG[entry.action_type] || {
    label: entry.action_type,
    icon: "FileText",
    color: "text-gray-500",
  };
  const Icon = iconMap[config.icon] || FileText;

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-200"
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900">{entry.title}</p>
            {entry.description && (
              <p className="text-sm text-gray-600 mt-0.5">{entry.description}</p>
            )}
            {entry.notes && (
              <p className="text-sm text-gray-500 mt-1 italic">
                &quot;{entry.notes}&quot;
              </p>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatTime(entry.created_at)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {entry.creator?.full_name || "System"} •{" "}
          {getRelativeTime(entry.created_at)}
        </p>
      </div>
    </div>
  );
}

export interface CaseTimelineProps {
  entries?: Array<CaseTimeline & { creator?: User }>;
  timeline?: Array<CaseTimeline & { creator?: User }>;
  className?: string;
}

export function CaseTimelineView({ entries, timeline, className }: CaseTimelineProps) {
  const items = entries || timeline || [];
  
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timeline entries yet
      </div>
    );
  }

  // Sort entries by created_at descending (newest first)
  const sortedEntries = [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={cn("space-y-0", className)}>
      {sortedEntries.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          isLast={index === sortedEntries.length - 1}
        />
      ))}
    </div>
  );
}
