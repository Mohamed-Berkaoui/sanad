"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard, RequestCard, PriorityBadge, SLATimer } from "@/components/common";
import { useAuthStore } from "@/lib/stores";
import { requestsService } from "@/lib/services/api";
import type { User, ConsultationRequest } from "@/lib/types";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Inbox,
  Calendar,
  Activity,
  Bell,
  Settings,
} from "lucide-react";

export default function ConsultantDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<{
    pending: ConsultationRequest[];
    acknowledged: ConsultationRequest[];
    in_progress: ConsultationRequest[];
    completed: ConsultationRequest[];
  }>({
    pending: [],
    acknowledged: [],
    in_progress: [],
    completed: [],
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Get requests assigned to this consultant
        const allRequests = await requestsService.getAll({
          consultantId: user.id,
        });

        // Sort by status
        setRequests({
          pending: allRequests.filter(r => r.status === 'pending'),
          acknowledged: allRequests.filter(r => r.status === 'acknowledged'),
          in_progress: allRequests.filter(r => r.status === 'in_progress'),
          completed: allRequests.filter(r => r.status === 'completed'),
        });
      } catch (error) {
        console.error('Failed to load requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const stats = {
    pending: requests.pending.length,
    acknowledged: requests.acknowledged.length,
    inProgress: requests.in_progress.length,
    completedToday: requests.completed.length,
  };

  const handleAcknowledge = async (requestId: string) => {
    if (!user?.id) return;
    try {
      await requestsService.acknowledge(requestId, user.id);
      // Refresh data
      const updated = requests.pending.find(r => r.id === requestId);
      if (updated) {
        setRequests(prev => ({
          ...prev,
          pending: prev.pending.filter(r => r.id !== requestId),
          acknowledged: [...prev.acknowledged, { ...updated, status: 'acknowledged' as const }],
        }));
      }
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const handleStartConsultation = async (requestId: string) => {
    if (!user?.id) return;
    try {
      await requestsService.own(requestId, user.id);
      // Refresh data
      const updated = requests.acknowledged.find(r => r.id === requestId);
      if (updated) {
        setRequests(prev => ({
          ...prev,
          acknowledged: prev.acknowledged.filter(r => r.id !== requestId),
          in_progress: [...prev.in_progress, { ...updated, status: 'in_progress' as const }],
        }));
      }
    } catch (error) {
      console.error('Failed to start consultation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Consultant Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.full_name} • {user?.department?.name || "Specialist Department"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            <Calendar className="h-4 w-4" />
            My Schedule
          </Button>
          <Button variant="outline" className="gap-2" disabled>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value={stats.pending}
          icon={Bell}
          variant={stats.pending > 0 ? "urgent" : "primary"}
          subtitle={stats.pending > 0 ? "Requires attention" : "All caught up"}
        />
        <StatsCard
          title="Acknowledged"
          value={stats.acknowledged}
          icon={CheckCircle}
          variant="primary"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          variant="stable"
        />
      </div>

      {/* Urgent Requests Alert */}
      {requests.pending.some((r) => r.urgency === "critical") && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                Critical Consultation Request
              </h3>
              <p className="text-red-700 text-sm mt-1">
                You have critical priority requests pending. Please acknowledge
                immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Bell className="h-4 w-4" />
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Acknowledged ({stats.acknowledged})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-2">
              <Activity className="h-4 w-4" />
              In Progress ({stats.inProgress})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({stats.completedToday})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {requests.pending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-700">
                    No Pending Requests
                  </h3>
                  <p className="text-gray-500 mt-1">
                    You&apos;re all caught up! New requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests.pending.map((request) => (
                <Card
                  key={request.id}
                  className={`border-l-4 ${
                    request.urgency === "critical"
                      ? "border-l-red-500 bg-red-50/50"
                      : request.urgency === "urgent"
                      ? "border-l-orange-500"
                      : "border-l-green-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                            {request.request_number}
                          </span>
                          <PriorityBadge priority={request.urgency} />
                          {request.sla_deadline && (
                            <SLATimer deadline={request.sla_deadline} />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {request.request_type.replace("_", " ")} - {request.case?.patient?.full_name || "Unknown Patient"}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Case: {request.case?.case_number} • From: {request.requester?.full_name || "ER Doctor"}
                        </p>
                        {request.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {request.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          onClick={() => handleAcknowledge(request.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Acknowledge
                        </Button>
                        <Link href={`/requests/${request.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Acknowledged Tab */}
        <TabsContent value="acknowledged">
          <div className="space-y-4">
            {requests.acknowledged.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No acknowledged requests</p>
                </CardContent>
              </Card>
            ) : (
              requests.acknowledged.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onView={(id) => (window.location.href = `/requests/${id}`)}
                  onTakeOwnership={() => handleStartConsultation(request.id)}
                  showActions
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* In Progress Tab */}
        <TabsContent value="in_progress">
          <div className="space-y-4">
            {requests.in_progress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No consultations in progress</p>
                </CardContent>
              </Card>
            ) : (
              requests.in_progress.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onView={(id) => (window.location.href = `/requests/${id}`)}
                  showActions
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <div className="space-y-4">
            {requests.completed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed consultations today</p>
                </CardContent>
              </Card>
            ) : (
              requests.completed.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onView={(id) => (window.location.href = `/requests/${id}`)}
                  showActions={false}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Working Hours Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Today&apos;s Schedule</h4>
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                <span className="font-medium">Available</span>
                <span className="text-sm ml-2">08:00 AM - 05:00 PM</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quick Actions</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Set as Away
                </Button>
                <Button variant="outline" size="sm">
                  Block Time
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Edit Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
