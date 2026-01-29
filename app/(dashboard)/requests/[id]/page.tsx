"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  PriorityBadge,
  StatusBadge,
  SLATimer,
  CaseTimeline,
  VitalsDisplay,
} from "@/components/common";
import { requestsService, casesService, timelineService } from "@/lib/services/api";
import { useAuthStore } from "@/lib/stores";
import { consultationNotesSchema, type ConsultationNotesData } from "@/lib/validators";
import { formatDateTime, formatPatientInfo } from "@/lib/utils";
import type { ConsultationRequest, Case, Patient, CaseTimeline as TimelineType } from "@/lib/types";
import {
  ChevronLeft,
  User,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Save,
  Loader2,
  Heart,
  Bot,
  Activity,
} from "lucide-react";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const { user } = useAuthStore();

  const [request, setRequest] = useState<ConsultationRequest | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<TimelineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultationNotesData>({
    resolver: zodResolver(consultationNotesSchema),
    defaultValues: {
      diagnosis: "",
      findings: "",
      recommendations: "",
      follow_up_required: false,
      follow_up_notes: "",
    },
  });

  const loadRequestData = async () => {
    setIsLoading(true);
    try {
      const foundRequest: any = await requestsService.getById(requestId);
      if (foundRequest) {
        const mappedRequest: ConsultationRequest = {
          id: foundRequest.id,
          request_number: foundRequest.request_number,
          case_id: foundRequest.case_id,
          request_type: foundRequest.request_type,
          title: foundRequest.reason || '',
          urgency: foundRequest.urgency,
          status: foundRequest.status,
          sla_breached: foundRequest.sla_breached || false,
          escalation_level: foundRequest.escalation_level || 0,
          requested_by: foundRequest.requested_by || '',
          requested_at: foundRequest.requested_at || foundRequest.created_at,
          created_at: foundRequest.created_at,
          updated_at: foundRequest.updated_at || foundRequest.created_at,
          acknowledged_at: foundRequest.acknowledged_at,
          completed_at: foundRequest.completed_at,
        };
        setRequest(mappedRequest);

        // Load case data
        if (foundRequest.case_id) {
          const caseResult: any = await casesService.getById(foundRequest.case_id);
          if (caseResult) {
            const mappedCase: Case = {
              id: caseResult.id,
              case_number: caseResult.case_number,
              patient_id: caseResult.patient_id,
              triage_nurse_id: caseResult.triage_nurse_id,
              priority: caseResult.priority,
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

            // Load timeline
            const timelineData = await timelineService.getForCase(caseResult.id);
            setTimeline(timelineData.map((t: any) => ({
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
            })));
          }
        }
      }
    } catch (error) {
      console.error("Error loading request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequestData();
  }, [requestId]);

  const handleAcknowledge = async () => {
    try {
      await requestsService.acknowledge(requestId, user?.id || '');
      await loadRequestData();
    } catch (error) {
      console.error("Error acknowledging request:", error);
    }
  };

  const handleStartConsultation = async () => {
    try {
      await requestsService.own(requestId, user?.id || '');
      await loadRequestData();
    } catch (error) {
      console.error("Error starting consultation:", error);
    }
  };

  const onSubmit = async (data: ConsultationNotesData) => {
    setIsSubmitting(true);
    
    try {
      await requestsService.complete(requestId, {
        diagnosis: data.diagnosis,
        findings: data.findings,
        recommendations: data.recommendations,
        follow_up_required: data.follow_up_required,
        follow_up_notes: data.follow_up_notes,
      });
      
      router.push("/dashboard/consultant");
    } catch (error) {
      console.error("Error completing consultation:", error);
      alert("Failed to complete consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">
            Request Not Found
          </h2>
          <p className="text-gray-500 mt-1">
            The requested consultation could not be found.
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
                Request {request.request_number}
              </h1>
              <PriorityBadge priority={request.urgency} />
              <StatusBadge type="request" status={request.status} />
            </div>
            <p className="text-gray-500 mt-1">
              {request.request_type.replace("_", " ")} • Created:{" "}
              {formatDateTime(request.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {request.sla_deadline && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">SLA:</span>
              <SLATimer deadline={request.sla_deadline} />
            </div>
          )}
          {request.status === "pending" && (
            <Button onClick={handleAcknowledge} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Acknowledge
            </Button>
          )}
          {request.status === "acknowledged" && (
            <Button onClick={handleStartConsultation} className="gap-2">
              <Activity className="h-4 w-4" />
              Start Consultation
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request & Patient Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Request Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                Consultation Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Request Type</span>
                  <span className="font-medium capitalize">
                    {request.request_type.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested By</span>
                  <span className="font-medium">
                    {request.requester?.full_name || "ER Doctor"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Case #</span>
                  <Link
                    href={`/cases/${request.case_id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {request.case?.case_number || caseData?.case_number}
                  </Link>
                </div>
              </div>

              {request.description && (
                <div className="pt-3 border-t">
                  <span className="text-gray-500 text-xs">Reason for Request</span>
                  <p className="text-sm mt-1">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient ? (
                <>
                  <div>
                    <div className="text-xl font-semibold">{patient.full_name}</div>
                    <div className="text-gray-500">
                      {patient.age}y, {patient.gender}
                    </div>
                  </div>

                  {patient.allergies && (
                    <div className="pt-3 border-t">
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

                  {patient.chronic_conditions && (
                    <div className="pt-3 border-t">
                      <span className="text-gray-500 text-xs">Medical History</span>
                      <p className="text-sm mt-1">{patient.chronic_conditions}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Current Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseData && (caseData.blood_pressure_systolic || caseData.heart_rate || caseData.temperature) ? (
                <VitalsDisplay 
                  vitals={{
                    blood_pressure_systolic: caseData.blood_pressure_systolic,
                    blood_pressure_diastolic: caseData.blood_pressure_diastolic,
                    heart_rate: caseData.heart_rate,
                    temperature: caseData.temperature,
                    respiratory_rate: caseData.respiratory_rate,
                    oxygen_saturation: caseData.oxygen_saturation,
                    pain_level: caseData.pain_level,
                  }} 
                  compact 
                />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No vitals recorded
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          {caseData?.ai_summary && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-500" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{caseData.ai_summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Consultation Form */}
        <div className="lg:col-span-2">
          {request.status === "in_progress" || request.status === "acknowledged" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Diagnosis */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      {...register("diagnosis")}
                      placeholder="Enter primary diagnosis and any differential diagnoses..."
                      rows={3}
                    />
                    {errors.diagnosis && (
                      <p className="text-sm text-red-500">
                        {errors.diagnosis.message}
                      </p>
                    )}
                  </div>

                  {/* Clinical Findings */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Clinical Findings <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      {...register("findings")}
                      placeholder="Document examination findings, test results, and observations..."
                      rows={4}
                    />
                    {errors.findings && (
                      <p className="text-sm text-red-500">
                        {errors.findings.message}
                      </p>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Recommendations <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      {...register("recommendations")}
                      placeholder="Treatment plan, medications, procedures, and care instructions..."
                      rows={4}
                    />
                    {errors.recommendations && (
                      <p className="text-sm text-red-500">
                        {errors.recommendations.message}
                      </p>
                    )}
                  </div>

                  {/* Follow-up */}
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="follow_up_required"
                        {...register("follow_up_required")}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="follow_up_required"
                        className="text-sm font-medium text-gray-700"
                      >
                        Follow-up Required
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Follow-up Notes
                      </label>
                      <Textarea
                        {...register("follow_up_notes")}
                        placeholder="Specify follow-up timeline and instructions if applicable..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Complete Consultation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : request.status === "completed" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Consultation Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.result_notes ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Consultation Notes
                      </h4>
                      <p className="text-gray-900">
                        {request.result_notes}
                      </p>
                    </div>
                    {request.result_attachments && request.result_attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Attachments
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.result_attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No consultation notes recorded</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700">
                  Awaiting Acknowledgment
                </h3>
                <p className="text-gray-500 mt-1 mb-4">
                  Please acknowledge this request to begin the consultation
                </p>
                <Button onClick={handleAcknowledge}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge Request
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chief Complaint & Case Timeline */}
          <div className="mt-6 space-y-6">
            {/* Chief Complaint */}
            {caseData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Chief Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{caseData.chief_complaint}</p>
                  {caseData.clinical_notes && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Clinical Notes
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {caseData.clinical_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Case Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Case Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <CaseTimeline timeline={timeline} />
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No timeline events yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
