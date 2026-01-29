"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { useAuthStore } from "@/lib/stores";
import { alertsService } from "@/lib/services/api";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  const [alertCount, setAlertCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch alert count
  useEffect(() => {
    const fetchAlerts = async () => {
      if (user?.id) {
        try {
          const count = await alertsService.getPendingCount(user.id);
          setAlertCount(count);
        } catch (error) {
          console.error("Failed to fetch alerts:", error);
        }
      }
    };

    if (mounted && _hasHydrated && user?.id) {
      fetchAlerts();
      // Set up polling for alerts (every 30 seconds)
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, mounted, _hasHydrated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && _hasHydrated && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, _hasHydrated, isLoading, isAuthenticated, router]);

  // Show loading while hydrating or checking auth
  if (!mounted || !_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show loading if no user after hydration
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user}
      alertCount={alertCount}
    >
      {children}
    </DashboardLayout>
  );
}
