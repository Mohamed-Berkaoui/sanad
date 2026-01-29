// ==============================================
// SANAD Hospital ER System - Supabase Database Types
// Auto-generated types for database schema
// ==============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          app_notified: boolean | null
          app_notified_at: string | null
          case_id: string
          created_at: string | null
          expires_at: string | null
          forwarded_at: string | null
          forwarded_to: string | null
          id: string
          message: string | null
          owned_at: string | null
          owned_by: string | null
          priority: Database['public']['Enums']['priority_level'] | null
          request_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database['public']['Enums']['alert_status'] | null
          target_department_id: string | null
          target_role: Database['public']['Enums']['user_role'] | null
          target_user_id: string | null
          title: string
          updated_at: string | null
          whatsapp_message_sid: string | null
          whatsapp_notified: boolean | null
          whatsapp_notified_at: string | null
          acknowledged_at: string | null
          acknowledged_by: string | null
        }
        Insert: {
          alert_type: string
          app_notified?: boolean | null
          app_notified_at?: string | null
          case_id: string
          created_at?: string | null
          expires_at?: string | null
          forwarded_at?: string | null
          forwarded_to?: string | null
          id?: string
          message?: string | null
          owned_at?: string | null
          owned_by?: string | null
          priority?: Database['public']['Enums']['priority_level'] | null
          request_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database['public']['Enums']['alert_status'] | null
          target_department_id?: string | null
          target_role?: Database['public']['Enums']['user_role'] | null
          target_user_id?: string | null
          title: string
          updated_at?: string | null
          whatsapp_message_sid?: string | null
          whatsapp_notified?: boolean | null
          whatsapp_notified_at?: string | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
        }
        Update: {
          alert_type?: string
          app_notified?: boolean | null
          app_notified_at?: string | null
          case_id?: string
          created_at?: string | null
          expires_at?: string | null
          forwarded_at?: string | null
          forwarded_to?: string | null
          id?: string
          message?: string | null
          owned_at?: string | null
          owned_by?: string | null
          priority?: Database['public']['Enums']['priority_level'] | null
          request_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database['public']['Enums']['alert_status'] | null
          target_department_id?: string | null
          target_role?: Database['public']['Enums']['user_role'] | null
          target_user_id?: string | null
          title?: string
          updated_at?: string | null
          whatsapp_message_sid?: string | null
          whatsapp_notified?: boolean | null
          whatsapp_notified_at?: string | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_target_user_id_fkey"
            columns: ["target_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      case_messages: {
        Row: {
          attachments: Json | null
          case_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message: string
          sender_id: string
          sender_role: Database['public']['Enums']['user_role']
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          case_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message: string
          sender_id: string
          sender_role: Database['public']['Enums']['user_role']
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          case_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message?: string
          sender_id?: string
          sender_role?: Database['public']['Enums']['user_role']
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      case_timeline: {
        Row: {
          action_type: string
          case_id: string
          created_at: string | null
          created_by: string
          created_by_role: Database['public']['Enums']['user_role']
          description: string | null
          id: string
          notes: string | null
          request_id: string | null
          sequence_number: number
          title: string
        }
        Insert: {
          action_type: string
          case_id: string
          created_at?: string | null
          created_by: string
          created_by_role: Database['public']['Enums']['user_role']
          description?: string | null
          id?: string
          notes?: string | null
          request_id?: string | null
          sequence_number?: number
          title: string
        }
        Update: {
          action_type?: string
          case_id?: string
          created_at?: string | null
          created_by?: string
          created_by_role?: Database['public']['Enums']['user_role']
          description?: string | null
          id?: string
          notes?: string | null
          request_id?: string | null
          sequence_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_timeline_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timeline_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_timeline_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      cases: {
        Row: {
          ai_summary: string | null
          ai_summary_updated_at: string | null
          arrival_mode: Database['public']['Enums']['arrival_mode'] | null
          arrival_time: string | null
          assessment_time: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          case_number: string
          chief_complaint: string | null
          clinical_notes: string | null
          created_at: string | null
          created_by: string | null
          discharge_by: string | null
          discharge_notes: string | null
          discharge_time: string | null
          discharge_type: string | null
          er_doctor_id: string | null
          follow_up_date: string | null
          follow_up_instructions: string | null
          follow_up_required: boolean | null
          heart_rate: number | null
          id: string
          initial_complaint: string | null
          is_life_saving: boolean | null
          is_urgent: boolean | null
          oxygen_saturation: number | null
          pain_level: number | null
          patient_id: string
          physical_examination: string | null
          priority: Database['public']['Enums']['priority_level'] | null
          respiratory_rate: number | null
          status: Database['public']['Enums']['case_status'] | null
          suspected_diagnosis: string | null
          temperature: number | null
          triage_nurse_id: string | null
          triage_time: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          arrival_mode?: Database['public']['Enums']['arrival_mode'] | null
          arrival_time?: string | null
          assessment_time?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          case_number: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          discharge_by?: string | null
          discharge_notes?: string | null
          discharge_time?: string | null
          discharge_type?: string | null
          er_doctor_id?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          follow_up_required?: boolean | null
          heart_rate?: number | null
          id?: string
          initial_complaint?: string | null
          is_life_saving?: boolean | null
          is_urgent?: boolean | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          physical_examination?: string | null
          priority?: Database['public']['Enums']['priority_level'] | null
          respiratory_rate?: number | null
          status?: Database['public']['Enums']['case_status'] | null
          suspected_diagnosis?: string | null
          temperature?: number | null
          triage_nurse_id?: string | null
          triage_time?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          arrival_mode?: Database['public']['Enums']['arrival_mode'] | null
          arrival_time?: string | null
          assessment_time?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          case_number?: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          discharge_by?: string | null
          discharge_notes?: string | null
          discharge_time?: string | null
          discharge_type?: string | null
          er_doctor_id?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          follow_up_required?: boolean | null
          heart_rate?: number | null
          id?: string
          initial_complaint?: string | null
          is_life_saving?: boolean | null
          is_urgent?: boolean | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          physical_examination?: string | null
          priority?: Database['public']['Enums']['priority_level'] | null
          respiratory_rate?: number | null
          status?: Database['public']['Enums']['case_status'] | null
          suspected_diagnosis?: string | null
          temperature?: number | null
          triage_nurse_id?: string | null
          triage_time?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_er_doctor_id_fkey"
            columns: ["er_doctor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_triage_nurse_id_fkey"
            columns: ["triage_nurse_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_requests: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          assigned_consultant_id: string | null
          case_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          escalation_level: number | null
          id: string
          owned_at: string | null
          owned_by: string | null
          request_number: string
          request_type: string
          requested_at: string | null
          requested_by: string
          result_attachments: Json | null
          result_notes: string | null
          sla_breach_time: string | null
          sla_breached: boolean | null
          sla_deadline: string | null
          status: Database['public']['Enums']['request_status'] | null
          target_department_id: string | null
          title: string
          updated_at: string | null
          urgency: Database['public']['Enums']['priority_level'] | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          assigned_consultant_id?: string | null
          case_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          escalation_level?: number | null
          id?: string
          owned_at?: string | null
          owned_by?: string | null
          request_number: string
          request_type: string
          requested_at?: string | null
          requested_by: string
          result_attachments?: Json | null
          result_notes?: string | null
          sla_breach_time?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database['public']['Enums']['request_status'] | null
          target_department_id?: string | null
          title: string
          updated_at?: string | null
          urgency?: Database['public']['Enums']['priority_level'] | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          assigned_consultant_id?: string | null
          case_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          escalation_level?: number | null
          id?: string
          owned_at?: string | null
          owned_by?: string | null
          request_number?: string
          request_type?: string
          requested_at?: string | null
          requested_by?: string
          result_attachments?: Json | null
          result_notes?: string | null
          sla_breach_time?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database['public']['Enums']['request_status'] | null
          target_department_id?: string | null
          title?: string
          updated_at?: string | null
          urgency?: Database['public']['Enums']['priority_level'] | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_requested_by_fkey"
            columns: ["requested_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_target_department_id_fkey"
            columns: ["target_department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "case_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_logs: {
        Row: {
          alert_id: string | null
          channel: Database['public']['Enums']['notification_channel']
          delivered_at: string | null
          error_message: string | null
          external_message_id: string | null
          id: string
          message_content: string
          read_at: string | null
          recipient: string
          sent_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          channel: Database['public']['Enums']['notification_channel']
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          message_content: string
          read_at?: string | null
          recipient: string
          sent_at?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          channel?: Database['public']['Enums']['notification_channel']
          delivered_at?: string | null
          error_message?: string | null
          external_message_id?: string | null
          id?: string
          message_content?: string
          read_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_alert_id_fkey"
            columns: ["alert_id"]
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ovr_reports: {
        Row: {
          alert_id: string | null
          case_id: string | null
          category: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          involved_department_ids: string[] | null
          involved_user_ids: string[] | null
          is_resolved: boolean | null
          report_number: string
          request_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database['public']['Enums']['priority_level']
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_id?: string | null
          case_id?: string | null
          category: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          involved_department_ids?: string[] | null
          involved_user_ids?: string[] | null
          is_resolved?: boolean | null
          report_number: string
          request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database['public']['Enums']['priority_level']
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_id?: string | null
          case_id?: string | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          involved_department_ids?: string[] | null
          involved_user_ids?: string[] | null
          is_resolved?: boolean | null
          report_number?: string
          request_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database['public']['Enums']['priority_level']
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ovr_reports_alert_id_fkey"
            columns: ["alert_id"]
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ovr_reports_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ovr_reports_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ovr_reports_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ovr_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string | null
          current_medications: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          full_name: string
          gender: Database['public']['Enums']['gender_type']
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          mrn: string | null
          national_id: string | null
          phone: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name: string
          gender: Database['public']['Enums']['gender_type']
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          mrn?: string | null
          national_id?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          gender?: Database['public']['Enums']['gender_type']
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          mrn?: string | null
          national_id?: string | null
          phone?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      sla_configurations: {
        Row: {
          completion_time_minutes: number
          created_at: string | null
          escalation_levels: Json | null
          id: string
          is_active: boolean | null
          priority: Database['public']['Enums']['priority_level']
          request_type: string
          response_time_minutes: number
          updated_at: string | null
          warning_threshold_percent: number | null
        }
        Insert: {
          completion_time_minutes: number
          created_at?: string | null
          escalation_levels?: Json | null
          id?: string
          is_active?: boolean | null
          priority: Database['public']['Enums']['priority_level']
          request_type: string
          response_time_minutes: number
          updated_at?: string | null
          warning_threshold_percent?: number | null
        }
        Update: {
          completion_time_minutes?: number
          created_at?: string | null
          escalation_levels?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: Database['public']['Enums']['priority_level']
          request_type?: string
          response_time_minutes?: number
          updated_at?: string | null
          warning_threshold_percent?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          dnd_status: boolean | null
          dnd_until: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          is_on_duty: boolean | null
          last_seen_at: string | null
          notification_preference: Database['public']['Enums']['notification_channel'] | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          specialization: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          dnd_status?: boolean | null
          dnd_until?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          is_on_duty?: boolean | null
          last_seen_at?: string | null
          notification_preference?: Database['public']['Enums']['notification_channel'] | null
          phone?: string | null
          role: Database['public']['Enums']['user_role']
          specialization?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          dnd_status?: boolean | null
          dnd_until?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_on_duty?: boolean | null
          last_seen_at?: string | null
          notification_preference?: Database['public']['Enums']['notification_channel'] | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          specialization?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      working_hours: {
        Row: {
          created_at: string | null
          day_of_week: Database['public']['Enums']['day_of_week']
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: Database['public']['Enums']['day_of_week']
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: Database['public']['Enums']['day_of_week']
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_timeline_entry: {
        Args: {
          p_case_id: string
          p_action_type: string
          p_title: string
          p_description?: string
          p_notes?: string
          p_request_id?: string
        }
        Returns: string
      }
      calculate_sla_deadline: {
        Args: {
          p_request_type: string
          p_priority: Database['public']['Enums']['priority_level']
        }
        Returns: string
      }
      get_available_consultant: {
        Args: {
          p_department_id: string
          p_is_life_saving?: boolean
        }
        Returns: string
      }
    }
    Enums: {
      alert_status: 'pending' | 'acknowledged' | 'owned' | 'forwarded' | 'resolved' | 'escalated'
      arrival_mode: 'walk_in' | 'ambulance' | 'referral' | 'transfer'
      case_status: 'open' | 'in_progress' | 'discharged' | 'admitted' | 'referred' | 'closed'
      day_of_week: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
      gender_type: 'male' | 'female' | 'other'
      notification_channel: 'app' | 'whatsapp' | 'both'
      priority_level: 'critical' | 'urgent' | 'stable'
      request_status: 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'escalated' | 'cancelled'
      user_role: 'nurse' | 'er_doctor' | 'consultant' | 'flow_manager'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
