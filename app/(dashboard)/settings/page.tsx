"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/stores";
import { usersService, workingHoursService } from "@/lib/services/api";
import type { User, NotificationChannel, WorkingHours, DayOfWeek } from "@/lib/types";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Clock,
  Shield,
  Key,
  Smartphone,
  Globe,
  Save,
  AlertTriangle,
  CheckCircle,
  Palette,
  Volume2,
  VolumeX,
} from "lucide-react";

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, setUser } = useAuthStore();
  const [user, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    // Notification settings
    notificationSound: true,
    desktopNotifications: true,
    emailDigest: false,
    criticalAlertsOverrideDnd: true,
    
    // DND settings
    dndEnabled: false,
    dndUntil: "",
    
    // Display settings
    compactView: false,
    darkMode: false,
    language: "en",
    
    // Security settings
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  // Working hours state (for consultants)
  const [workingHours, setWorkingHours] = useState<{
    [key in DayOfWeek]?: { start: string; end: string; enabled: boolean };
  }>({
    sunday: { start: "08:00", end: "16:00", enabled: true },
    monday: { start: "08:00", end: "16:00", enabled: true },
    tuesday: { start: "08:00", end: "16:00", enabled: true },
    wednesday: { start: "08:00", end: "16:00", enabled: true },
    thursday: { start: "08:00", end: "16:00", enabled: true },
    friday: { start: "08:00", end: "12:00", enabled: false },
    saturday: { start: "08:00", end: "16:00", enabled: false },
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Load user data
        const userData: any = await usersService.getById(authUser.id);
        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role as any,
            phone: userData.phone,
            whatsapp_number: userData.whatsapp_number,
            employee_id: userData.employee_id,
            department_id: userData.department_id,
            specialization: userData.specialization,
            notification_preference: userData.notification_preference as any || 'app',
            is_active: userData.is_active ?? true,
            is_on_duty: userData.is_on_duty ?? false,
            dnd_status: userData.dnd_status ?? false,
            dnd_until: userData.dnd_until,
            avatar_url: userData.avatar_url,
            created_at: userData.created_at,
            updated_at: userData.updated_at || userData.created_at,
          };
          setLocalUser(mappedUser);

          setSettings((prev) => ({
            ...prev,
            dndEnabled: userData.dnd_status || false,
            dndUntil: userData.dnd_until || "",
          }));
        }

        // Load working hours for consultants
        if (authUser.role === 'consultant') {
          const hours = await workingHoursService.getByUser(authUser.id);
          if (hours && hours.length > 0) {
            const hoursMap: typeof workingHours = {};
            hours.forEach((h: any) => {
              hoursMap[h.day_of_week as DayOfWeek] = {
                start: h.start_time || "08:00",
                end: h.end_time || "16:00",
                enabled: h.is_available,
              };
            });
            setWorkingHours(prev => ({ ...prev, ...hoursMap }));
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [authUser]);

  const handleSaveSettings = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    try {
      // Update user settings
      await usersService.update(user.id, {
        dnd_status: settings.dndEnabled,
        dnd_until: settings.dndUntil || null,
      });
      
      // Save working hours for consultants
      if (authUser?.role === 'consultant') {
        for (const [day, hours] of Object.entries(workingHours)) {
          if (hours) {
            await workingHoursService.upsert({
              user_id: user.id,
              day_of_week: day as DayOfWeek,
              start_time: hours.start,
              end_time: hours.end,
              is_available: hours.enabled,
            });
          }
        }
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        dnd_status: settings.dndEnabled,
        dnd_until: settings.dndUntil || undefined,
      };
      setLocalUser(updatedUser);
      setUser(updatedUser);
      
      setSavedMessage("Settings saved successfully!");
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Unable to load settings. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your preferences and account settings</p>
        </div>
        {savedMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            {savedMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              icon={Volume2}
              iconOff={VolumeX}
              label="Notification Sound"
              description="Play sound for new notifications"
              enabled={settings.notificationSound}
              onToggle={() => toggleSetting("notificationSound")}
            />
            
            <Separator />
            
            <SettingToggle
              icon={Smartphone}
              label="Desktop Notifications"
              description="Show browser notifications"
              enabled={settings.desktopNotifications}
              onToggle={() => toggleSetting("desktopNotifications")}
            />
            
            <Separator />
            
            <SettingToggle
              icon={AlertTriangle}
              label="Critical Override DND"
              description="Critical alerts bypass Do Not Disturb"
              enabled={settings.criticalAlertsOverrideDnd}
              onToggle={() => toggleSetting("criticalAlertsOverrideDnd")}
            />
          </CardContent>
        </Card>

        {/* Do Not Disturb */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-blue-500" />
              Do Not Disturb
            </CardTitle>
            <CardDescription>Temporarily pause non-critical notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              icon={Moon}
              label="Enable DND"
              description="Pause notifications temporarily"
              enabled={settings.dndEnabled}
              onToggle={() => toggleSetting("dndEnabled")}
            />
            
            {settings.dndEnabled && (
              <>
                <Separator />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DND Until
                  </label>
                  <Input
                    type="datetime-local"
                    value={settings.dndUntil}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, dndUntil: e.target.value }))
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for indefinite DND
                  </p>
                </div>
              </>
            )}
            
            {settings.dndEnabled && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Life-saving and critical priority cases will still
                  send notifications regardless of DND status.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Working Hours (Consultants only) */}
        {user.role === "consultant" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Set your availability schedule for consultation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const hours = workingHours[day.value];
                  return (
                    <div
                      key={day.value}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="w-28">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hours?.enabled || false}
                            onChange={(e) =>
                              setWorkingHours((prev) => ({
                                ...prev,
                                [day.value]: {
                                  ...prev[day.value],
                                  enabled: e.target.checked,
                                },
                              }))
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">{day.label}</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={hours?.start || "08:00"}
                          disabled={!hours?.enabled}
                          onChange={(e) =>
                            setWorkingHours((prev) => ({
                              ...prev,
                              [day.value]: { ...prev[day.value]!, start: e.target.value },
                            }))
                          }
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={hours?.end || "16:00"}
                          disabled={!hours?.enabled}
                          onChange={(e) =>
                            setWorkingHours((prev) => ({
                              ...prev,
                              [day.value]: { ...prev[day.value]!, end: e.target.value },
                            }))
                          }
                          className="w-32"
                        />
                      </div>
                      
                      {!hours?.enabled && (
                        <Badge variant="secondary">Off</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-500" />
              Display
            </CardTitle>
            <CardDescription>Customize the appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              icon={Moon}
              label="Dark Mode"
              description="Use dark color theme"
              enabled={settings.darkMode}
              onToggle={() => toggleSetting("darkMode")}
              disabled
              badge="Coming Soon"
            />
            
            <Separator />
            
            <SettingToggle
              icon={SettingsIcon}
              label="Compact View"
              description="Reduce spacing for more content"
              enabled={settings.compactView}
              onToggle={() => toggleSetting("compactView")}
              disabled
              badge="Coming Soon"
            />
            
            <Separator />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, language: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              >
                <option value="en">English</option>
                <option value="ar">العربية (Coming Soon)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Security
            </CardTitle>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Key className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-gray-500">Update your password</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Change
              </Button>
            </div>
            
            <Separator />
            
            <SettingToggle
              icon={Smartphone}
              label="Two-Factor Authentication"
              description="Add extra security to your account"
              enabled={settings.twoFactorEnabled}
              onToggle={() => toggleSetting("twoFactorEnabled")}
              disabled
              badge="Coming Soon"
            />
            
            <Separator />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    sessionTimeout: parseInt(e.target.value) || 30,
                  }))
                }
                min={5}
                max={120}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto logout after inactivity (Coming Soon)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Toggle component for settings
function SettingToggle({
  icon: Icon,
  iconOff: IconOff,
  label,
  description,
  enabled,
  onToggle,
  disabled,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconOff?: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  const ActiveIcon = enabled && IconOff ? Icon : (enabled ? Icon : (IconOff || Icon));
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${enabled ? "bg-blue-100" : "bg-gray-100"}`}>
          <Icon className={`h-5 w-5 ${enabled ? "text-blue-600" : "text-gray-600"}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{label}</p>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
