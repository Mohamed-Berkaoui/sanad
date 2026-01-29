"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS, ROLE_CONFIG } from "@/lib/constants";
import { formatRole } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores";
import { authService } from "@/lib/services/api";
import type { User, UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GitPullRequest,
  Bell,
  Calendar,
  UserCog,
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardList,
  Users,
  GitPullRequest,
  Bell,
  Calendar,
  UserCog,
  AlertTriangle,
  BarChart3,
  Settings,
};

interface SidebarProps {
  user: User | null;
  alertCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  user,
  alertCount = 0,
  collapsed = false,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const userRole = user?.role as UserRole | undefined;

  // Filter navigation items based on user role
  const filteredNavItems = NAVIGATION_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!userRole) return '/login';
    return `/dashboard/${userRole.replace('_', '-')}`;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <Link href={getDashboardUrl()} className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">SANAD</h1>
                <p className="text-xs text-gray-500 -mt-1">Hospital ER System</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <Building2 className="h-8 w-8 text-blue-600 mx-auto" />
          )}
        </div>

        {/* User Profile Summary */}
        <div className={cn("p-4 border-b border-gray-200", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar
              src={user?.avatar_url}
              alt={user?.full_name}
              fallback={user?.full_name?.charAt(0) || "U"}
              size={collapsed ? "sm" : "md"}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500">{formatRole(user?.role || "")}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      user?.is_on_duty ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  <span className="text-xs text-gray-500">
                    {user?.is_on_duty ? "On Duty" : "Off Duty"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const badge = item.id === "alerts" && alertCount > 0 ? alertCount : item.badge;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge !== undefined && badge > 0 && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {!collapsed && (
            <>
              <Link
                href="/settings"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          )}

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors mt-2",
              collapsed ? "w-full" : "ml-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
