"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { RequestCard, PriorityBadge } from "@/components/common";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { requestsService } from "@/lib/services/api";
import { formatDateTime } from "@/lib/utils";
import { PRIORITY_CONFIG, REQUEST_STATUS_CONFIG } from "@/lib/constants";
import type { ConsultationRequest } from "@/lib/types";
import {
  Search,
  Eye,
  Grid3X3,
  List,
  RefreshCw,
} from "lucide-react";

export default function RequestsListPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await requestsService.getAll();
      // Map to ConsultationRequest type - cast through unknown to satisfy TypeScript
      const mapped = data.map((r: any) => ({
        id: r.id,
        request_number: r.request_number,
        case_id: r.case_id,
        request_type: r.request_type,
        title: r.reason || r.title || 'Consultation Request',
        urgency: r.urgency,
        status: r.status,
        reason: r.reason,
        clinical_question: r.clinical_question,
        requested_specialty: r.requested_specialty,
        sla_breached: r.sla_breached || false,
        escalation_level: r.escalation_level || 0,
        requested_by: r.requested_by || '',
        requested_at: r.requested_at || r.created_at,
        created_at: r.created_at,
        updated_at: r.updated_at || r.created_at,
        acknowledged_at: r.acknowledged_at,
        completed_at: r.completed_at,
        // Note: These partial objects are used for display only
        case: (r.cases || r.case) ? {
          case_number: (r.cases || r.case).case_number,
          patient: (r.cases?.patients || r.cases?.patient || r.case?.patient) ? {
            full_name: (r.cases?.patients || r.cases?.patient || r.case?.patient).full_name,
          } : undefined,
        } : undefined,
        target_department: (r.departments || r.department || r.target_department) ? {
          name: (r.departments || r.department || r.target_department).name,
        } : undefined,
      })) as unknown as ConsultationRequest[];
      setRequests(mapped);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filterPriority && r.urgency !== filterPriority) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesRequest = r.request_number?.toLowerCase().includes(query);
      const matchesCase = (r as any).case?.case_number?.toLowerCase().includes(query);
      const matchesPatient = (r as any).case?.patient?.full_name?.toLowerCase().includes(query);
      if (!matchesRequest && !matchesCase && !matchesPatient) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterPriority("");
    setFilterStatus("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Consultation Requests
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredRequests.length} of {requests.length} requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRequests}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by request #, case #, or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="w-full md:w-40">
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-40">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.entries(REQUEST_STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Clear Filters */}
            {(filterPriority || filterStatus || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Display */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request #</TableHead>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No requests found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.request_number}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <Link
                          href={`/cases/${request.case_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {request.case?.case_number || "-"}
                        </Link>
                      </TableCell>
                      <TableCell>{request.case?.patient?.full_name || "Unknown"}</TableCell>
                      <TableCell className="capitalize">
                        {request.request_type.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDateTime(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={request.urgency} size="sm" />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : request.status === "acknowledged"
                              ? "bg-blue-100 text-blue-700"
                              : request.status === "in_progress"
                              ? "bg-purple-100 text-purple-700"
                              : request.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/requests/${request.id}`}>
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-gray-500">
                No requests found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onView={(id) => (window.location.href = `/requests/${id}`)}
                showActions
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing 1-{filteredRequests.length} of {filteredRequests.length}
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
    </div>
  );
}
