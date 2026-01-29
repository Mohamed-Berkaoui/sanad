// ==============================================
// SANAD Hospital ER System - Utility Functions
// ==============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format time to locale string
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Get remaining time until deadline
 */
export function getRemainingTime(deadline: string | Date): {
  expired: boolean;
  text: string;
  minutes: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'expired';
} {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(Math.abs(diffMins) / 60);
  const mins = Math.abs(diffMins) % 60;

  if (diffMins < 0) {
    return {
      expired: true,
      text: `Breached by ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
      minutes: diffMins,
      percentage: 0,
      status: 'expired',
    };
  }

  const text = `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')} remaining`;
  
  // Assume 60 min total SLA for percentage calculation (will be dynamic later)
  const percentage = Math.min(100, Math.max(0, (diffMins / 60) * 100));
  
  let status: 'safe' | 'warning' | 'danger' | 'expired' = 'safe';
  if (percentage < 20) status = 'danger';
  else if (percentage < 50) status = 'warning';

  return {
    expired: false,
    text,
    minutes: diffMins,
    percentage,
    status,
  };
}

/**
 * Generate case number
 */
export function generateCaseNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ER-${dateStr}-${random}`;
}

/**
 * Generate request number
 */
export function generateRequestNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REQ-${dateStr}-${random}`;
}

/**
 * Generate OVR report number
 */
export function generateOVRNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OVR-${dateStr}-${random}`;
}

/**
 * Format patient name with age and gender
 */
export function formatPatientInfo(
  name: string,
  age?: number,
  gender?: string
): string {
  const parts = [name];
  if (age) parts.push(`${age}${gender ? gender.charAt(0).toUpperCase() : ''}`);
  return parts.join(', ');
}

/**
 * Format blood pressure
 */
export function formatBloodPressure(systolic?: number, diastolic?: number): string {
  if (!systolic || !diastolic) return 'N/A';
  return `${systolic}/${diastolic}`;
}

/**
 * Check if vitals are abnormal
 */
export function checkVitalsStatus(vitals: {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  pain_level?: number;
}): {
  hasWarnings: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (vitals.blood_pressure_systolic && vitals.blood_pressure_systolic > 140) {
    warnings.push('High systolic BP');
  }
  if (vitals.blood_pressure_systolic && vitals.blood_pressure_systolic < 90) {
    warnings.push('Low systolic BP');
  }
  if (vitals.blood_pressure_diastolic && vitals.blood_pressure_diastolic > 90) {
    warnings.push('High diastolic BP');
  }
  if (vitals.heart_rate && vitals.heart_rate > 100) {
    warnings.push('Tachycardia');
  }
  if (vitals.heart_rate && vitals.heart_rate < 60) {
    warnings.push('Bradycardia');
  }
  if (vitals.temperature && vitals.temperature > 38) {
    warnings.push('Fever');
  }
  if (vitals.oxygen_saturation && vitals.oxygen_saturation < 95) {
    warnings.push('Low O2 saturation');
  }
  if (vitals.pain_level && vitals.pain_level >= 7) {
    warnings.push('Severe pain');
  }

  return {
    hasWarnings: warnings.length > 0,
    warnings,
  };
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format role for display
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    nurse: 'Nurse',
    er_doctor: 'ER Doctor',
    consultant: 'Consultant',
    flow_manager: 'Flow Manager',
  };
  return roleMap[role] || capitalize(role.replace(/_/g, ' '));
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return capitalize(status.replace(/_/g, ' '));
}

/**
 * Check if user is within working hours
 */
export function isWithinWorkingHours(
  workingHours: Array<{ day_of_week: string; start_time: string; end_time: string; is_active: boolean }>
): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);

  const todaySchedule = workingHours.find(
    (wh) => wh.day_of_week === currentDay && wh.is_active
  );

  if (!todaySchedule) return false;

  return currentTime >= todaySchedule.start_time && currentTime <= todaySchedule.end_time;
}

/**
 * Calculate SLA deadline based on priority
 */
export function calculateSLADeadline(
  priority: 'critical' | 'urgent' | 'stable',
  requestType: string = 'consultation'
): Date {
  const now = new Date();
  const slaMinutes: Record<string, Record<string, number>> = {
    consultation: { critical: 10, urgent: 20, stable: 45 },
    lab: { critical: 15, urgent: 30, stable: 60 },
    imaging: { critical: 20, urgent: 40, stable: 90 },
    procedure: { critical: 15, urgent: 30, stable: 60 },
  };

  const minutes = slaMinutes[requestType]?.[priority] || slaMinutes.consultation[priority];
  return new Date(now.getTime() + minutes * 60000);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse error message from various error types
 */
export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
