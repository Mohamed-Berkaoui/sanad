"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatsCard, CaseCard, PriorityBadge } from "@/components/common";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatTime, formatPatientInfo } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";
import { casesService } from "@/lib/services/api";
import type { User, Case, Patient } from "@/lib/types";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle,
  Plus,
  Eye,
} from "lucide-react";

export default function NurseDashboardPage() {
  const { user } = useAuthStore();
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [criticalCases, setCriticalCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    criticalCases: 0,
    urgentCases: 0,
    stableCases: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load stats and cases from Supabase
        const [caseStats, todayCases, critical] = await Promise.all([
          casesService.getStats(),
          casesService.getToday(),
          casesService.getByPriority('critical'),
        ]);

        setStats({
          totalToday: caseStats.totalToday,
          criticalCases: caseStats.critical,
          urgentCases: caseStats.urgent,
          stableCases: caseStats.stable,
        });

        setRecentCases(todayCases.slice(0, 10));
        setCriticalCases(critical);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "Nurse"}
          </h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
        <Link href="/patients/register">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Register New Patient
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Cases Today"
          value={stats.totalToday}
          icon={ClipboardList}
          variant="primary"
        />
        <StatsCard
          title="Critical Cases"
          value={stats.criticalCases}
          icon={AlertCircle}
          variant="critical"
        />
        <StatsCard
          title="Urgent Cases"
          value={stats.urgentCases}
          icon={Clock}
          variant="urgent"
        />
        <StatsCard
          title="Stable Cases"
          value={stats.stableCases}
          icon={CheckCircle}
          variant="stable"
        />
      </div>

      {/* Quick Action - Register Patient */}
      <Card className="bg-linear-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h3 className="text-xl font-semibold mb-1">Register New Patient</h3>
              <p className="text-blue-100">
                Start the triage process by registering a new patient arrival
              </p>
            </div>
            <Link href="/patients/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5 mr-2" />
                Register Patient
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No cases registered yet today
                  </TableCell>
                </TableRow>
              ) : (
                recentCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-mono text-sm">
                      {caseItem.case_number}
                    </TableCell>
                    <TableCell>
                      {caseItem.patient
                        ? formatPatientInfo(
                            caseItem.patient.full_name,
                            caseItem.patient.age,
                            caseItem.patient.gender
                          )
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatTime(caseItem.arrival_time)}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={caseItem.priority} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        caseItem.status === "open" ? "bg-blue-100 text-blue-700" :
                        caseItem.status === "in_progress" ? "bg-purple-100 text-purple-700" :
                        caseItem.status === "discharged" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {caseItem.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/cases/${caseItem.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination placeholder */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Showing 1-{recentCases.length} of {stats.totalToday}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Cases Alert */}
      {stats.criticalCases > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Critical Cases Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {criticalCases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  caseData={caseItem}
                  compact
                  showActions={false}
                  onView={(id) => window.location.href = `/cases/${id}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
