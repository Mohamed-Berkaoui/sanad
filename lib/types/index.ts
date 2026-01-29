// ==============================================
// SANAD Hospital ER System - TypeScript Types
// Aligned with DATABASE.md schema
// ==============================================

// ============================================
// ENUM TYPES
// ============================================

export type UserRole = 'nurse' | 'er_doctor' | 'consultant' | 'flow_manager';

export type CaseStatus = 'open' | 'in_progress' | 'discharged' | 'admitted' | 'referred' | 'closed';

export type PriorityLevel = 'critical' | 'urgent' | 'stable';

export type RequestStatus = 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'escalated' | 'cancelled';

export type AlertStatus = 'pending' | 'acknowledged' | 'owned' | 'forwarded' | 'resolved' | 'escalated';

export type Gender = 'male' | 'female' | 'other';

export type ArrivalMode = 'walk_in' | 'ambulance' | 'referral' | 'transfer';

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type NotificationChannel = 'app' | 'whatsapp' | 'both';

export type RequestType = 'consultation' | 'lab' | 'imaging' | 'procedure';

export type AlertType = 'new_request' | 'sla_warning' | 'sla_breach' | 'escalation' | 'critical_result' | 'status_change';

export type TimelineActionType = 
  | 'arrival' 
  | 'triage' 
  | 'assessment' 
  | 'request' 
  | 'request_update' 
  | 'result' 
  | 'note' 
  | 'status_change' 
  | 'discharge';

export type OVRCategory = 'sla_breach' | 'escalation' | 'complaint' | 'incident' | 'other';

// ============================================
// DATABASE ENTITIES
// ============================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  whatsapp_number?: string;
  role: UserRole;
  department_id?: string;
  specialization?: string;
  employee_id?: string;
  avatar_url?: string;
  is_active: boolean;
  is_on_duty: boolean;
  dnd_status: boolean;
  dnd_until?: string;
  last_seen_at?: string;
  notification_preference: NotificationChannel;
  created_at: string;
  updated_at: string;
  // Joined relations
  department?: Department;
}

export interface WorkingHours {
  id: string;
  user_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  mrn?: string;
  national_id?: string;
  full_name: string;
  date_of_birth?: string;
  age?: number;
  gender: Gender;
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  insurance_provider?: string;
  insurance_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  patient_id: string;
  status: CaseStatus;
  priority: PriorityLevel;
  is_urgent: boolean;
  is_life_saving: boolean;
  arrival_time: string;
  arrival_mode: ArrivalMode;
  triage_nurse_id?: string;
  triage_time?: string;
  initial_complaint?: string;
  // Vitals
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  // Clinical Assessment
  er_doctor_id?: string;
  assessment_time?: string;
  chief_complaint?: string;
  suspected_diagnosis?: string;
  physical_examination?: string;
  clinical_notes?: string;
  // AI Summary
  ai_summary?: string;
  ai_summary_updated_at?: string;
  // SLA (computed from active requests)
  sla_deadline?: string;
  // Discharge
  discharge_time?: string;
  discharge_type?: string;
  discharge_notes?: string;
  discharge_by?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  follow_up_instructions?: string;
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Joined relations
  patient?: Patient;
  triage_nurse?: User;
  er_doctor?: User;
}

export interface ConsultationRequest {
  id: string;
  case_id: string;
  request_number: string;
  request_type: RequestType;
  title: string;
  description?: string;
  urgency: PriorityLevel;
  target_department_id?: string;
  assigned_consultant_id?: string;
  status: RequestStatus;
  acknowledged_at?: string;
  acknowledged_by?: string;
  owned_at?: string;
  owned_by?: string;
  completed_at?: string;
  completed_by?: string;
  sla_deadline?: string;
  sla_breached: boolean;
  sla_breach_time?: string;
  escalation_level: number;
  result_notes?: string;
  result_attachments?: Array<{ url: string; name: string; type: string }>;
  requested_by: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  case?: Case;
  target_department?: Department;
  assigned_consultant?: User;
  requester?: User;
}

export interface CaseTimeline {
  id: string;
  case_id: string;
  request_id?: string;
  action_type: TimelineActionType;
  title: string;
  description?: string;
  notes?: string;
  created_by: string;
  created_by_role: UserRole;
  created_at: string;
  sequence_number: number;
  // Joined relations
  creator?: User;
  request?: ConsultationRequest;
}

export interface Alert {
  id: string;
  case_id: string;
  request_id?: string;
  alert_type: AlertType;
  title: string;
  message?: string;
  priority: PriorityLevel;
  target_user_id?: string;
  target_department_id?: string;
  target_role?: UserRole;
  status: AlertStatus;
  acknowledged_at?: string;
  acknowledged_by?: string;
  owned_at?: string;
  owned_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  forwarded_to?: string;
  forwarded_at?: string;
  app_notified: boolean;
  app_notified_at?: string;
  whatsapp_notified: boolean;
  whatsapp_notified_at?: string;
  whatsapp_message_sid?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  // Joined relations
  case?: Case;
  request?: ConsultationRequest;
  target_user?: User;
  target_department?: Department;
}

export interface OVRReport {
  id: string;
  case_id?: string;
  request_id?: string;
  alert_id?: string;
  report_number: string;
  category: OVRCategory;
  severity: PriorityLevel;
  title: string;
  description: string;
  involved_user_ids: string[];
  involved_department_ids: string[];
  is_resolved: boolean;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  case?: Case;
  request?: ConsultationRequest;
  alert?: Alert;
  creator?: User;
  resolver?: User;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  message: string;
  attachments?: Array<{ url: string; name: string; type: string }>;
  sender_id: string;
  sender_role: UserRole;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  // Joined relations
  sender?: User;
}

export interface SLAConfiguration {
  id: string;
  request_type: RequestType;
  priority: PriorityLevel;
  response_time_minutes: number;
  completion_time_minutes: number;
  warning_threshold_percent: number;
  escalation_levels: Array<{
    level: number;
    minutes: number;
    target: UserRole | string;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  alert_id?: string;
  user_id?: string;
  channel: NotificationChannel;
  recipient: string;
  message_content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  external_message_id?: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  roles: UserRole[];
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface StatsCard {
  icon: string;
  value: number | string;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  variant?: 'default' | 'critical' | 'urgent' | 'stable';
}

// ============================================
// DASHBOARD DATA TYPES
// ============================================

export interface NurseDashboardData {
  stats: {
    totalToday: number;
    criticalCases: number;
    urgentCases: number;
    stableCases: number;
  };
  recentCases: Array<Case & { patient: Patient }>;
}

export interface ERDoctorDashboardData {
  stats: {
    activeCases: number;
    awaitingAssessment: number;
    pendingRequests: number;
    completedToday: number;
  };
  criticalCases: Array<Case & { patient: Patient }>;
  urgentCases: Array<Case & { patient: Patient }>;
  stableCases: Array<Case & { patient: Patient }>;
}

export interface ConsultantDashboardData {
  stats: {
    newRequests: number;
    pendingAck: number;
    inProgress: number;
    completedToday: number;
  };
  newRequests: Array<ConsultationRequest & { case: Case & { patient: Patient } }>;
  activeCases: Array<ConsultationRequest & { case: Case & { patient: Patient } }>;
}

export interface FlowManagerDashboardData {
  stats: {
    activeCases: number;
    slaBreaches: number;
    pendingRequests: number;
    staffOnDuty: number;
  };
  recentAlerts: Alert[];
  ovrReports: OVRReport[];
  casesByPriority: {
    critical: number;
    urgent: number;
    stable: number;
  };
  requestsByStatus: {
    pending: number;
    acknowledged: number;
    in_progress: number;
    completed: number;
    escalated: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface PatientRegistrationForm {
  // Required
  full_name: string;
  age: number;
  gender: Gender;
  phone: string;
  initial_complaint: string;
  arrival_mode: ArrivalMode;
  // Optional
  mrn?: string;
  national_id?: string;
  date_of_birth?: string;
  whatsapp_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  is_urgent?: boolean;
  // Vitals
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  // Medical history
  allergies?: string;
  current_medications?: string;
}

export interface CreateRequestForm {
  case_id: string;
  request_type: RequestType;
  target_department_id: string;
  assigned_consultant_id?: string;
  title: string;
  urgency: PriorityLevel;
  description: string;
}

export interface ClinicalAssessmentForm {
  chief_complaint: string;
  suspected_diagnosis: string;
  physical_examination?: string;
  clinical_notes?: string;
  priority: PriorityLevel;
}

export interface ConsultationNotesForm {
  result_notes: string;
  recommendations?: string;
  status: RequestStatus;
}

export interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// REALTIME EVENT TYPES
// ============================================

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
}

export type CaseUpdatePayload = RealtimePayload<Case>;
export type RequestUpdatePayload = RealtimePayload<ConsultationRequest>;
export type AlertPayload = RealtimePayload<Alert>;
export type MessagePayload = RealtimePayload<CaseMessage>;
