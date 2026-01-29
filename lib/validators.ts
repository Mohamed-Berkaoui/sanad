// ==============================================
// SANAD Hospital ER System - Zod Validation Schemas
// ==============================================

import { z } from 'zod';

// ============================================
// ENUM SCHEMAS
// ============================================

export const userRoleSchema = z.enum(['nurse', 'er_doctor', 'consultant', 'flow_manager']);
export const caseStatusSchema = z.enum(['open', 'in_progress', 'discharged', 'admitted', 'referred', 'closed']);
export const priorityLevelSchema = z.enum(['critical', 'urgent', 'stable']);
export const requestStatusSchema = z.enum(['pending', 'acknowledged', 'in_progress', 'completed', 'escalated', 'cancelled']);
export const alertStatusSchema = z.enum(['pending', 'acknowledged', 'owned', 'forwarded', 'resolved', 'escalated']);
export const genderSchema = z.enum(['male', 'female', 'other']);
export const arrivalModeSchema = z.enum(['walk_in', 'ambulance', 'referral', 'transfer']);
export const dayOfWeekSchema = z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
export const notificationChannelSchema = z.enum(['app', 'whatsapp', 'both']);
export const requestTypeSchema = z.enum(['consultation', 'lab', 'imaging', 'procedure']);

// ============================================
// FORM VALIDATION SCHEMAS
// ============================================

/**
 * Login Form Schema
 */
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Patient Registration Schema
 */
export const patientRegistrationSchema = z.object({
  // Required fields
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(0, 'Age cannot be negative').max(150, 'Please enter a valid age'),
  gender: genderSchema,
  phone: z.string().min(10, 'Please enter a valid phone number'),
  initial_complaint: z.string().min(5, 'Please describe the complaint (at least 5 characters)'),
  arrival_mode: arrivalModeSchema,
  is_urgent: z.boolean(),
  
  // Optional fields
  mrn: z.string().optional(),
  national_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  whatsapp_number: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  
  // Vitals (all optional)
  blood_pressure_systolic: z.number().min(60).max(300).optional(),
  blood_pressure_diastolic: z.number().min(30).max(200).optional(),
  heart_rate: z.number().min(20).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  respiratory_rate: z.number().min(5).max(60).optional(),
  oxygen_saturation: z.number().min(50).max(100).optional(),
  pain_level: z.number().min(0).max(10).optional(),
  
  // Medical history
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  current_medications: z.string().optional(),
});

export type PatientRegistrationData = z.infer<typeof patientRegistrationSchema>;
export type PatientRegistrationFormData = PatientRegistrationData;

/**
 * Clinical Assessment Schema
 */
export const clinicalAssessmentSchema = z.object({
  chief_complaint: z.string().min(5, 'Chief complaint is required'),
  suspected_diagnosis: z.string().min(3, 'Please enter a suspected diagnosis'),
  physical_examination: z.string().optional(),
  clinical_notes: z.string().optional(),
  priority: priorityLevelSchema,
  is_life_saving: z.boolean().default(false),
});

export type ClinicalAssessmentData = z.infer<typeof clinicalAssessmentSchema>;

/**
 * Create Request Schema
 */
export const createRequestSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  request_type: requestTypeSchema,
  target_department_id: z.string().uuid('Please select a department'),
  assigned_consultant_id: z.string().uuid().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  urgency: priorityLevelSchema,
  description: z.string().min(10, 'Please provide more details (at least 10 characters)'),
});

export type CreateRequestData = z.infer<typeof createRequestSchema>;
export type CreateRequestFormData = CreateRequestData;

/**
 * Consultation Notes Schema
 */
export const consultationNotesSchema = z.object({
  diagnosis: z.string().min(3, 'Please provide a diagnosis'),
  findings: z.string().min(10, 'Please provide consultation findings'),
  recommendations: z.string().min(5, 'Please provide recommendations'),
  follow_up_required: z.boolean(),
  follow_up_notes: z.string().optional(),
});

export type ConsultationNotesData = z.infer<typeof consultationNotesSchema>;

/**
 * Update Vitals Schema
 */
export const updateVitalsSchema = z.object({
  blood_pressure_systolic: z.number().min(60).max(300).optional(),
  blood_pressure_diastolic: z.number().min(30).max(200).optional(),
  heart_rate: z.number().min(20).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  respiratory_rate: z.number().min(5).max(60).optional(),
  oxygen_saturation: z.number().min(50).max(100).optional(),
  pain_level: z.number().min(0).max(10).optional(),
});

export type UpdateVitalsData = z.infer<typeof updateVitalsSchema>;

/**
 * Working Hours Schema
 */
export const workingHoursSchema = z.object({
  day_of_week: dayOfWeekSchema,
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  is_active: z.boolean().default(true),
});

export type WorkingHoursData = z.infer<typeof workingHoursSchema>;

/**
 * User Profile Schema
 */
export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  whatsapp_number: z.string().optional(),
  specialization: z.string().optional(),
  notification_preference: notificationChannelSchema.default('both'),
});

export type UserProfileData = z.infer<typeof userProfileSchema>;

/**
 * Discharge Schema
 */
export const dischargeSchema = z.object({
  discharge_type: z.enum(['discharged', 'admitted', 'referred', 'deceased']),
  discharge_notes: z.string().min(10, 'Please provide discharge notes'),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().optional(),
  follow_up_instructions: z.string().optional(),
});

export type DischargeData = z.infer<typeof dischargeSchema>;

/**
 * OVR Report Schema
 */
export const ovrReportSchema = z.object({
  case_id: z.string().uuid().optional(),
  request_id: z.string().uuid().optional(),
  category: z.enum(['sla_breach', 'escalation', 'complaint', 'incident', 'other']),
  severity: priorityLevelSchema,
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description'),
  involved_user_ids: z.array(z.string().uuid()).default([]),
  involved_department_ids: z.array(z.string().uuid()).default([]),
});

export type OVRReportData = z.infer<typeof ovrReportSchema>;

/**
 * Case Message Schema
 */
export const caseMessageSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  message: z.string().min(1, 'Message cannot be empty'),
});

export type CaseMessageData = z.infer<typeof caseMessageSchema>;

/**
 * Forward Request Schema
 */
export const forwardRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  forward_to_consultant_id: z.string().uuid('Please select a consultant'),
  reason: z.string().min(5, 'Please provide a reason for forwarding'),
});

export type ForwardRequestData = z.infer<typeof forwardRequestSchema>;

/**
 * SLA Configuration Schema
 */
export const slaConfigurationSchema = z.object({
  request_type: requestTypeSchema,
  priority: priorityLevelSchema,
  response_time_minutes: z.number().min(1).max(1440),
  completion_time_minutes: z.number().min(1).max(1440),
  warning_threshold_percent: z.number().min(50).max(95).default(80),
  escalation_levels: z.array(z.object({
    level: z.number().min(1),
    minutes: z.number().min(1),
    target: z.string(),
  })).default([]),
});

export type SLAConfigurationData = z.infer<typeof slaConfigurationSchema>;

/**
 * Timeline Entry Schema
 */
export const timelineEntrySchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  action_type: z.enum(['arrival', 'triage', 'assessment', 'request', 'request_update', 'result', 'note', 'status_change', 'discharge']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type TimelineEntryData = z.infer<typeof timelineEntrySchema>;

/**
 * Search Query Schema
 */
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['cases', 'patients', 'requests', 'all']).default('all'),
  filters: z.object({
    priority: priorityLevelSchema.optional(),
    status: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    department_id: z.string().uuid().optional(),
  }).optional(),
});

export type SearchQueryData = z.infer<typeof searchQuerySchema>;
