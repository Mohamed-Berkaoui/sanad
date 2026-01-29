"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard, PriorityBadge, SLATimer, AlertCard } from "@/components/common";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuthStore } from "@/lib/stores";
import { casesService, requestsService, alertsService, usersService } from "@/lib/services/api";
import { formatTime, getRemainingTime } from "@/lib/utils";
import type { User, Case, ConsultationRequest, Alert } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function FlowManagerDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeCases, setActiveCases] = useState<Case[]>([]);
  const [pendingAlerts, setPendingAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    criticalCases: 0,
    slaBreaches: 0,
    avgWaitTime: 0,
    pendingRequests: 0,
    staffOnDuty: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load all data in parallel
        const [cases, caseStats, requestStats, allUsers] = await Promise.all([
          casesService.getActive(),
          casesService.getStats(),
          requestsService.getStats(),
          usersService.getAll(),
        ]);

        setActiveCases(cases);

        // Calculate stats
        const breaches = cases.filter(
          (c) => c.sla_deadline && new Date(c.sla_deadline) < new Date()
        ).length;

        const onDutyCount = allUsers.filter(u => u.is_on_duty).length;

        setStats({
          totalActive: caseStats.open + caseStats.inProgress,
          criticalCases: caseStats.critical,
          slaBreaches: requestStats.breached,
          avgWaitTime: 45, // Would need actual calculation
          pendingRequests: requestStats.pending,
          staffOnDuty: onDutyCount,
        });

        // Load alerts for flow manager
        if (user?.id) {
          const alerts = await alertsService.getForUser(user.id);
          setPendingAlerts(alerts.filter(a => a.status === 'pending'));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleDismissAlert = async (alertId?: string) => {
    if (alertId && user?.id) {
      try {
        await alertsService.updateStatus(alertId, 'resolved', user.id);
        setPendingAlerts(prev => prev.filter(a => a.id !== alertId));
      } catch (error) {
        console.error('Failed to dismiss alert:', error);
      }
    }
  };

  const handleEscalate = (caseId: string) => {
    console.log("Escalating case:", caseId);
    // TODO: Implement escalation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Flow Manager Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.full_name} • Real-time ER Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/analytics">
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {pendingAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts ({pendingAlerts.length})
            </h3>
            <Button variant="ghost" size="sm" className="text-red-700">
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {pendingAlerts.slice(0, 2).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Active Cases"
          value={stats.totalActive}
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Critical"
          value={stats.criticalCases}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatsCard
          title="SLA Breaches"
          value={stats.slaBreaches}
          icon={Clock}
          variant={stats.slaBreaches > 0 ? "urgent" : "stable"}
        />
        <StatsCard
          title="Avg Wait Time"
          value={`${stats.avgWaitTime}m`}
          icon={Clock}
          variant="primary"
          trend={{ value: 5, direction: "down" }}
        />
        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Bell}
          variant={stats.pendingRequests > 0 ? "urgent" : "stable"}
        />
        <StatsCard
          title="Staff On Duty"
          value={stats.staffOnDuty}
          icon={Users}
          variant="primary"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Live Overview
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="h-4 w-4" />
            SLA Monitor
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <Users className="h-4 w-4" />
            Staff Status
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Quick Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Cases List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Active Cases</CardTitle>
                  <Link href="/cases">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeCases.slice(0, 8).map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell>
                            <div>
                              <span className="font-mono text-sm">
                                {caseItem.case_number}
                              </span>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                {caseItem.chief_complaint}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge
                              priority={caseItem.priority}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            {caseItem.sla_deadline ? (
                              <SLATimer
                                deadline={caseItem.sla_deadline}
                                compact
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                caseItem.status === "open"
                                  ? "bg-blue-100 text-blue-700"
                                  : caseItem.status === "in_progress"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {caseItem.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/cases/${caseItem.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEscalate(caseItem.id)}
                              >
                                <ArrowUpRight className="h-4 w-4 text-orange-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              {/* Priority Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Critical",
                      count: stats.criticalCases,
                      color: "bg-red-500",
                      percentage:
                        stats.totalActive > 0
                          ? Math.round(
                              (stats.criticalCases / stats.totalActive) * 100
                            )
                          : 0,
                    },
                    {
                      label: "Urgent",
                      count: activeCases.filter((c) => c.priority === "urgent")
                        .length,
                      color: "bg-orange-500",
                      percentage:
                        stats.totalActive > 0
                          ? Math.round(
                              (activeCases.filter((c) => c.priority === "urgent")
                                .length /
                                stats.totalActive) *
                                100
                            )
                          : 0,
                    },
                    {
                      label: "Stable",
                      count: activeCases.filter((c) => c.priority === "stable")
                        .length,
                      color: "bg-green-500",
                      percentage:
                        stats.totalActive > 0
                          ? Math.round(
                              (activeCases.filter((c) => c.priority === "stable")
                                .length /
                                stats.totalActive) *
                                100
                            )
                          : 0,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Department Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Department Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Cardiology", requests: 3, available: true },
                    { name: "Neurology", requests: 2, available: true },
                    { name: "Orthopedics", requests: 1, available: true },
                    { name: "Pediatrics", requests: 0, available: false },
                  ].map((dept) => (
                    <div
                      key={dept.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            dept.available ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm">{dept.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {dept.requests} pending
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SLA Monitor Tab */}
        <TabsContent value="sla" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                SLA Performance Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Time Elapsed</TableHead>
                    <TableHead>SLA Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCases.map((caseItem) => {
                    const slaStatus = caseItem.sla_deadline
                      ? getRemainingTime(caseItem.sla_deadline)
                      : null;
                    const isBreached =
                      slaStatus && new Date(caseItem.sla_deadline!) < new Date();

                    return (
                      <TableRow
                        key={caseItem.id}
                        className={isBreached ? "bg-red-50" : ""}
                      >
                        <TableCell className="font-mono text-sm">
                          {caseItem.case_number}
                        </TableCell>
                        <TableCell>{caseItem.patient?.full_name || "Unknown"}</TableCell>
                        <TableCell>
                          <PriorityBadge priority={caseItem.priority} size="sm" />
                        </TableCell>
                        <TableCell>{formatTime(caseItem.arrival_time)}</TableCell>
                        <TableCell>
                          {caseItem.sla_deadline ? (
                            <SLATimer deadline={caseItem.sla_deadline} />
                          ) : (
                            <span className="text-gray-400">No SLA</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isBreached && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleEscalate(caseItem.id)}
                              >
                                Escalate
                              </Button>
                            )}
                            <Link href={`/cases/${caseItem.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Status Tab */}
        <TabsContent value="staff" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Staff On Duty
                </CardTitle>
                <Link href="/staff">
                  <Button variant="outline" size="sm">
                    Manage Staff
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Nurses */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Nurses (4 on duty)
                  </h4>
                  <div className="space-y-2">
                    {["Sarah Ahmed", "Fatima Hassan", "Noor Ali", "Maryam Omar"].map(
                      (name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{name}</span>
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Available
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* ER Doctors */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    ER Doctors (3 on duty)
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: "Dr. Ahmed Khalil", status: "Available" },
                      { name: "Dr. Mohammed Salem", status: "With Patient" },
                      { name: "Dr. Hassan Farid", status: "Available" },
                    ].map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{doc.name}</span>
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            doc.status === "Available"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {doc.status === "Available" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultants */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Consultants (5 available)
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: "Dr. Sara Mansour", dept: "Cardiology" },
                      { name: "Dr. Ali Hassan", dept: "Neurology" },
                      { name: "Dr. Layla Ahmed", dept: "Orthopedics" },
                      { name: "Dr. Omar Nasser", dept: "Internal Med" },
                      { name: "Dr. Rania Khalil", dept: "Surgery" },
                    ].map((consultant) => (
                      <div
                        key={consultant.name}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="text-sm">{consultant.name}</span>
                          <p className="text-xs text-gray-500">{consultant.dept}</p>
                        </div>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today&apos;s Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Total Arrivals",
                      value: 45,
                      change: 12,
                      up: true,
                    },
                    {
                      label: "Average Wait Time",
                      value: "45 min",
                      change: 5,
                      up: false,
                    },
                    {
                      label: "SLA Compliance",
                      value: "92%",
                      change: 3,
                      up: true,
                    },
                    {
                      label: "Discharged",
                      value: 38,
                      change: 8,
                      up: true,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-xl font-semibold">{metric.value}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          metric.up ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {metric.up ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {metric.change}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peak Hours Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { hour: "08:00 - 10:00", load: 85, status: "High" },
                    { hour: "10:00 - 12:00", load: 70, status: "Medium" },
                    { hour: "12:00 - 14:00", load: 55, status: "Normal" },
                    { hour: "14:00 - 16:00", load: 75, status: "Medium" },
                    { hour: "16:00 - 18:00", load: 90, status: "High" },
                    { hour: "18:00 - 20:00", load: 65, status: "Medium" },
                  ].map((slot) => (
                    <div key={slot.hour} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-28">
                        {slot.hour}
                      </span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            slot.load >= 80
                              ? "bg-red-500"
                              : slot.load >= 60
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${slot.load}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium w-16 ${
                          slot.status === "High"
                            ? "text-red-600"
                            : slot.status === "Medium"
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {slot.load}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
