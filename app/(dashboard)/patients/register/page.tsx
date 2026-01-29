'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/lib/stores';
import { patientsService, casesService } from '@/lib/services/api';
import { ArrowLeft, UserPlus, AlertTriangle } from 'lucide-react';

// Form type for nurse patient registration
interface NursePatientForm {
  // Required fields
  full_name: string;
  gender: 'male' | 'female' | 'other' | '';
  
  // Optional patient info
  age: string;
  phone: string;
  national_id: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Case info
  arrival_mode: 'walk_in' | 'ambulance' | 'referral' | 'transfer';
  initial_complaint: string;
  is_urgent: boolean;
  
  // Basic vitals
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  temperature: string;
  oxygen_saturation: string;
}

export default function NursePatientRegisterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NursePatientForm>({
    defaultValues: {
      full_name: '',
      gender: '',
      age: '',
      phone: '',
      national_id: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      arrival_mode: 'walk_in',
      initial_complaint: '',
      is_urgent: false,
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      temperature: '',
      oxygen_saturation: '',
    },
  });

  const isUrgent = watch('is_urgent');
  const vitals = watch(['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'temperature', 'oxygen_saturation']);

  // Auto-detect critical vitals
  const hasCriticalVitals = () => {
    const [systolic, diastolic, hr, temp, spo2] = vitals;
    if (systolic && (Number(systolic) > 180 || Number(systolic) < 90)) return true;
    if (diastolic && (Number(diastolic) > 120 || Number(diastolic) < 60)) return true;
    if (hr && (Number(hr) > 120 || Number(hr) < 50)) return true;
    if (temp && (Number(temp) > 39 || Number(temp) < 35)) return true;
    if (spo2 && Number(spo2) < 92) return true;
    return false;
  };

  const onSubmit = async (data: NursePatientForm) => {
    if (!user) {
      addToast({ title: 'You must be logged in', variant: 'error' });
      return;
    }

    // Validate required fields
    if (!data.full_name || data.full_name.trim().length < 2) {
      addToast({ title: 'Full name is required (minimum 2 characters)', variant: 'error' });
      return;
    }

    if (!data.gender) {
      addToast({ title: 'Gender is required', variant: 'error' });
      return;
    }

    if (!data.initial_complaint || data.initial_complaint.trim().length < 1) {
      addToast({ title: 'Chief complaint is required', variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine priority based on urgency and vitals
      let priority: 'critical' | 'urgent' | 'stable' = 'stable';
      if (hasCriticalVitals()) {
        priority = 'critical';
      } else if (data.is_urgent) {
        priority = 'urgent';
      }

      // 1. Create patient record (minimal data)
      const patientData = {
        full_name: data.full_name.trim(),
        gender: data.gender as 'male' | 'female' | 'other',
        age: data.age ? Number(data.age) : null,
        phone: data.phone || null,
        national_id: data.national_id || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
      };

      const patient = await patientsService.create(patientData);

      if (!patient) {
        throw new Error('Failed to create patient');
      }

      // 2. Create case record
      const caseData = {
        patient_id: patient.id,
        status: 'open' as const,
        priority,
        arrival_mode: data.arrival_mode || 'walk_in',
        initial_complaint: data.initial_complaint,
        is_urgent: data.is_urgent || false,
        blood_pressure_systolic: data.blood_pressure_systolic ? Number(data.blood_pressure_systolic) : null,
        blood_pressure_diastolic: data.blood_pressure_diastolic ? Number(data.blood_pressure_diastolic) : null,
        heart_rate: data.heart_rate ? Number(data.heart_rate) : null,
        temperature: data.temperature ? Number(data.temperature) : null,
        oxygen_saturation: data.oxygen_saturation ? Number(data.oxygen_saturation) : null,
        triage_nurse_id: user.id,
        created_by: user.id,
        arrival_time: new Date().toISOString(),
      };

      const newCase = await casesService.create(caseData);

      if (!newCase) {
        throw new Error('Failed to create case');
      }

      addToast({ title: 'Patient registered successfully!', variant: 'success' });
      router.push(`/cases/${newCase.id}`);
    } catch (error) {
      console.error('Registration error:', error);
      addToast({ title: 'Failed to register patient', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Patient</h1>
          <p className="text-gray-600">Quick registration - ER doctor will add details later</p>
        </div>
      </div>

      {/* Critical Alert */}
      {(isUrgent || hasCriticalVitals()) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">
              {hasCriticalVitals() ? 'Critical Vitals Detected!' : 'Urgent Case'}
            </p>
            <p className="text-sm text-red-600">
              This patient will be marked as {hasCriticalVitals() ? 'CRITICAL' : 'URGENT'} priority
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name - Required */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('full_name')}
                  placeholder="Enter patient's full name"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Gender - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('gender')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <Input
                  type="number"
                  {...register('age')}
                  placeholder="Age in years"
                  min={0}
                  max={150}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input {...register('phone')} placeholder="Phone number" />
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <Input {...register('national_id')} placeholder="National ID" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Emergency Contact (Optional)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <Input {...register('emergency_contact_name')} placeholder="Contact name" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <Input {...register('emergency_contact_phone')} placeholder="Contact phone" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arrival Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Mode</label>
                <select
                  {...register('arrival_mode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="walk_in">Walk-in</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="referral">Referral</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Urgent Flag */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_urgent')}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as Urgent
                  </span>
                </label>
              </div>
            </div>

            {/* Chief Complaint - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chief Complaint <span className="text-red-500">*</span>
              </label>
              <Textarea
                {...register('initial_complaint')}
                placeholder="What is the patient's main complaint?"
                rows={3}
                className={errors.initial_complaint ? 'border-red-500' : ''}
              />
              {errors.initial_complaint && (
                <p className="text-sm text-red-500 mt-1">{errors.initial_complaint.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Vitals (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Blood Pressure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BP Systolic</label>
                <Input
                  type="number"
                  {...register('blood_pressure_systolic')}
                  placeholder="120"
                  min={0}
                  max={300}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BP Diastolic</label>
                <Input
                  type="number"
                  {...register('blood_pressure_diastolic')}
                  placeholder="80"
                  min={0}
                  max={200}
                />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
                <Input
                  type="number"
                  {...register('heart_rate')}
                  placeholder="72"
                  min={0}
                  max={300}
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°C)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('temperature')}
                  placeholder="37.0"
                  min={30}
                  max={45}
                />
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
                <Input
                  type="number"
                  {...register('oxygen_saturation')}
                  placeholder="98"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {hasCriticalVitals() && (
              <p className="text-sm text-red-600 mt-3 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                One or more vitals are outside normal range
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Register Patient
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
