"use client";

import { cn } from "@/lib/utils";
import { checkVitalsStatus, formatBloodPressure } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface VitalsDisplayProps {
  vitals: {
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    pain_level?: number;
  };
  compact?: boolean;
  className?: string;
}

interface VitalItemProps {
  label: string;
  value: string | number;
  unit?: string;
  isWarning?: boolean;
}

function VitalItem({ label, value, unit, isWarning }: VitalItemProps) {
  return (
    <div className={cn("flex flex-col", isWarning && "text-red-600")}>
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-lg font-semibold">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
        {isWarning && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </div>
    </div>
  );
}

export function VitalsDisplay({ vitals, compact, className }: VitalsDisplayProps) {
  const { hasWarnings, warnings } = checkVitalsStatus(vitals);

  const vitalItems = [
    {
      label: "BP",
      value: formatBloodPressure(
        vitals.blood_pressure_systolic,
        vitals.blood_pressure_diastolic
      ),
      isWarning: Boolean(
        (vitals.blood_pressure_systolic && vitals.blood_pressure_systolic > 140) ||
        (vitals.blood_pressure_systolic && vitals.blood_pressure_systolic < 90)
      ),
    },
    {
      label: "HR",
      value: vitals.heart_rate || "N/A",
      unit: "bpm",
      isWarning: Boolean(
        (vitals.heart_rate && vitals.heart_rate > 100) ||
        (vitals.heart_rate && vitals.heart_rate < 60)
      ),
    },
    {
      label: "Temp",
      value: vitals.temperature || "N/A",
      unit: "°C",
      isWarning: Boolean(vitals.temperature && vitals.temperature > 38),
    },
    {
      label: "RR",
      value: vitals.respiratory_rate || "N/A",
      unit: "/min",
      isWarning: false,
    },
    {
      label: "SpO2",
      value: vitals.oxygen_saturation || "N/A",
      unit: "%",
      isWarning: Boolean(vitals.oxygen_saturation && vitals.oxygen_saturation < 95),
    },
    {
      label: "Pain",
      value: vitals.pain_level !== undefined ? `${vitals.pain_level}/10` : "N/A",
      isWarning: Boolean(vitals.pain_level && vitals.pain_level >= 7),
    },
  ];

  if (compact) {
    return (
      <div className={cn("grid grid-cols-3 gap-3", className)}>
        {vitalItems.map((item) => (
          <VitalItem key={item.label} {...item} />
        ))}
      </div>
    );
  }

  return (
    <Card className={cn(hasWarnings && "border-red-200", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Vital Signs
          {hasWarnings && (
            <span className="text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded">
              {warnings.length} abnormal
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {vitalItems.map((item) => (
            <VitalItem key={item.label} {...item} />
          ))}
        </div>
        {hasWarnings && (
          <div className="mt-3 pt-3 border-t border-red-100">
            <p className="text-xs text-red-600">
              ⚠️ {warnings.join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
