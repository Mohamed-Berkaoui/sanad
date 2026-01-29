"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usersService, departmentsService } from "@/lib/services/api";
import { ROLE_CONFIG } from "@/lib/constants";
import type { User, UserRole } from "@/lib/types";
import {
  Users,
  Search,
  Plus,
  Edit,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<{id: string; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        usersService.getAll(),
        departmentsService.getAll(),
      ]);

      const mappedUsers = usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role as UserRole,
        phone: u.phone,
        whatsapp_number: u.whatsapp_number,
        employee_id: u.employee_id,
        department_id: u.department_id,
        specialization: u.specialization,
        notification_preference: u.notification_preference || 'app',
        is_active: u.is_active ?? true,
        is_on_duty: u.is_on_duty ?? false,
        dnd_status: u.dnd_status ?? false,
        avatar_url: u.avatar_url,
        created_at: u.created_at,
        updated_at: u.updated_at || u.created_at,
        department: u.departments ? {
          id: u.departments.id,
          name: u.departments.name,
          code: u.departments.code || '',
          is_active: u.departments.is_active ?? true,
          created_at: u.departments.created_at || u.created_at,
          updated_at: u.departments.updated_at || u.departments.created_at || u.created_at,
        } : undefined,
      })) as User[];

      setStaff(mappedUsers);
      setDepartments(deptsData.map((d: any) => ({ id: d.id, name: d.name })));
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Filter staff
  const filteredStaff = staff.filter((s) => {
    if (filterRole && s.role !== filterRole) return false;
    if (filterDepartment && s.department_id !== filterDepartment) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = s.full_name.toLowerCase().includes(query);
      const matchesEmail = s.email.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) return false;
    }
    return true;
  });

  // Group by role for tabs
  const staffByRole = {
    nurse: filteredStaff.filter((s) => s.role === "nurse"),
    er_doctor: filteredStaff.filter((s) => s.role === "er_doctor"),
    consultant: filteredStaff.filter((s) => s.role === "consultant"),
    flow_manager: filteredStaff.filter((s) => s.role === "flow_manager"),
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Available
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
        <XCircle className="h-3 w-3" />
        Unavailable
      </span>
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRole("");
    setFilterDepartment("");
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">
            Manage staff schedules, availability, and assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStaff}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Duty</p>
                <p className="text-2xl font-bold text-green-600">
                  {staff.filter((s) => s.is_on_duty).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Off Duty</p>
                <p className="text-2xl font-bold text-gray-600">
                  {staff.filter((s) => !s.is_on_duty).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-40">
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {Object.entries(ROLE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || filterRole || filterDepartment) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All ({filteredStaff.length})
          </TabsTrigger>
          <TabsTrigger value="nurses" className="gap-2">
            Nurses ({staffByRole.nurse.length})
          </TabsTrigger>
          <TabsTrigger value="er_doctors" className="gap-2">
            ER Doctors ({staffByRole.er_doctor.length})
          </TabsTrigger>
          <TabsTrigger value="consultants" className="gap-2">
            Consultants ({staffByRole.consultant.length})
          </TabsTrigger>
        </TabsList>

        {/* All Staff Tab */}
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={member.full_name} size="sm" />
                            <div>
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-xs text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {member.role.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {member.department?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {member.phone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(member.is_on_duty || false)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nurses Tab */}
        <TabsContent value="nurses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffByRole.nurse.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
            {staffByRole.nurse.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-gray-500">
                  No nurses found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ER Doctors Tab */}
        <TabsContent value="er_doctors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffByRole.er_doctor.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
            {staffByRole.er_doctor.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-gray-500">
                  No ER doctors found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Consultants Tab */}
        <TabsContent value="consultants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffByRole.consultant.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
            {staffByRole.consultant.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-gray-500">
                  No consultants found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Staff Card Component
function StaffCard({ member }: { member: User }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar name={member.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{member.full_name}</h3>
              {member.is_on_duty ? (
                <span className="h-3 w-3 rounded-full bg-green-500" />
              ) : (
                <span className="h-3 w-3 rounded-full bg-gray-300" />
              )}
            </div>
            <p className="text-sm text-gray-500 capitalize">
              {member.role.replace("_", " ")}
            </p>
            {member.department?.name && (
              <p className="text-xs text-gray-400">{member.department.name}</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
