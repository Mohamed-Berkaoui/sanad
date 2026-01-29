"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard, CaseCard, PriorityBadge, SLATimer } from "@/components/common";
import { useAuthStore } from "@/lib/stores";
import { casesService } from "@/lib/services/api";
import type { User, Case, Patient } from "@/lib/types";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Activity,
  FileText,
  Stethoscope,
  Eye,
  ClipboardList,
} from "lucide-react";

export default function ERDoctorDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<{
    critical: Case[];
    urgent: Case[];
    stable: Case[];
  }>({
    critical: [],
    urgent: [],
    stable: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Get cases by priority
        const [criticalCases, urgentCases, stableCases] = await Promise.all([
          casesService.getByPriority('critical'),
          casesService.getByPriority('urgent'),
          casesService.getByPriority('stable'),
        ]);

        setCases({
          critical: criticalCases,
          urgent: urgentCases,
          stable: stableCases,
        });
      } catch (error) {
        console.error('Failed to load cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const allCases = [...cases.critical, ...cases.urgent, ...cases.stable];

  const stats = {
    totalActive: allCases.length,
    critical: cases.critical.length,
    urgent: cases.urgent.length,
    stable: cases.stable.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ER Doctor Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.full_name} • {user?.department?.name || "Emergency Department"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Today&apos;s Date:</span>
          <span className="font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Active Cases"
          value={stats.totalActive}
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Critical"
          value={stats.critical}
          icon={AlertCircle}
          variant="critical"
          subtitle="Immediate attention required"
        />
        <StatsCard
          title="Urgent"
          value={stats.urgent}
          icon={Clock}
          variant="urgent"
          subtitle="Within 30 minutes"
        />
        <StatsCard
          title="Stable"
          value={stats.stable}
          icon={CheckCircle}
          variant="stable"
          subtitle="Non-urgent care"
        />
      </div>

      {/* Critical Cases Alert Banner */}
      {cases.critical.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                {cases.critical.length} Critical Case{cases.critical.length > 1 ? "s" : ""} Requiring Immediate Attention
              </h3>
              <p className="text-red-700 text-sm mt-1">
                Please prioritize these cases. SLA timer is active.
              </p>
            </div>
            <Link href="#critical-cases">
              <Button variant="destructive" size="sm">
                View Critical
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Cases Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              All ({allCases.length})
            </TabsTrigger>
            <TabsTrigger value="critical" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Critical ({cases.critical.length})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="gap-2">
              <Clock className="h-4 w-4" />
              Urgent ({cases.urgent.length})
            </TabsTrigger>
            <TabsTrigger value="stable" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Stable ({cases.stable.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Cases Tab */}
        <TabsContent value="all">
          <div className="space-y-4">
            {allCases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No active cases</p>
                  <p className="text-sm mt-1">
                    New cases will appear here when registered by nursing staff
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {allCases.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    caseData={caseItem}
                    onView={(id) => (window.location.href = `/cases/${id}`)}
                    onRequestConsultation={(id) =>
                      (window.location.href = `/cases/${id}/request-consultation`)
                    }
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Critical Cases Tab */}
        <TabsContent value="critical" id="critical-cases">
          <div className="space-y-4">
            {cases.critical.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
                  <p>No critical cases at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cases.critical.map((caseItem) => (
                  <Card key={caseItem.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              {caseItem.case_number}
                            </span>
                            <PriorityBadge priority={caseItem.priority} />
                          </div>
                          <h3 className="font-semibold text-lg">
                            {caseItem.patient?.full_name || "Unknown Patient"}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {caseItem.patient?.age}y, {caseItem.patient?.gender} •{" "}
                            {caseItem.chief_complaint}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/cases/${caseItem.id}`}>
                            <Button className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Urgent Cases Tab */}
        <TabsContent value="urgent">
          <div className="space-y-4">
            {cases.urgent.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <Clock className="h-10 w-10 mx-auto mb-3 text-orange-400" />
                  <p>No urgent cases at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {cases.urgent.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    caseData={caseItem}
                    onView={(id) => (window.location.href = `/cases/${id}`)}
                    onRequestConsultation={(id) =>
                      (window.location.href = `/cases/${id}/request-consultation`)
                    }
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stable Cases Tab */}
        <TabsContent value="stable">
          <div className="space-y-4">
            {cases.stable.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-green-400" />
                  <p>No stable cases at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {cases.stable.map((caseItem) => (
                  <CaseCard
                    key={caseItem.id}
                    caseData={caseItem}
                    onView={(id) => (window.location.href = `/cases/${id}`)}
                    onRequestConsultation={(id) =>
                      (window.location.href = `/cases/${id}/request-consultation`)
                    }
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/cases" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-medium">View All Cases</div>
                <p className="text-sm text-gray-500">Browse complete case list</p>
              </div>
            </Link>
            <Link href="/requests" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="font-medium">My Requests</div>
                <p className="text-sm text-gray-500">Track consultation requests</p>
              </div>
            </Link>
            <div className="p-4 border rounded-lg bg-gray-50 transition-colors text-center opacity-60 cursor-not-allowed">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="font-medium">Generate OVR</div>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
