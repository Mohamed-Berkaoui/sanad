import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  mockCases, 
  mockPatients, 
  mockRequests, 
  mockUsers,
  mockDepartments,
  mockAlerts,
  getMockActiveCases,
  getMockCasesByPriority,
  getMockRequestsByStatus,
  getMockPendingAlerts,
  getMockCaseTimeline,
} from "@/lib/mock-data";
import type { 
  Case, 
  Patient, 
  ConsultationRequest, 
  User, 
  Department,
  Alert,
  CaseTimeline,
  PriorityLevel,
  CaseStatus,
  RequestStatus,
} from "@/lib/types";

// Query Keys - Centralized for cache management
export const queryKeys = {
  cases: {
    all: ["cases"] as const,
    active: ["cases", "active"] as const,
    byPriority: (priority: PriorityLevel) => ["cases", "priority", priority] as const,
    byStatus: (status: CaseStatus) => ["cases", "status", status] as const,
    byId: (id: string) => ["cases", id] as const,
    timeline: (caseId: string) => ["cases", caseId, "timeline"] as const,
  },
  patients: {
    all: ["patients"] as const,
    byId: (id: string) => ["patients", id] as const,
  },
  requests: {
    all: ["requests"] as const,
    byStatus: (status: RequestStatus) => ["requests", "status", status] as const,
    byCase: (caseId: string) => ["requests", "case", caseId] as const,
    byId: (id: string) => ["requests", id] as const,
  },
  users: {
    all: ["users"] as const,
    byRole: (role: string) => ["users", "role", role] as const,
    byId: (id: string) => ["users", id] as const,
  },
  departments: {
    all: ["departments"] as const,
    byId: (id: string) => ["departments", id] as const,
  },
  alerts: {
    all: ["alerts"] as const,
    pending: ["alerts", "pending"] as const,
  },
  stats: {
    dashboard: (role: string) => ["stats", "dashboard", role] as const,
  },
};

// Simulated delay for mock API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== CASES HOOKS ====================

// Fetch all cases
export function useCases() {
  return useQuery({
    queryKey: queryKeys.cases.all,
    queryFn: async () => {
      await delay(300);
      // TODO: Replace with Supabase
      // const { data, error } = await supabase
      //   .from('cases')
      //   .select('*, patient:patients(*), nurse:users!nurse_id(*), er_doctor:users!er_doctor_id(*)')
      //   .order('created_at', { ascending: false });
      return mockCases;
    },
  });
}

// Fetch active cases only
export function useActiveCases() {
  return useQuery({
    queryKey: queryKeys.cases.active,
    queryFn: async () => {
      await delay(200);
      return getMockActiveCases();
    },
  });
}

// Fetch cases by priority
export function useCasesByPriority(priority: PriorityLevel) {
  return useQuery({
    queryKey: queryKeys.cases.byPriority(priority),
    queryFn: async () => {
      await delay(200);
      return getMockCasesByPriority(priority);
    },
    enabled: !!priority,
  });
}

// Fetch single case by ID
export function useCase(caseId: string) {
  return useQuery({
    queryKey: queryKeys.cases.byId(caseId),
    queryFn: async () => {
      await delay(200);
      const caseData = mockCases.find((c) => c.id === caseId);
      if (!caseData) throw new Error("Case not found");
      
      // Attach patient data
      const patient = mockPatients.find((p) => p.id === caseData.patient_id);
      return { ...caseData, patient };
    },
    enabled: !!caseId,
  });
}

// Fetch case timeline
export function useCaseTimeline(caseId: string) {
  return useQuery({
    queryKey: queryKeys.cases.timeline(caseId),
    queryFn: async () => {
      await delay(200);
      return getMockCaseTimeline(caseId);
    },
    enabled: !!caseId,
  });
}

// Create new case mutation
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCase: Partial<Case>) => {
      await delay(500);
      // TODO: Replace with Supabase
      // const { data, error } = await supabase
      //   .from('cases')
      //   .insert([newCase])
      //   .select()
      //   .single();
      const createdCase = { ...newCase, id: crypto.randomUUID() } as Case;
      return createdCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.active });
    },
  });
}

// Update case mutation
export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: Partial<Case> }) => {
      await delay(500);
      // TODO: Replace with Supabase
      // const { data, error } = await supabase
      //   .from('cases')
      //   .update(updates)
      //   .eq('id', caseId)
      //   .select()
      //   .single();
      return { id: caseId, ...updates } as Case;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.byId(data.id) });
    },
  });
}

// ==================== PATIENTS HOOKS ====================

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: async () => {
      await delay(300);
      return mockPatients;
    },
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patients.byId(patientId),
    queryFn: async () => {
      await delay(200);
      const patient = mockPatients.find((p) => p.id === patientId);
      if (!patient) throw new Error("Patient not found");
      return patient;
    },
    enabled: !!patientId,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPatient: Partial<Patient>) => {
      await delay(500);
      const createdPatient = { ...newPatient, id: crypto.randomUUID() } as Patient;
      return createdPatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}

// ==================== REQUESTS HOOKS ====================

export function useRequests() {
  return useQuery({
    queryKey: queryKeys.requests.all,
    queryFn: async () => {
      await delay(300);
      return mockRequests;
    },
  });
}

export function useRequestsByStatus(status: RequestStatus) {
  return useQuery({
    queryKey: queryKeys.requests.byStatus(status),
    queryFn: async () => {
      await delay(200);
      return getMockRequestsByStatus(status);
    },
    enabled: !!status,
  });
}

export function useRequestsByCase(caseId: string) {
  return useQuery({
    queryKey: queryKeys.requests.byCase(caseId),
    queryFn: async () => {
      await delay(200);
      return mockRequests.filter((r) => r.case_id === caseId);
    },
    enabled: !!caseId,
  });
}

export function useRequest(requestId: string) {
  return useQuery({
    queryKey: queryKeys.requests.byId(requestId),
    queryFn: async () => {
      await delay(200);
      const request = mockRequests.find((r) => r.id === requestId);
      if (!request) throw new Error("Request not found");
      
      // Attach related data
      const caseData = mockCases.find((c) => c.id === request.case_id);
      const patient = caseData
        ? mockPatients.find((p) => p.id === caseData.patient_id)
        : null;
        
      return { ...request, case: caseData, patient };
    },
    enabled: !!requestId,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRequest: Partial<ConsultationRequest>) => {
      await delay(500);
      const createdRequest = {
        ...newRequest,
        id: crypto.randomUUID(),
        status: "pending" as const,
        created_at: new Date().toISOString(),
      } as ConsultationRequest;
      return createdRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      if (data.case_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.requests.byCase(data.case_id),
        });
      }
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      updates,
    }: {
      requestId: string;
      updates: Partial<ConsultationRequest>;
    }) => {
      await delay(500);
      return { id: requestId, ...updates } as ConsultationRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byId(data.id) });
    },
  });
}

// Request actions (acknowledge, start, complete)
export function useAcknowledgeRequest() {
  const updateRequest = useUpdateRequest();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return updateRequest.mutateAsync({
        requestId,
        updates: {
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
        },
      });
    },
  });
}

export function useStartConsultation() {
  const updateRequest = useUpdateRequest();

  return useMutation({
    mutationFn: async (requestId: string) => {
      return updateRequest.mutateAsync({
        requestId,
        updates: {
          status: "in_progress",
        },
      });
    },
  });
}

export function useCompleteConsultation() {
  const updateRequest = useUpdateRequest();

  return useMutation({
    mutationFn: async ({
      requestId,
      notes,
    }: {
      requestId: string;
      notes: string;
    }) => {
      return updateRequest.mutateAsync({
        requestId,
        updates: {
          status: "completed",
          result_notes: notes,
          completed_at: new Date().toISOString(),
        },
      });
    },
  });
}

// ==================== USERS HOOKS ====================

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      await delay(300);
      return mockUsers;
    },
  });
}

export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: queryKeys.users.byRole(role),
    queryFn: async () => {
      await delay(200);
      return mockUsers.filter((u) => u.role === role);
    },
    enabled: !!role,
  });
}

// ==================== DEPARTMENTS HOOKS ====================

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: async () => {
      await delay(200);
      return mockDepartments;
    },
  });
}

// ==================== ALERTS HOOKS ====================

export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts.all,
    queryFn: async () => {
      await delay(200);
      return mockAlerts;
    },
  });
}

export function usePendingAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts.pending,
    queryFn: async () => {
      await delay(200);
      return getMockPendingAlerts();
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      await delay(300);
      return { id: alertId, status: "resolved" as const };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.pending });
    },
  });
}

// ==================== DASHBOARD STATS HOOKS ====================

export function useNurseDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard("nurse"),
    queryFn: async () => {
      await delay(200);
      return {
        totalToday: mockCases.length,
        criticalCases: getMockCasesByPriority("critical").length,
        urgentCases: getMockCasesByPriority("urgent").length,
        stableCases: getMockCasesByPriority("stable").length,
        recentCases: getMockActiveCases().slice(0, 5),
      };
    },
  });
}

export function useERDoctorDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard("er_doctor"),
    queryFn: async () => {
      await delay(200);
      const activeCases = getMockActiveCases();
      return {
        totalActive: activeCases.length,
        criticalCases: getMockCasesByPriority("critical"),
        urgentCases: getMockCasesByPriority("urgent"),
        stableCases: getMockCasesByPriority("stable"),
        pendingRequests: getMockRequestsByStatus("pending").length,
      };
    },
  });
}

export function useConsultantDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard("consultant"),
    queryFn: async () => {
      await delay(200);
      return {
        pendingRequests: getMockRequestsByStatus("pending"),
        acknowledgedRequests: getMockRequestsByStatus("acknowledged"),
        inProgressRequests: getMockRequestsByStatus("in_progress"),
        completedToday: getMockRequestsByStatus("completed"),
      };
    },
  });
}

export function useFlowManagerDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard("flow_manager"),
    queryFn: async () => {
      await delay(200);
      const activeCases = getMockActiveCases();
      return {
        totalActive: activeCases.length,
        criticalCases: getMockCasesByPriority("critical").length,
        slaBreaches: activeCases.filter(
          (c) => c.sla_deadline && new Date(c.sla_deadline) < new Date()
        ).length,
        avgWaitTime: 45,
        pendingRequests: getMockRequestsByStatus("pending").length,
        staffOnDuty: 12,
        alerts: getMockPendingAlerts(),
      };
    },
  });
}
