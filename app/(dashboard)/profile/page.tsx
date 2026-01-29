"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores";
import { usersService } from "@/lib/services/api";
import { formatRole } from "@/lib/utils";
import type { User, NotificationChannel } from "@/lib/types";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Bell,
  Shield,
  Calendar,
  Clock,
  Save,
  Camera,
  MessageSquare,
} from "lucide-react";

// Profile form schema
const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  specialization: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, setUser } = useAuthStore();
  const [user, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPref, setNotificationPref] = useState<NotificationChannel>("both");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const loadUser = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const userData: any = await usersService.getById(authUser.id);
        if (userData) {
          const deptData = userData.departments || userData.department;
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role as any,
            phone: userData.phone,
            whatsapp_number: userData.whatsapp_number,
            employee_id: userData.employee_id,
            department_id: userData.department_id,
            specialization: userData.specialization,
            notification_preference: userData.notification_preference as any || 'app',
            is_active: userData.is_active ?? true,
            is_on_duty: userData.is_on_duty ?? false,
            dnd_status: userData.dnd_status ?? false,
            avatar_url: userData.avatar_url,
            created_at: userData.created_at,
            updated_at: userData.updated_at || userData.created_at,
            department: deptData ? {
              id: deptData.id,
              name: deptData.name,
              code: deptData.code || '',
              is_active: deptData.is_active ?? true,
              created_at: deptData.created_at || userData.created_at,
              updated_at: deptData.updated_at || deptData.created_at || userData.created_at,
            } : undefined,
          };
          setLocalUser(mappedUser);
          setNotificationPref(mappedUser.notification_preference || "both");
          
          reset({
            full_name: mappedUser.full_name,
            email: mappedUser.email,
            phone: mappedUser.phone || "",
            whatsapp_number: mappedUser.whatsapp_number || "",
            specialization: mappedUser.specialization || "",
          });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [authUser, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    try {
      await usersService.update(user.id, {
        full_name: data.full_name,
        phone: data.phone || null,
        whatsapp_number: data.whatsapp_number || null,
        specialization: data.specialization || null,
        notification_preference: notificationPref,
      });
      
      // Update local state
      const updatedUser = {
        ...user,
        ...data,
        notification_preference: notificationPref,
      };
      setLocalUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={user.avatar_url}
                alt={user.full_name}
                fallback={user.full_name.charAt(0)}
                size="xl"
              />
              <button
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.full_name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {formatRole(user.role)}
                </Badge>
                {user.department && (
                  <Badge variant="secondary">{user.department.name}</Badge>
                )}
                <Badge variant={user.is_on_duty ? "default" : "secondary"}>
                  {user.is_on_duty ? "On Duty" : "Off Duty"}
                </Badge>
              </div>
              {user.employee_id && (
                <p className="text-sm text-gray-500 mt-2">
                  Employee ID: {user.employee_id}
                </p>
              )}
            </div>

            {/* Edit Button */}
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-500" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  {...register("full_name")}
                  disabled={!isEditing}
                  className={errors.full_name ? "border-red-500" : ""}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("email")}
                    disabled={!isEditing}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("phone")}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register("whatsapp_number")}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used for urgent notifications via WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Work Information
              </CardTitle>
              <CardDescription>Your role and department details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={formatRole(user.role)}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contact administrator to change role
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={user.department?.name || "Not assigned"}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              {(user.role === "consultant" || user.role === "er_doctor") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <Input
                    {...register("specialization")}
                    disabled={!isEditing}
                    placeholder="e.g., Interventional Cardiology"
                  />
                </div>
              )}

              <Separator />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <Input
                  value={user.employee_id || "Not assigned"}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Created
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: "app" as const, label: "App Only", desc: "In-app notifications only" },
                  { value: "whatsapp" as const, label: "WhatsApp Only", desc: "WhatsApp messages only" },
                  { value: "both" as const, label: "Both", desc: "App and WhatsApp notifications" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setNotificationPref(option.value)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      notificationPref === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.label}</span>
                      {notificationPref === option.value && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Duty Status (for consultants) */}
      {user.role === "consultant" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Duty Status
            </CardTitle>
            <CardDescription>Manage your availability status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Status</p>
                <p className="text-sm text-gray-500">
                  {user.is_on_duty
                    ? "You are currently on duty and can receive consultation requests"
                    : "You are off duty and will not receive new requests"}
                </p>
              </div>
              <Button
                variant={user.is_on_duty ? "outline" : "default"}
                onClick={() => {
                  // TODO: Update via Supabase
                  const updatedUser = { ...user, is_on_duty: !user.is_on_duty };
                  setLocalUser(updatedUser);
                  setUser(updatedUser);
                }}
              >
                {user.is_on_duty ? "Go Off Duty" : "Go On Duty"}
              </Button>
            </div>

            {user.dnd_status && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Do Not Disturb</strong> is enabled
                  {user.dnd_until && ` until ${new Date(user.dnd_until).toLocaleString()}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
