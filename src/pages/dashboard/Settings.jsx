import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  User,
  Globe,
  Clock,
  CalendarDays,
  Timer,
  Save,
  Sun,
  Moon,
  Monitor,
  Mail,
  Smartphone,
  Key,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Navigation items ────────────────────────────────────
const navItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: User },
];

// ── Options data ────────────────────────────────────────
const languages = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "sw", label: "Swahili" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
];

const timezones = [
  { value: "africa/rwanda", label: "(GMT +02:00) Africa/Rwanda" },
  { value: "africa/nairobi", label: "(GMT +03:00) Africa/Nairobi" },
  { value: "africa/lagos", label: "(GMT +01:00) Africa/Lagos" },
  { value: "africa/cairo", label: "(GMT +02:00) Africa/Cairo" },
  { value: "europe/london", label: "(GMT +00:00) Europe/London" },
  { value: "europe/paris", label: "(GMT +01:00) Europe/Paris" },
  { value: "america/new_york", label: "(GMT -05:00) America/New York" },
  { value: "america/los_angeles", label: "(GMT -08:00) America/Los Angeles" },
  { value: "asia/dubai", label: "(GMT +04:00) Asia/Dubai" },
  { value: "asia/shanghai", label: "(GMT +08:00) Asia/Shanghai" },
  { value: "asia/tokyo", label: "(GMT +09:00) Asia/Tokyo" },
  { value: "australia/sydney", label: "(GMT +11:00) Australia/Sydney" },
];

const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM,DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

const timeFormats = [
  { value: "12h", label: "12 Hour" },
  { value: "24h", label: "24 Hour" },
];

const digestOptions = [
  { value: "realtime", label: "Real-time" },
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Digest" },
  { value: "monthly", label: "Monthly Digest" },
  { value: "off", label: "Off" },
];

const accentColors = [
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Cyan", value: "#06B6D4" },
];

// ── Storage helpers ─────────────────────────────────────
function loadSettings(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveSettings(key, values) {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* noop */
  }
}

// ── Default settings ────────────────────────────────────
const defaultGeneral = {
  language: "en",
  timezone: "africa/rwanda",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
};

const defaultNotifications = {
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  taskAssigned: true,
  projectUpdates: false,
  mentionAlerts: true,
  digestFrequency: "realtime",
};

const defaultSecurity = {
  twoFactor: false,
  sessionTimeout: "30",
};

const defaultAppearance = {
  theme: "light",
  accentColor: "#22C55E",
  fontSize: "medium",
  compactMode: false,
  sidebarCollapsed: false,
};

// ═══════════════════════════════════════════════════════
export default function SettingsPage() {
  const { user } = useAuth();

  // ── Active section ───────────────────────────────────
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [savedSection, setSavedSection] = useState(null);

  // ── Section settings ─────────────────────────────────
  const [general, setGeneral] = useState(() =>
    loadSettings("settings_general", defaultGeneral)
  );
  const [notifications, setNotifications] = useState(() =>
    loadSettings("settings_notifications", defaultNotifications)
  );
  const [security, setSecurity] = useState(() =>
    loadSettings("settings_security", defaultSecurity)
  );
  const [appearance, setAppearance] = useState(() =>
    loadSettings("settings_appearance", defaultAppearance)
  );

  // ── Password fields ──────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Account fields ───────────────────────────────────
  const [accountName, setAccountName] = useState(user?.fullname || "");
  const [accountBio, setAccountBio] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ── Section title map ────────────────────────────────
  const sectionTitles = {
    general: "General Settings",
    notifications: "Notification Preferences",
    security: "Security Settings",
    appearance: "Appearance",
    account: "Account Settings",
  };

  // ── Update helper ────────────────────────────────────
  const updateGeneral = (key, value) =>
    setGeneral((prev) => ({ ...prev, [key]: value }));
  const updateNotifications = (key, value) =>
    setNotifications((prev) => ({ ...prev, [key]: value }));
  const updateSecurity = (key, value) =>
    setSecurity((prev) => ({ ...prev, [key]: value }));
  const updateAppearance = (key, value) =>
    setAppearance((prev) => ({ ...prev, [key]: value }));

  // ── Save handler ─────────────────────────────────────
  const handleSave = useCallback(() => {
    setSaving(true);
    // Simulate a brief network delay
    setTimeout(() => {
      switch (activeSection) {
        case "general":
          saveSettings("settings_general", general);
          break;
        case "notifications":
          saveSettings("settings_notifications", notifications);
          break;
        case "security":
          saveSettings("settings_security", security);
          break;
        case "appearance":
          saveSettings("settings_appearance", appearance);
          break;
      }
      setSaving(false);
      setSavedSection(activeSection);
      toast.success(`${sectionTitles[activeSection]} saved successfully!`);
      setTimeout(() => setSavedSection(null), 2000);
    }, 600);
  }, [activeSection, general, notifications, security, appearance]);

  // ── Password change handler ──────────────────────────
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    // In a real app, this would call an API
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ── Toggle switch helper ─────────────────────────────
  const ToggleRow = ({
    id,
    label,
    description,
    checked,
    onCheckedChange,
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-neutral-800 cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0 data-[state=checked]:bg-[#22C55E]"
      />
    </div>
  );

  // ── Select row helper ────────────────────────────────
  const SelectRow = ({ label, value, onValueChange, options, placeholder }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <Label className="text-sm font-medium text-neutral-800 whitespace-nowrap">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[200px] md:w-[240px]">
          <SelectValue placeholder={placeholder || "Select"} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // ── Render: General ──────────────────────────────────
  const renderGeneral = () => (
    <div className="flex flex-col gap-1">
      <SelectRow
        label="Language"
        value={general.language}
        onValueChange={(v) => updateGeneral("language", v)}
        options={languages}
      />
      <SelectRow
        label="Time zone"
        value={general.timezone}
        onValueChange={(v) => updateGeneral("timezone", v)}
        options={timezones}
      />
      <SelectRow
        label="Date Format"
        value={general.dateFormat}
        onValueChange={(v) => updateGeneral("dateFormat", v)}
        options={dateFormats}
      />
      <SelectRow
        label="Time Format"
        value={general.timeFormat}
        onValueChange={(v) => updateGeneral("timeFormat", v)}
        options={timeFormats}
      />
    </div>
  );

  // ── Render: Notifications ────────────────────────────
  const renderNotifications = () => (
    <div className="flex flex-col gap-0">
      <ToggleRow
        id="email-notif"
        label="Email Notifications"
        description="Receive notifications via email"
        checked={notifications.emailNotifications}
        onCheckedChange={(v) => updateNotifications("emailNotifications", v)}
      />
      <Separator />
      <ToggleRow
        id="push-notif"
        label="Push Notifications"
        description="Receive push notifications in your browser"
        checked={notifications.pushNotifications}
        onCheckedChange={(v) => updateNotifications("pushNotifications", v)}
      />
      <Separator />
      <ToggleRow
        id="task-reminders"
        label="Task Reminders"
        description="Get reminded before task due dates"
        checked={notifications.taskReminders}
        onCheckedChange={(v) => updateNotifications("taskReminders", v)}
      />
      <Separator />
      <ToggleRow
        id="task-assigned"
        label="Task Assignment Alerts"
        description="Notify when a task is assigned to you"
        checked={notifications.taskAssigned}
        onCheckedChange={(v) => updateNotifications("taskAssigned", v)}
      />
      <Separator />
      <ToggleRow
        id="project-updates"
        label="Project Update Alerts"
        description="Notify on project status changes"
        checked={notifications.projectUpdates}
        onCheckedChange={(v) => updateNotifications("projectUpdates", v)}
      />
      <Separator />
      <ToggleRow
        id="mention-alerts"
        label="Mention Alerts"
        description="Notify when someone mentions you"
        checked={notifications.mentionAlerts}
        onCheckedChange={(v) => updateNotifications("mentionAlerts", v)}
      />
      <Separator />
      <SelectRow
        label="Digest Frequency"
        value={notifications.digestFrequency}
        onValueChange={(v) => updateNotifications("digestFrequency", v)}
        options={digestOptions}
      />
    </div>
  );

  // ── Render: Security ─────────────────────────────────
  const renderSecurity = () => (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Key size={15} />
          Change Password
        </h3>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Current Password
            </Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="relative">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-fit rounded-full"
            onClick={handleChangePassword}
          >
            Update Password
          </Button>
        </div>
      </div>

      <Separator />

      {/* Two-factor auth */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Shield size={15} />
          Two-Factor Authentication
        </h3>
        <ToggleRow
          id="two-factor"
          label="Enable 2FA"
          description="Add an extra layer of security to your account"
          checked={security.twoFactor}
          onCheckedChange={(v) => updateSecurity("twoFactor", v)}
        />
      </div>

      <Separator />

      {/* Session */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4">
          Session Timeout
        </h3>
        <SelectRow
          label="Auto-logout after"
          value={security.sessionTimeout}
          onValueChange={(v) => updateSecurity("sessionTimeout", v)}
          options={[
            { value: "15", label: "15 minutes" },
            { value: "30", label: "30 minutes" },
            { value: "60", label: "1 hour" },
            { value: "240", label: "4 hours" },
            { value: "0", label: "Never" },
          ]}
        />
      </div>
    </div>
  );

  // ── Render: Appearance ───────────────────────────────
  const renderAppearance = () => (
    <div className="flex flex-col gap-6">
      {/* Theme */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ].map((theme) => {
            const Icon = theme.icon;
            const isActive = appearance.theme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => updateAppearance("theme", theme.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  isActive
                    ? "border-[#22C55E] bg-green-50/50"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    isActive
                      ? "bg-[#22C55E]/10 text-[#16A34A]"
                      : "bg-neutral-100 text-neutral-400"
                  )}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-neutral-800" : "text-muted-foreground"
                  )}
                >
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Accent Color */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">
          Accent Color
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          {accentColors.map((color) => {
            const isActive = appearance.accentColor === color.value;
            return (
              <button
                key={color.value}
                onClick={() => updateAppearance("accentColor", color.value)}
                className="group relative flex flex-col items-center gap-1.5 cursor-pointer"
                title={color.name}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    isActive
                      ? "ring-2 ring-offset-2 ring-neutral-800 scale-110"
                      : "ring-1 ring-neutral-200 hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-neutral-800" : "text-muted-foreground"
                  )}
                >
                  {color.name}
                </span>
                {isActive && (
                  <div
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: color.value }}
                  >
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Font Size */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">
          Font Size
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "small", label: "Small", size: "text-xs" },
            { value: "medium", label: "Medium", size: "text-sm" },
            { value: "large", label: "Large", size: "text-base" },
          ].map((fs) => {
            const isActive = appearance.fontSize === fs.value;
            return (
              <button
                key={fs.value}
                onClick={() => updateAppearance("fontSize", fs.value)}
                className={cn(
                  "flex items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer",
                  isActive
                    ? "border-[#22C55E] bg-green-50/50"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    fs.size,
                    isActive ? "text-neutral-800" : "text-muted-foreground"
                  )}
                >
                  {fs.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Compact mode */}
      <ToggleRow
        id="compact-mode"
        label="Compact Mode"
        description="Reduce spacing and padding across the app"
        checked={appearance.compactMode}
        onCheckedChange={(v) => updateAppearance("compactMode", v)}
      />
    </div>
  );

  // ── Render: Account ──────────────────────────────────
  const renderAccount = () => (
    <div className="flex flex-col gap-6">
      {/* Profile info */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <User size={15} />
          Profile Information
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Full Name
            </Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Email Address
            </Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-neutral-50 text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Bio
            </Label>
            <Textarea
              value={accountBio}
              onChange={(e) => setAccountBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
        <h3 className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-2">
          <Trash2 size={15} />
          Danger Zone
        </h3>
        <p className="text-xs text-red-600/80 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="max-w-xs border-red-200 focus-visible:ring-red-400"
            />
          </div>
          <Button
            variant="destructive"
            className="rounded-full shrink-0"
            disabled={deleteConfirmText !== "DELETE"}
            onClick={() => {
              toast.success("Account deletion requested.");
              setDeleteConfirmText("");
            }}
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Section renderer map ─────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return renderGeneral();
      case "notifications":
        return renderNotifications();
      case "security":
        return renderSecurity();
      case "appearance":
        return renderAppearance();
      case "account":
        return renderAccount();
      default:
        return renderGeneral();
    }
  };

  // ── Show save button? ────────────────────────────────
  const showSave = activeSection !== "account";

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 rounded-xl bg-neutral-50 min-h-screen">
      {/* ── Page Header ───────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Your Application Preferences.
        </p>
      </div>

      {/* ── Body: Sidebar + Content ────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ─────────────────────────────────── */}
        <nav className="shrink-0">
          {/* Mobile: horizontal scroll tabs */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer shrink-0",
                    isActive
                      ? "bg-[#22C55E]/10 text-[#16A34A]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden md:flex flex-col gap-0.5 w-56 bg-white rounded-2xl border p-2 h-fit">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer",
                    isActive
                      ? "bg-[#22C55E]/10 text-[#16A34A] font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={16} className={cn(isActive && "text-[#22C55E]")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Content Panel ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border p-5 md:p-6">
            {/* Section title */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-neutral-800">
                {sectionTitles[activeSection]}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeSection === "general" &&
                  "Customize language, timezone, and display formats."}
                {activeSection === "notifications" &&
                  "Choose how and when you want to be notified."}
                {activeSection === "security" &&
                  "Manage your password and security preferences."}
                {activeSection === "appearance" &&
                  "Personalize the look and feel of your workspace."}
                {activeSection === "account" &&
                  "Manage your profile and account details."}
              </p>
            </div>

            {/* Section content */}
            <div>{renderSection()}</div>

            {/* Save button */}
            {showSave && (
              <div className="mt-8 pt-5 border-t border-neutral-100 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "gap-2 rounded-full min-w-[140px] transition-all",
                    savedSection === activeSection
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] hover:opacity-90"
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : savedSection === activeSection ? (
                    <>
                      <CheckCircle2 size={15} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}