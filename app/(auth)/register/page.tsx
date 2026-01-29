"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole, Department } from "@/lib/types";
import { authService, departmentsService } from "@/lib/services/api";
import {
  Building2,
  User,
  Lock,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  UserCog,
  Heart,
  Users,
} from "lucide-react";

// Form validation schema
const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.enum(["nurse", "er_doctor", "consultant", "flow_manager"]),
  department_id: z.string().optional(),
  specialization: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLE_OPTIONS: { value: UserRole; label: string; icon: typeof User; description: string }[] = [
  { value: "nurse", label: "Nurse", icon: Heart, description: "Triage and patient registration" },
  { value: "er_doctor", label: "ER Doctor", icon: Stethoscope, description: "Emergency assessments" },
  { value: "consultant", label: "Consultant", icon: UserCog, description: "Specialty consultations" },
  { value: "flow_manager", label: "Flow Manager", icon: Users, description: "System administration" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "nurse",
      department_id: "",
      specialization: "",
    },
  });

  const selectedRole = watch("role");

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await departmentsService.getAll();
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    loadDepartments();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.signUp(data.email, data.password, {
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
        department_id: data.department_id || undefined,
        specialization: data.specialization || undefined,
      });

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Your account has been created. Redirecting to login...
              </p>
              <Link href="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">SANAD</h1>
          </div>
          <p className="text-gray-600">
            Hospital ER Management System
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("full_name")}
                    placeholder="Enter your full name"
                    className={cn("pl-10", errors.full_name && "border-red-500")}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email"
                    className={cn("pl-10", errors.email && "border-red-500")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("phone")}
                    placeholder="+966 5XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register("password")}
                      type="password"
                      placeholder="Min 6 characters"
                      className={cn("pl-10", errors.password && "border-red-500")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="Confirm password"
                      className={cn("pl-10", errors.confirmPassword && "border-red-500")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Select Your Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRole === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          {...register("role")}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <Icon className={cn(
                          "h-6 w-6 mb-1",
                          isSelected ? "text-blue-600" : "text-gray-400"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-blue-700" : "text-gray-700"
                        )}>
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-0.5">
                          {option.description}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Department (for consultants) */}
              {selectedRole === "consultant" && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <select
                      {...register("department_id")}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                        errors.department_id ? "border-red-500" : "border-gray-300"
                      )}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Specialization
                    </label>
                    <Input
                      {...register("specialization")}
                      placeholder="e.g., Interventional Cardiology"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} SANAD Hospital. All rights reserved.
        </p>
      </div>
    </div>
  );
}
