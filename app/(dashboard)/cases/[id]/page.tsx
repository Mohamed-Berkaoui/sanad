"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PriorityBadge,
  StatusBadge,
  SLATimer,
  CaseTimelineView,
  VitalsDisplay,
  RequestCard,
} from "@/components/common";
import { casesService, requestsService, timelineService } from "@/lib/services/api";
import { formatDateTime, formatTime, formatPatientInfo } from "@/lib/utils";
import type { Case, Patient, CaseTimeline, ConsultationRequest } from "@/lib/types";
import {
  ChevronLeft,
  User,
  Heart,
  FileText,
  Clock,
  Stethoscope,
  Phone,
  MessageSquare,
  Send,
  AlertTriangle,
  Activity,
  ClipboardList,
  Bot,
  Plus,
  Edit,
  Printer,
} from "lucide-react";

// Helper to extract vitals from case
function getVitalsFromCase(caseData: Case) {
  return {
    blood_pressure_systolic: caseData.blood_pressure_systolic,
    blood_pressure_diastolic: caseData.blood_pressure_diastolic,
    heart_rate: caseData.heart_rate,
    temperature: caseData.temperature,
    respiratory_rate: caseData.respiratory_rate,
    oxygen_saturation: caseData.oxygen_saturation,
    pain_level: caseData.pain_level,
  };
}

// Check if vitals exist
function hasVitals(caseData: Case) {
  return caseData.blood_pressure_systolic !== undefined || 
         caseData.heart_rate !== undefined ||
         caseData.temperature !== undefined;
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<CaseTimeline[]>([]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true);
      try {
        // Load case with patient data
        const caseResult: any = await casesService.getById(caseId);
        if (caseResult) {
          // Map to Case type - use `any` to access raw db properties
          const mappedCase: Case = {
            id: caseResult.id,
            case_number: caseResult.case_number,
            patient_id: caseResult.patient_id,
            triage_nurse_id: caseResult.triage_nurse_id,
            priority: caseResult.priority as 'critical' | 'urgent' | 'stable',
            status: caseResult.status,
            arrival_mode: caseResult.arrival_mode,
            arrival_time: caseResult.arrival_time || caseResult.created_at,
            initial_complaint: caseResult.initial_complaint || caseResult.chief_complaint,
            blood_pressure_systolic: caseResult.blood_pressure_systolic,
            blood_pressure_diastolic: caseResult.blood_pressure_diastolic,
            heart_rate: caseResult.heart_rate,
            temperature: caseResult.temperature,
            respiratory_rate: caseResult.respiratory_rate,
            oxygen_saturation: caseResult.oxygen_saturation,
            pain_level: caseResult.pain_level,
            created_at: caseResult.created_at,
            updated_at: caseResult.updated_at || caseResult.created_at,
            is_urgent: caseResult.is_urgent || false,
            is_life_saving: caseResult.is_life_saving || false,
            follow_up_required: caseResult.follow_up_required || false,
          };
          setCaseData(mappedCase);

          // Set patient data if available (joins use singular 'patient')
          if (caseResult.patient) {
            setPatient({
              id: caseResult.patient.id,
              full_name: caseResult.patient.full_name,
              age: caseResult.patient.age,
              gender: caseResult.patient.gender as 'male' | 'female',
              phone: caseResult.patient.phone,
              mrn: caseResult.patient.mrn,
              national_id: caseResult.patient.national_id,
              chronic_conditions: caseResult.patient.chronic_conditions,
              created_at: caseResult.patient.created_at,
              updated_at: caseResult.patient.updated_at || caseResult.patient.created_at,
            });
          }

          // Load timeline for this case
          const timelineData = await timelineService.getForCase(caseId);
          const mappedTimeline: CaseTimeline[] = timelineData.map((t: any) => ({
            id: t.id,
            case_id: t.case_id,
            action_type: t.action_type || t.event_type || 'note',
            event_type: t.event_type || t.action_type,
            title: t.title || t.description || '',
            description: t.description,
            created_by: t.created_by,
            created_by_role: t.created_by_role || 'nurse',
            sequence_number: t.sequence_number || 0,
            created_at: t.created_at,
            metadata: t.metadata,
          }));
          setTimeline(mappedTimeline);

          // Load requests for this case
          const requestsData = await requestsService.getByCase(caseId);
          const mappedRequests: ConsultationRequest[] = requestsData.map((r: any) => ({
            id: r.id,
            request_number: r.request_number,
            case_id: r.case_id,
            request_type: r.request_type,
            title: r.reason || '',
            urgency: r.urgency,
            status: r.status,
            sla_breached: r.sla_breached || false,
            escalation_level: r.escalation_level || 0,
            requested_by: r.requested_by || '',
            requested_at: r.requested_at || r.created_at,
            created_at: r.created_at,
            updated_at: r.updated_at || r.created_at,
          }));
          setRequests(mappedRequests);
        }
      } catch (error) {
        console.error("Error loading case:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCaseData();
  }, [caseId]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    // TODO: Send message via Supabase/WhatsApp integration
    console.log("Sending message:", newMessage);
    setNewMessage("");
  }, [newMessage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">Case Not Found</h2>
          <p className="text-gray-500 mt-1">
            The requested case could not be found.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mt-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Case {caseData.case_number}
              </h1>
              <PriorityBadge priority={caseData.priority} />
              <StatusBadge type="case" status={caseData.status} />
            </div>
            <p className="text-gray-500 mt-1">
              Registered: {formatDateTime(caseData.arrival_time)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href={`/cases/${caseId}/request-consultation`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Consultation
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info & Vitals */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient ? (
                <>
                  <div>
                    <div className="text-xl font-semibold">{patient.full_name}</div>
                    <div className="text-gray-500">
                      {formatPatientInfo(patient.full_name, patient.age, patient.gender).split(" - ")[1]}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {patient.national_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">National ID</span>
                        <span className="font-medium">{patient.national_id}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{patient.phone}</span>
                      </div>
                    )}
                    {patient.chronic_conditions && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-gray-500 text-xs">Medical History</span>
                        <p className="text-sm mt-1">{patient.chronic_conditions}</p>
                      </div>
                    )}
                    {patient.allergies && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Allergies
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {patient.allergies.split(",").map((allergy: string, idx: number) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {allergy.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <MessageSquare className="h-3 w-3" />
                      WhatsApp
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Vitals Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Latest Vitals
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasVitals(caseData) ? (
                <VitalsDisplay vitals={getVitalsFromCase(caseData)} />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No vitals recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary Card */}
          <Card className="bg-linear-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.ai_summary ? (
                <p className="text-sm text-gray-700">{caseData.ai_summary}</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">
                    AI summary not generated yet
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bot className="h-4 w-4" />
                    Generate Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview" className="gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="consultations" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Consultations ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Activity className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="communication" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Communication
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Chief Complaint */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Chief Complaint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{caseData.chief_complaint}</p>
                  </CardContent>
                </Card>

                {/* Clinical Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Clinical Notes</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {caseData.clinical_notes ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {caseData.clinical_notes}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No clinical notes added yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Case Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Case Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Arrival Mode</span>
                        <p className="font-medium capitalize">
                          {caseData.arrival_mode.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Arrival Time</span>
                        <p className="font-medium">
                          {formatTime(caseData.arrival_time)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned ER Doctor</span>
                        <p className="font-medium">
                          {caseData.er_doctor?.full_name || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Registered By</span>
                        <p className="font-medium">
                          {caseData.triage_nurse?.full_name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Consultations Tab */}
            <TabsContent value="consultations" className="mt-6">
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-700">
                        No Consultations
                      </h3>
                      <p className="text-gray-500 mt-1 mb-4">
                        No consultation requests have been made for this case
                      </p>
                      <Link href={`/cases/${caseId}/request-consultation`}>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Request Consultation
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onView={() =>
                        router.push(`/requests/${request.id}`)
                      }
                      showActions
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeline.length > 0 ? (
                    <CaseTimelineView entries={timeline} />
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No timeline events yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    WhatsApp Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Message History Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] mb-4">
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>WhatsApp integration pending</p>
                      <p className="text-sm mt-1">
                        Messages will appear here when connected
                      </p>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Messages will be sent to the patient&apos;s WhatsApp via Twilio
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
