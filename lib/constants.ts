// ==============================================
// SANAD Hospital ER System - Constants
// ==============================================

import type { NavItem, PriorityLevel, UserRole } from './types';

// ============================================
// NAVIGATION ITEMS (Role-Based)
// ============================================

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'cases',
    label: 'Cases',
    icon: 'ClipboardList',
    href: '/cases',
    roles: ['nurse', 'er_doctor', 'consultant', 'flow_manager'],
  },
  {
    id: 'patients',
    label: 'Register Patient',
    icon: 'Users',
    href: '/patients/register',
    roles: ['nurse', 'flow_manager'],
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: 'GitPullRequest',
    href: '/requests',
    roles: ['consultant', 'flow_manager'],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: 'UserCog',
    href: '/staff',
    roles: ['flow_manager'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    href: '/analytics',
    roles: ['flow_manager'],
  },
];

// ============================================
// PRIORITY CONFIGURATION
// ============================================

export const PRIORITY_CONFIG: Record<PriorityLevel, {
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    icon: '🔴',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-yellow-700',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    icon: '🟡',
  },
  stable: {
    label: 'Stable',
    color: 'text-green-700',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    icon: '🟢',
  },
};

// ============================================
// STATUS CONFIGURATION
// ============================================

export const CASE_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  open: {
    label: 'Open',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  discharged: {
    label: 'Discharged',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  admitted: {
    label: 'Admitted',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
  },
  referred: {
    label: 'Referred',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

export const REQUEST_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  escalated: {
    label: 'Escalated',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-500',
    bgColor: 'bg-gray-200',
  },
};

export const ALERT_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  owned: {
    label: 'Owned',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  forwarded: {
    label: 'Forwarded',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  escalated: {
    label: 'Escalated',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

// ============================================
// ROLE CONFIGURATION
// ============================================
import { 
  Stethoscope, 
  UserCog, 
  ClipboardList, 
  Activity 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  description: string;
  dashboardPath: string;
  icon: LucideIcon;
}> = {
  nurse: {
    label: 'Nurse',
    description: 'Register patients and perform initial triage',
    dashboardPath: '/dashboard/nurse',
    icon: ClipboardList,
  },
  er_doctor: {
    label: 'ER Doctor',
    description: 'Assess patients and create consultation requests',
    dashboardPath: '/dashboard/er-doctor',
    icon: Stethoscope,
  },
  consultant: {
    label: 'Consultant',
    description: 'Handle consultation requests from ER',
    dashboardPath: '/dashboard/consultant',
    icon: UserCog,
  },
  flow_manager: {
    label: 'Flow Manager',
    description: 'Monitor system, manage SLAs, and oversee operations',
    dashboardPath: '/dashboard/flow-manager',
    icon: Activity,
  },
};

// ============================================
// SLA CONFIGURATION (Default values in minutes)
// ============================================

export const DEFAULT_SLA_CONFIG = {
  consultation: {
    critical: { response: 10, completion: 30 },
    urgent: { response: 20, completion: 60 },
    stable: { response: 45, completion: 120 },
  },
  lab: {
    critical: { response: 15, completion: 45 },
    urgent: { response: 30, completion: 90 },
    stable: { response: 60, completion: 180 },
  },
  imaging: {
    critical: { response: 20, completion: 60 },
    urgent: { response: 40, completion: 120 },
    stable: { response: 90, completion: 240 },
  },
  procedure: {
    critical: { response: 15, completion: 45 },
    urgent: { response: 30, completion: 90 },
    stable: { response: 60, completion: 180 },
  },
};

// ============================================
// ARRIVAL MODES
// ============================================

export const ARRIVAL_MODES = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'referral', label: 'Referral' },
  { value: 'transfer', label: 'Transfer' },
] as const;

// ============================================
// GENDER OPTIONS
// ============================================

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================
// REQUEST TYPES
// ============================================

export const REQUEST_TYPES = [
  { value: 'consultation', label: 'Consultation', icon: 'Stethoscope' },
  { value: 'lab', label: 'Lab Test', icon: 'FlaskConical' },
  { value: 'imaging', label: 'Imaging', icon: 'Scan' },
  { value: 'procedure', label: 'Procedure', icon: 'Syringe' },
] as const;

// ============================================
// DAYS OF WEEK
// ============================================

export const DAYS_OF_WEEK = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
] as const;

// ============================================
// PAIN LEVELS
// ============================================

export const PAIN_LEVELS = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  label: i.toString(),
  description: i === 0 ? 'No pain' : i <= 3 ? 'Mild' : i <= 6 ? 'Moderate' : 'Severe',
}));

// ============================================
// DEPARTMENTS (Default - will be loaded from DB)
// ============================================

export const DEFAULT_DEPARTMENTS = [
  { code: 'CARD', name: 'Cardiology' },
  { code: 'NEURO', name: 'Neurology' },
  { code: 'PULM', name: 'Pulmonology' },
  { code: 'GASTRO', name: 'Gastroenterology' },
  { code: 'ORTHO', name: 'Orthopedics' },
  { code: 'SURG', name: 'Surgery' },
  { code: 'PED', name: 'Pediatrics' },
  { code: 'OB', name: 'Obstetrics/Gynecology' },
  { code: 'PSYCH', name: 'Psychiatry' },
  { code: 'RAD', name: 'Radiology' },
  { code: 'LAB', name: 'Laboratory' },
  { code: 'IM', name: 'Internal Medicine' },
];

// ============================================
// TIMELINE ACTION TYPES
// ============================================

export const TIMELINE_ACTION_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
}> = {
  arrival: {
    label: 'Patient Arrived',
    icon: 'LogIn',
    color: 'text-blue-500',
  },
  triage: {
    label: 'Triage Completed',
    icon: 'ClipboardCheck',
    color: 'text-green-500',
  },
  assessment: {
    label: 'Clinical Assessment',
    icon: 'Stethoscope',
    color: 'text-purple-500',
  },
  request: {
    label: 'Request Created',
    icon: 'Send',
    color: 'text-orange-500',
  },
  request_update: {
    label: 'Request Updated',
    icon: 'RefreshCw',
    color: 'text-indigo-500',
  },
  result: {
    label: 'Results Received',
    icon: 'FileText',
    color: 'text-teal-500',
  },
  note: {
    label: 'Note Added',
    icon: 'Edit3',
    color: 'text-gray-500',
  },
  status_change: {
    label: 'Status Changed',
    icon: 'ArrowRightCircle',
    color: 'text-yellow-500',
  },
  discharge: {
    label: 'Patient Discharged',
    icon: 'LogOut',
    color: 'text-green-600',
  },
};

// ============================================
// ALERT TYPE CONFIGURATION
// ============================================

export const ALERT_TYPE_CONFIG: Record<string, {
  label: string;
  icon: string;
  color: string;
}> = {
  new_request: {
    label: 'New Request',
    icon: 'Plus',
    color: 'text-blue-500',
  },
  sla_warning: {
    label: 'SLA Warning',
    icon: 'Clock',
    color: 'text-yellow-500',
  },
  sla_breach: {
    label: 'SLA Breach',
    icon: 'AlertTriangle',
    color: 'text-red-500',
  },
  escalation: {
    label: 'Escalation',
    icon: 'ArrowUp',
    color: 'text-orange-500',
  },
  critical_result: {
    label: 'Critical Result',
    icon: 'AlertCircle',
    color: 'text-red-600',
  },
  status_change: {
    label: 'Status Change',
    icon: 'RefreshCw',
    color: 'text-purple-500',
  },
};
