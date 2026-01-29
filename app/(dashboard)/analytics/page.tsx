"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/common";
import { casesService, requestsService, departmentsService } from "@/lib/services/api";
import {
  Activity,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Stats state
  const [overviewStats, setOverviewStats] = useState({
    totalCases: 0,
    avgWaitTime: 0,
    slaCompliance: 0,
    patientSatisfaction: 0,
    casesChange: 0,
    waitTimeChange: 0,
    slaChange: 0,
    satisfactionChange: 0,
  });

  const [caseStats, setCaseStats] = useState({
    totalToday: 0,
    critical: 0,
    urgent: 0,
    stable: 0,
    open: 0,
    inProgress: 0,
    discharged: 0,
  });

  const [requestStats, setRequestStats] = useState({
    pending: 0,
    acknowledged: 0,
    inProgress: 0,
    completed: 0,
    breached: 0,
  });

  const [departmentStats, setDepartmentStats] = useState<{
    name: string;
    requests: number;
    avgResponse: number;
    compliance: number;
  }[]>([]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Load case stats
      const cases = await casesService.getStats();
      setCaseStats(cases);

      // Load request stats
      const requests = await requestsService.getStats();
      setRequestStats(requests);

      // Load departments
      const depts = await departmentsService.getAll();
      const deptStats = depts.map((d: any) => ({
        name: d.name,
        requests: Math.floor(Math.random() * 50) + 10, // Placeholder - would come from real query
        avgResponse: Math.floor(Math.random() * 20) + 10,
        compliance: Math.floor(Math.random() * 15) + 85,
      }));
      setDepartmentStats(deptStats);

      // Calculate overview stats
      const totalCases = cases.totalToday || (cases.open + cases.inProgress + cases.discharged);
      const slaCompliance = requests.completed > 0 
        ? Math.round(((requests.completed - requests.breached) / requests.completed) * 100)
        : 100;

      setOverviewStats({
        totalCases,
        avgWaitTime: 38, // Placeholder
        slaCompliance,
        patientSatisfaction: 4.6, // Placeholder
        casesChange: 12, // Placeholder - would compare with previous period
        waitTimeChange: -8,
        slaChange: 2.5,
        satisfactionChange: 0.3,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  // Priority breakdown from case stats
  const totalPriority = caseStats.critical + caseStats.urgent + caseStats.stable;
  const priorityBreakdown = [
    { priority: "Critical", count: caseStats.critical, percentage: totalPriority > 0 ? Math.round((caseStats.critical / totalPriority) * 100) : 0 },
    { priority: "Urgent", count: caseStats.urgent, percentage: totalPriority > 0 ? Math.round((caseStats.urgent / totalPriority) * 100) : 0 },
    { priority: "Stable", count: caseStats.stable, percentage: totalPriority > 0 ? Math.round((caseStats.stable / totalPriority) * 100) : 0 },
  ];

  // Mock hourly distribution (would come from real query in production)
  const hourlyDistribution = [
    { hour: "00:00", cases: 8 },
    { hour: "02:00", cases: 5 },
    { hour: "04:00", cases: 4 },
    { hour: "06:00", cases: 12 },
    { hour: "08:00", cases: 28 },
    { hour: "10:00", cases: 35 },
    { hour: "12:00", cases: 30 },
    { hour: "14:00", cases: 32 },
    { hour: "16:00", cases: 38 },
    { hour: "18:00", cases: 42 },
    { hour: "20:00", cases: 25 },
    { hour: "22:00", cases: 15 },
  ];

  // Mock weekly trends (would come from real query in production)
  const weeklyTrends = [
    { day: "Mon", cases: 52, wait: 35 },
    { day: "Tue", cases: 48, wait: 38 },
    { day: "Wed", cases: 55, wait: 42 },
    { day: "Thu", cases: 49, wait: 36 },
    { day: "Fri", cases: 58, wait: 40 },
    { day: "Sat", cases: 42, wait: 32 },
    { day: "Sun", cases: 38, wait: 28 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Comprehensive ER performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>
          <Button variant="outline" className="gap-2" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Cases"
          value={overviewStats.totalCases}
          icon={Activity}
          variant="primary"
          trend={{
            value: overviewStats.casesChange,
            direction: overviewStats.casesChange > 0 ? "up" : "down",
          }}
        />
        <StatsCard
          title="Avg Wait Time"
          value={`${overviewStats.avgWaitTime} min`}
          icon={Clock}
          variant={overviewStats.avgWaitTime > 45 ? "urgent" : "stable"}
          trend={{
            value: Math.abs(overviewStats.waitTimeChange),
            direction: overviewStats.waitTimeChange < 0 ? "down" : "up",
          }}
        />
        <StatsCard
          title="SLA Compliance"
          value={`${overviewStats.slaCompliance}%`}
          icon={CheckCircle}
          variant={overviewStats.slaCompliance >= 90 ? "stable" : "urgent"}
          trend={{
            value: overviewStats.slaChange,
            direction: overviewStats.slaChange > 0 ? "up" : "down",
          }}
        />
        <StatsCard
          title="Patient Satisfaction"
          value={`${overviewStats.patientSatisfaction}/5`}
          icon={Users}
          variant="primary"
          trend={{
            value: overviewStats.satisfactionChange,
            direction: overviewStats.satisfactionChange > 0 ? "up" : "down",
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <PieChart className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="h-4 w-4" />
            SLA Analysis
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hourly Case Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hourlyDistribution.map((item) => {
                    const maxCases = Math.max(...hourlyDistribution.map((h) => h.cases));
                    const percentage = (item.cases / maxCases) * 100;
                    return (
                      <div key={item.hour} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-12">
                          {item.hour}
                        </span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 80
                                ? "bg-red-500"
                                : percentage >= 60
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">
                          {item.cases}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priorityBreakdown.map((item) => (
                    <div key={item.priority} className="space-y-2">
                      <div className="flex justify-between">
                        <span
                          className={`text-sm font-medium ${
                            item.priority === "Critical"
                              ? "text-red-600"
                              : item.priority === "Urgent"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} cases ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.priority === "Critical"
                              ? "bg-red-500"
                              : item.priority === "Urgent"
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {priorityBreakdown[0].count}
                    </div>
                    <div className="text-xs text-gray-500">Critical</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {priorityBreakdown[1].count}
                    </div>
                    <div className="text-xs text-gray-500">Urgent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {priorityBreakdown[2].count}
                    </div>
                    <div className="text-xs text-gray-500">Stable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Department Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Department
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        Total Requests
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        Avg Response (min)
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                        SLA Compliance
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept) => (
                      <tr key={dept.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{dept.name}</td>
                        <td className="py-3 px-4 text-center">{dept.requests}</td>
                        <td className="py-3 px-4 text-center">{dept.avgResponse}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              dept.compliance >= 95
                                ? "bg-green-100 text-green-700"
                                : dept.compliance >= 90
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {dept.compliance}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  dept.compliance >= 95
                                    ? "bg-green-500"
                                    : dept.compliance >= 90
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${dept.compliance}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cases Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">
                    Daily Case Volume
                  </h4>
                  <div className="flex items-end gap-2 h-32">
                    {weeklyTrends.map((day) => {
                      const maxCases = Math.max(...weeklyTrends.map((d) => d.cases));
                      const height = (day.cases / maxCases) * 100;
                      return (
                        <div
                          key={day.day}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                            style={{ height: `${height}%` }}
                            title={`${day.cases} cases`}
                          />
                          <span className="text-xs text-gray-500 mt-2">
                            {day.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wait Time Chart */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">
                    Average Wait Time (minutes)
                  </h4>
                  <div className="flex items-end gap-2 h-32">
                    {weeklyTrends.map((day) => {
                      const maxWait = Math.max(...weeklyTrends.map((d) => d.wait));
                      const height = (day.wait / maxWait) * 100;
                      return (
                        <div
                          key={day.day}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className={`w-full rounded-t transition-colors ${
                              day.wait > 40
                                ? "bg-red-500 hover:bg-red-600"
                                : day.wait > 35
                                ? "bg-orange-500 hover:bg-orange-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                            style={{ height: `${height}%` }}
                            title={`${day.wait} minutes`}
                          />
                          <span className="text-xs text-gray-500 mt-2">
                            {day.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Tab */}
        <TabsContent value="sla" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLA by Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SLA Performance by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      priority: "Critical",
                      target: 15,
                      actual: 12,
                      compliance: 98,
                    },
                    {
                      priority: "Urgent",
                      target: 30,
                      actual: 28,
                      compliance: 92,
                    },
                    {
                      priority: "Stable",
                      target: 60,
                      actual: 45,
                      compliance: 96,
                    },
                  ].map((item) => (
                    <div key={item.priority} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            item.priority === "Critical"
                              ? "text-red-600"
                              : item.priority === "Urgent"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.priority}
                        </span>
                        <div className="text-sm text-gray-500">
                          Target: {item.target} min | Actual: {item.actual} min
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.compliance >= 95
                                ? "bg-green-500"
                                : item.compliance >= 90
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${item.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">
                          {item.compliance}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA Breaches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Recent SLA Breaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      case: "ER-2024-0156",
                      priority: "Critical",
                      delay: 5,
                      reason: "Consultant unavailable",
                    },
                    {
                      case: "ER-2024-0148",
                      priority: "Urgent",
                      delay: 12,
                      reason: "High volume",
                    },
                    {
                      case: "ER-2024-0142",
                      priority: "Urgent",
                      delay: 8,
                      reason: "Documentation delay",
                    },
                  ].map((breach, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-medium">
                          {breach.case}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            breach.priority === "Critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {breach.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-orange-700 font-medium">
                          +{breach.delay} min
                        </span>{" "}
                        over target • {breach.reason}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total breaches this period</span>
                    <span className="font-medium text-orange-600">18 cases</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
