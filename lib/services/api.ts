// ==============================================
// SANAD Hospital ER System - API Services
// Supabase data access layer
// ==============================================

import { supabase } from '@/lib/supabase/client';
import { createUserProfile, getUserProfile } from '@/app/actions/auth';
import type { User, Department, Patient, Case, ConsultationRequest, CaseTimeline, Alert, WorkingHours } from '@/lib/types';
import type { Database, Tables, InsertTables, UpdateTables } from '@/lib/supabase/database.types';

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: {
    full_name: string;
    role: Database['public']['Enums']['user_role'];
    phone?: string;
    department_id?: string;
    specialization?: string;
  }) {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
          department_id: userData.department_id,
          specialization: userData.specialization,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // Create user profile using server action (bypasses RLS)
    try {
      const profile = await createUserProfile(authData.user.id, email, userData);
      return { user: authData.user, profile };
    } catch (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Still return the auth user, but profile creation failed
      return { user: authData.user, profile: null };
    }
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile using server action (bypasses RLS)
    const profile = await getUserProfile(data.user.id);

    return { session: data.session, user: data.user, profile };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    const profile = await usersService.getById(user.id);
    return profile;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// USERS SERVICE
// ============================================

export const usersService = {
  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as unknown as User;
  },

  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    return (data || []) as unknown as User[];
  },

  // Get users by role
  async getByRole(role: Database['public']['Enums']['user_role']): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    return (data || []) as unknown as User[];
  },

  // Get consultants by department
  async getConsultantsByDepartment(departmentId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('role', 'consultant')
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    return (data || []) as unknown as User[];
  },

  // Update user profile
  async update(id: string, updates: UpdateTables<'users'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        department:departments(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as User;
  },

  // Update duty status
  async updateDutyStatus(id: string, isOnDuty: boolean): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_on_duty: isOnDuty })
      .eq('id', id);

    if (error) throw error;
  },

  // Update DND status
  async updateDndStatus(id: string, dndStatus: boolean, dndUntil?: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ dnd_status: dndStatus, dnd_until: dndUntil || null })
      .eq('id', id);

    if (error) throw error;
  },

  // Update last seen
  async updateLastSeen(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// DEPARTMENTS SERVICE
// ============================================

export const departmentsService = {
  // Get all departments
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []) as Department[];
  },

  // Get department by ID
  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Department;
  },
};

// ============================================
// PATIENTS SERVICE
// ============================================

export const patientsService = {
  // Create patient
  async create(patient: InsertTables<'patients'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data as Patient;
  },

  // Get patient by ID
  async getById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Patient;
  },

  // Get patient by MRN
  async getByMrn(mrn: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('mrn', mrn)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as Patient;
  },

  // Search patients
  async search(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`full_name.ilike.%${query}%,mrn.ilike.%${query}%,national_id.ilike.%${query}%`)
      .order('full_name')
      .limit(20);

    if (error) throw error;
    return (data || []) as Patient[];
  },

  // Update patient
  async update(id: string, updates: UpdateTables<'patients'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Patient;
  },

  // Generate next MRN
  async generateMrn(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const { count, error } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .like('mrn', `MRN-${today}-%`);

    if (error) throw error;
    const nextNum = (count || 0) + 1;
    return `MRN-${today}-${String(nextNum).padStart(4, '0')}`;
  },
};

// ============================================
// CASES SERVICE
// ============================================

export const casesService = {
  // Create case
  async create(caseData: Omit<InsertTables<'cases'>, 'case_number'>): Promise<Case> {
    // Case number is auto-generated by trigger
    const { data, error } = await supabase
      .from('cases')
      .insert({ ...caseData, case_number: 'TEMP' }) // Will be replaced by trigger
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as Case;
  },

  // Get case by ID
  async getById(id: string): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as unknown as Case;
  },

  // Get all cases with filters
  async getAll(filters?: {
    status?: string;
    priority?: string;
    search?: string;
    limit?: number;
  }): Promise<Case[]> {
    let query = supabase
      .from('cases')
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .order('arrival_time', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as any);
    }
    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority as any);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as Case[];
  },

  // Get active cases (open or in_progress)
  async getActive(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .in('status', ['open', 'in_progress'])
      .order('priority')
      .order('arrival_time', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Case[];
  },

  // Get cases by priority
  async getByPriority(priority: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .eq('priority', priority as any)
      .in('status', ['open', 'in_progress'])
      .order('arrival_time', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Case[];
  },

  // Get today's cases
  async getToday(): Promise<Case[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .gte('arrival_time', today.toISOString())
      .order('arrival_time', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Case[];
  },

  // Update case
  async update(id: string, updates: UpdateTables<'cases'>): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patient:patients(*),
        triage_nurse:users!cases_triage_nurse_id_fkey(*),
        er_doctor:users!cases_er_doctor_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as Case;
  },

  // Get case stats
  async getStats(): Promise<{
    totalToday: number;
    critical: number;
    urgent: number;
    stable: number;
    open: number;
    inProgress: number;
    discharged: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('cases')
      .select('status, priority')
      .gte('arrival_time', today.toISOString());

    if (error) throw error;

    const stats = {
      totalToday: data?.length || 0,
      critical: data?.filter(c => c.priority === 'critical').length || 0,
      urgent: data?.filter(c => c.priority === 'urgent').length || 0,
      stable: data?.filter(c => c.priority === 'stable').length || 0,
      open: data?.filter(c => c.status === 'open').length || 0,
      inProgress: data?.filter(c => c.status === 'in_progress').length || 0,
      discharged: data?.filter(c => c.status === 'discharged').length || 0,
    };

    return stats;
  },
};

// ============================================
// CONSULTATION REQUESTS SERVICE
// ============================================

export const requestsService = {
  // Create request
  async create(request: Omit<InsertTables<'consultation_requests'>, 'request_number'>): Promise<ConsultationRequest> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert({ ...request, request_number: 'TEMP' }) // Will be replaced by trigger
      .select(`
        *,
        case:cases(*),
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*),
        requester:users!consultation_requests_requested_by_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as ConsultationRequest;
  },

  // Get request by ID
  async getById(id: string): Promise<ConsultationRequest | null> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select(`
        *,
        case:cases(*, patient:patients(*)),
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*),
        requester:users!consultation_requests_requested_by_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as unknown as ConsultationRequest;
  },

  // Get requests with filters
  async getAll(filters?: {
    status?: string;
    department?: string;
    consultantId?: string;
    caseId?: string;
    limit?: number;
  }): Promise<ConsultationRequest[]> {
    let query = supabase
      .from('consultation_requests')
      .select(`
        *,
        case:cases(*, patient:patients(*)),
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*),
        requester:users!consultation_requests_requested_by_fkey(*)
      `)
      .order('requested_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as any);
    }
    if (filters?.department) {
      query = query.eq('target_department_id', filters.department);
    }
    if (filters?.consultantId) {
      query = query.eq('assigned_consultant_id', filters.consultantId);
    }
    if (filters?.caseId) {
      query = query.eq('case_id', filters.caseId);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as ConsultationRequest[];
  },

  // Get pending requests for consultant
  async getPendingForConsultant(consultantId: string): Promise<ConsultationRequest[]> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select(`
        *,
        case:cases(*, patient:patients(*)),
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*),
        requester:users!consultation_requests_requested_by_fkey(*)
      `)
      .eq('assigned_consultant_id', consultantId)
      .in('status', ['pending', 'acknowledged', 'in_progress'])
      .order('urgency')
      .order('requested_at');

    if (error) throw error;
    return (data || []) as unknown as ConsultationRequest[];
  },

  // Get requests by case
  async getByCase(caseId: string): Promise<ConsultationRequest[]> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select(`
        *,
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*)
      `)
      .eq('case_id', caseId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as ConsultationRequest[];
  },

  // Update request
  async update(id: string, updates: UpdateTables<'consultation_requests'>): Promise<ConsultationRequest> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        case:cases(*, patient:patients(*)),
        target_department:departments(*),
        assigned_consultant:users!consultation_requests_assigned_consultant_id_fkey(*),
        requester:users!consultation_requests_requested_by_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as ConsultationRequest;
  },

  // Acknowledge request
  async acknowledge(id: string, userId: string): Promise<ConsultationRequest> {
    return this.update(id, {
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId,
    });
  },

  // Own request
  async own(id: string, userId: string): Promise<ConsultationRequest> {
    return this.update(id, {
      status: 'in_progress',
      owned_at: new Date().toISOString(),
      owned_by: userId,
    });
  },

  // Complete request
  async complete(id: string, notes?: {
    diagnosis?: string;
    findings?: string;
    recommendations?: string;
    follow_up_required?: boolean;
    follow_up_notes?: string;
  }): Promise<ConsultationRequest> {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      result_notes: notes ? JSON.stringify(notes) : null,
    });
  },

  // Get request stats
  async getStats(): Promise<{
    pending: number;
    acknowledged: number;
    inProgress: number;
    completed: number;
    breached: number;
  }> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('status, sla_breached');

    if (error) throw error;

    return {
      pending: data?.filter(r => r.status === 'pending').length || 0,
      acknowledged: data?.filter(r => r.status === 'acknowledged').length || 0,
      inProgress: data?.filter(r => r.status === 'in_progress').length || 0,
      completed: data?.filter(r => r.status === 'completed').length || 0,
      breached: data?.filter(r => r.sla_breached).length || 0,
    };
  },
};

// ============================================
// TIMELINE SERVICE
// ============================================

export const timelineService = {
  // Get timeline for case
  async getForCase(caseId: string): Promise<CaseTimeline[]> {
    const { data, error } = await supabase
      .from('case_timeline')
      .select(`
        *,
        creator:users!case_timeline_created_by_fkey(*)
      `)
      .eq('case_id', caseId)
      .order('sequence_number', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as CaseTimeline[];
  },

  // Add timeline entry
  async add(entry: InsertTables<'case_timeline'>): Promise<CaseTimeline> {
    const { data, error } = await supabase
      .from('case_timeline')
      .insert(entry)
      .select(`
        *,
        creator:users!case_timeline_created_by_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data as unknown as CaseTimeline;
  },
};

// ============================================
// ALERTS SERVICE
// ============================================

export const alertsService = {
  // Get alerts for user
  async getForUser(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        case:cases(*),
        request:consultation_requests(*),
        target_user:users!alerts_target_user_id_fkey(*)
      `)
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Alert[];
  },

  // Get pending alerts count
  async getPendingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  },

  // Update alert status
  async updateStatus(id: string, status: Database['public']['Enums']['alert_status'], userId: string): Promise<void> {
    const updates: UpdateTables<'alerts'> = { status };

    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
      updates.acknowledged_by = userId;
    } else if (status === 'owned') {
      updates.owned_at = new Date().toISOString();
      updates.owned_by = userId;
    } else if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = userId;
    }

    const { error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// WORKING HOURS SERVICE
// ============================================

export const workingHoursService = {
  // Get working hours for user
  async getByUser(userId: string): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week');

    if (error) throw error;
    return (data || []) as unknown as WorkingHours[];
  },

  // Upsert a single working hour entry
  async upsert(hours: {
    user_id: string;
    day_of_week: Database['public']['Enums']['day_of_week'];
    start_time: string;
    end_time: string;
    is_available: boolean;
  }): Promise<void> {
    // Try to update first, if no rows affected, insert
    const { data: existing, error: checkError } = await supabase
      .from('working_hours')
      .select('id')
      .eq('user_id', hours.user_id)
      .eq('day_of_week', hours.day_of_week)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('working_hours')
        .update({
          start_time: hours.start_time,
          end_time: hours.end_time,
          is_available: hours.is_available,
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('working_hours')
        .insert({
          user_id: hours.user_id,
          day_of_week: hours.day_of_week,
          start_time: hours.start_time,
          end_time: hours.end_time,
          is_available: hours.is_available,
        });

      if (error) throw error;
    }
  },

  // Bulk upsert working hours
  async upsertAll(userId: string, hours: Array<{
    day_of_week: Database['public']['Enums']['day_of_week'];
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>): Promise<void> {
    // Delete existing hours
    await supabase
      .from('working_hours')
      .delete()
      .eq('user_id', userId);

    // Insert new hours
    if (hours.length > 0) {
      const { error } = await supabase
        .from('working_hours')
        .insert(hours.map(h => ({ ...h, user_id: userId })));

      if (error) throw error;
    }
  },
};
