"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { CaseCard, PriorityBadge } from "@/components/common";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { casesService } from "@/lib/services/api";
import { formatTime, formatPatientInfo } from "@/lib/utils";
import { PRIORITY_CONFIG, CASE_STATUS_CONFIG } from "@/lib/constants";
import type { Case, Patient } from "@/lib/types";
import {
  Search,
  Filter,
  Eye,
  Grid3X3,
  List,
  RefreshCw,
} from "lucide-react";

export default function CasesListPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCases = useCallback(async () => {
    try {
      setIsLoading(true);
      const allCases = await casesService.getAll({
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
      });
      setCases(allCases);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Filter cases by search
  const filteredCases = cases.filter((c) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCase = c.case_number.toLowerCase().includes(query);
      const matchesPatient = c.patient?.full_name?.toLowerCase().includes(query);
      const matchesComplaint = (c.chief_complaint || c.initial_complaint || "").toLowerCase().includes(query);
      if (!matchesCase && !matchesPatient && !matchesComplaint) return false;
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
          <h1 className="text-2xl font-bold text-gray-900">All Cases</h1>
          <p className="text-gray-500 mt-1">
            {filteredCases.length} of {cases.length} cases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCases} disabled={isLoading}>
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
                  placeholder="Search by case #, patient name, or complaint..."
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
                {Object.entries(CASE_STATUS_CONFIG).map(([value, config]) => (
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

      {/* Cases Display */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No cases found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((caseItem) => (
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
                      <TableCell className="max-w-[200px] truncate">
                        {caseItem.chief_complaint}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatTime(caseItem.arrival_time)}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={caseItem.priority} size="sm" />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            caseItem.status === "open"
                              ? "bg-blue-100 text-blue-700"
                              : caseItem.status === "in_progress"
                              ? "bg-purple-100 text-purple-700"
                              : caseItem.status === "discharged"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-gray-500">
                No cases found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onView={(id) => (window.location.href = `/cases/${id}`)}
                showActions
              />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing 1-{filteredCases.length} of {filteredCases.length}
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
