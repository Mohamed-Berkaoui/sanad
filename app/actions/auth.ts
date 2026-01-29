"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { User, UserRole, NotificationChannel } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client that bypasses RLS
function getAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to convert null to undefined for User type compatibility
function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    full_name: dbUser.full_name,
    phone: dbUser.phone || undefined,
    whatsapp_number: dbUser.whatsapp_number || undefined,
    role: dbUser.role as UserRole,
    department_id: dbUser.department_id || undefined,
    specialization: dbUser.specialization || undefined,
    employee_id: dbUser.employee_id || undefined,
    avatar_url: dbUser.avatar_url || undefined,
    is_active: dbUser.is_active ?? true,
    is_on_duty: dbUser.is_on_duty ?? false,
    dnd_status: dbUser.dnd_status ?? false,
    dnd_until: dbUser.dnd_until || undefined,
    last_seen_at: dbUser.last_seen_at || undefined,
    notification_preference: (dbUser.notification_preference as NotificationChannel) || 'both',
    created_at: dbUser.created_at || new Date().toISOString(),
    updated_at: dbUser.updated_at || new Date().toISOString(),
    department: dbUser.department ? {
      id: dbUser.department.id,
      name: dbUser.department.name,
      code: dbUser.department.code,
      description: dbUser.department.description || undefined,
      is_active: dbUser.department.is_active ?? true,
      created_at: dbUser.department.created_at || new Date().toISOString(),
      updated_at: dbUser.department.updated_at || new Date().toISOString(),
    } : undefined,
  };
}

export async function createUserProfile(
  userId: string,
  email: string,
  userData: {
    full_name: string;
    role: Database["public"]["Enums"]["user_role"];
    phone?: string;
    department_id?: string;
    specialization?: string;
  }
): Promise<User> {
  const adminClient = getAdminClient();

  // Check if profile already exists
  const { data: existingUser } = await adminClient
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingUser) {
    // Update existing profile
    const { data, error } = await adminClient
      .from("users")
      .update({
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone || null,
        department_id: userData.department_id || null,
        specialization: userData.specialization || null,
        is_active: true,
        is_on_duty: false,
        dnd_status: false,
        notification_preference: "both",
      })
      .eq("id", userId)
      .select(`
        *,
        department:departments(*)
      `)
      .single();

    if (error) {
      console.error("Failed to update user profile:", error);
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return mapDbUserToUser(data);
  }

  // Create new profile
  const { data, error } = await adminClient
    .from("users")
    .insert({
      id: userId,
      email,
      full_name: userData.full_name,
      role: userData.role,
      phone: userData.phone || null,
      department_id: userData.department_id || null,
      specialization: userData.specialization || null,
      is_active: true,
      is_on_duty: false,
      dnd_status: false,
      notification_preference: "both",
    })
    .select(`
      *,
      department:departments(*)
    `)
    .single();

  if (error) {
    console.error("Failed to create user profile:", error);
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return mapDbUserToUser(data);
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const adminClient = getAdminClient();

  const { data, error } = await adminClient
    .from("users")
    .select(`
      *,
      department:departments(*)
    `)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }

  return mapDbUserToUser(data);
}
