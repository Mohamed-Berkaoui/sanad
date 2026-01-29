"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  PriorityBadge,
  VitalsDisplay,
} from "@/components/common";
import { casesService, departmentsService, requestsService } from "@/lib/services/api";
import { useAuthStore } from "@/lib/stores";
import { createRequestSchema, type CreateRequestFormData } from "@/lib/validators";
import { PRIORITY_CONFIG, REQUEST_TYPES } from "@/lib/constants";
import { formatPatientInfo } from "@/lib/utils";
import type { Case, Patient } from "@/lib/types";
import {
  ChevronLeft,
  User,
  Stethoscope,
  AlertTriangle,
  Heart,
  Save,
  Loader2,
} from "lucide-react";

export default function RequestConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { user } = useAuthStore();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [departments, setDepartments] = useState<{id: string; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      case_id: caseId,
      target_department_id: "",
      request_type: "consultation",
      urgency: "urgent",
      title: "",
      description: "",
    },
  });

  const watchPriority = watch("urgency");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load case
        const foundCase: any = await casesService.getById(caseId);
        if (foundCase) {
          const mappedCase: Case = {
            id: foundCase.id,
            case_number: foundCase.case_number,
            patient_id: foundCase.patient_id,
            priority: foundCase.priority as any,
            status: foundCase.status as any,
            arrival_mode: foundCase.arrival_mode as any,
            arrival_time: foundCase.arrival_time,
            initial_complaint: foundCase.initial_complaint,
            blood_pressure_systolic: foundCase.blood_pressure_systolic,
            blood_pressure_diastolic: foundCase.blood_pressure_diastolic,
            heart_rate: foundCase.heart_rate,
            temperature: foundCase.temperature,
            respiratory_rate: foundCase.respiratory_rate,
            oxygen_saturation: foundCase.oxygen_saturation,
            pain_level: foundCase.pain_level,
            created_at: foundCase.created_at,
            updated_at: foundCase.updated_at || foundCase.created_at,
            is_urgent: foundCase.is_urgent || false,
            is_life_saving: foundCase.is_life_saving || false,
            follow_up_required: foundCase.follow_up_required || false,
          };
          setCaseData(mappedCase);

          const patientData = foundCase.patient || foundCase.patients;
          if (patientData) {
            setPatient({
              id: patientData.id,
              full_name: patientData.full_name,
              age: patientData.age,
              gender: patientData.gender as 'male' | 'female',
              phone: patientData.phone,
              mrn: patientData.mrn,
              national_id: patientData.national_id,
              chronic_conditions: patientData.chronic_conditions,
              created_at: patientData.created_at,
              updated_at: patientData.updated_at || patientData.created_at,
            });
          }
        }

        // Load departments
        const depts = await departmentsService.getAll();
        setDepartments(depts.map(d => ({ id: d.id, name: d.name })));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId]);

  const onSubmit = async (data: CreateRequestFormData) => {
    setIsSubmitting(true);

    try {
      await requestsService.create({
        case_id: data.case_id,
        target_department_id: data.target_department_id,
        request_type: data.request_type as any,
        urgency: data.urgency as any,
        title: data.title,
        description: data.description,
        requested_by: user?.id || '',
        status: 'pending',
      });

      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error("Error creating consultation request:", error);
      alert("Failed to create consultation request. Please try again.");
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

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">
            Case Not Found
          </h2>
          <p className="text-gray-500 mt-1">
            Unable to find the case for this consultation request.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Request Consultation
          </h1>
          <p className="text-gray-500">
            Case {caseData.case_number}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Case & Patient Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient ? (
                <div className="space-y-2">
                  <div className="font-semibold">{patient.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.age}y, {patient.gender}
                  </div>
                  {patient.allergies && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      Allergies: {patient.allergies}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Unknown patient</p>
              )}
            </CardContent>
          </Card>

          {/* Case Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Priority</span>
                <PriorityBadge priority={caseData.priority} size="sm" />
              </div>
              <div>
                <span className="text-gray-500 text-sm">Chief Complaint</span>
                <p className="text-sm mt-1">{caseData.chief_complaint || caseData.initial_complaint}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vitals */}
          {caseData && (caseData.blood_pressure_systolic || caseData.heart_rate || caseData.temperature) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                Consultation Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Specialty Department <span className="text-red-500">*</span>
                  </label>
                  <Select {...register("target_department_id")}>
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                  {errors.target_department_id && (
                    <p className="text-sm text-red-500">
                      {errors.target_department_id.message}
                    </p>
                  )}
                </div>

                {/* Request Type */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Request Type <span className="text-red-500">*</span>
                  </label>
                  <Select {...register("request_type")}>
                    {REQUEST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                  {errors.request_type && (
                    <p className="text-sm text-red-500">
                      {errors.request_type.message}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Select {...register("urgency")}>
                    {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                  {errors.urgency && (
                    <p className="text-sm text-red-500">
                      {errors.urgency.message}
                    </p>
                  )}
                  
                  {/* Priority Info */}
                  {watchPriority && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      watchPriority === "critical" 
                        ? "bg-red-50 text-red-700" 
                        : watchPriority === "urgent"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-green-50 text-green-700"
                    }`}>
                      <p className="text-sm">
                        {watchPriority === "critical" 
                          ? "Critical: Consultant will be notified immediately. Response expected within 15 minutes."
                          : watchPriority === "urgent"
                          ? "Urgent: Consultant will be notified promptly. Response expected within 30 minutes."
                          : "Stable: Standard consultation request. Response expected within 60 minutes."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Request Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("title")}
                    placeholder="Brief title for this request..."
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description/Reason for Request */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Consultation <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    {...register("description")}
                    placeholder="Describe the reason for this consultation request and any specific clinical questions..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
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
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
