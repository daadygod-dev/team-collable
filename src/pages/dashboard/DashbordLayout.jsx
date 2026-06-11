import React, { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import {
  Bell, Search, UserRound, Settings, LogOut, Mail,
  CheckCheck, Trash2, BriefcaseBusiness, Users, ClipboardList,
  AlertCircle, X,
  FolderKanban,
  ListTodo,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import MobileBottomBar from "@/components/MobileBottomBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useEmails } from "@/context/EmailContext";
import { useProjects } from "@/context/ProjectContext";
import { useTasks } from "@/context/TaskContext";
import { useTeams } from "@/context/TeamContext";
import { Link } from "react-router-dom";

// ─── Notification type icon ───────────────────────────────────────────────────
function NotifIcon({ type }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "task_assigned" || type === "task_completed")
    return <ClipboardList className={cn(cls, "text-green-600")} />;
  if (type === "task_overdue")
    return <AlertCircle className={cn(cls, "text-red-500")} />;
  if (type === "project_joined")
    return <BriefcaseBusiness className={cn(cls, "text-blue-500")} />;
  if (type === "team_joined")
    return <Users className={cn(cls, "text-purple-500")} />;
  return <Bell className={cls} />;
}

// ─── Email type icon ──────────────────────────────────────────────────────────
function EmailTypeIcon({ type }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "task_assigned" || type === "task_overdue")
    return <ClipboardList className={cn(cls, "text-green-600")} />;
  if (type === "project_joined")
    return <BriefcaseBusiness className={cn(cls, "text-blue-500")} />;
  if (type === "team_joined")
    return <Users className={cn(cls, "text-purple-500")} />;
  return <Mail className={cls} />;
}

// ─── Relative time ────────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const { getMyProjects } = useProjects();
  const { getMyAssignedTasks } = useTasks();
  const { getMyTeams } = useTeams();

  const projects = getMyProjects();
  const tasks = getMyAssignedTasks();
  const teams = getMyTeams();

  const q = query.toLowerCase();

  const filteredProjects = q
    ? projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    )
    : projects.slice(0, 4);

  const filteredTasks = q
    ? tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.projectName?.toLowerCase().includes(q)
    )
    : tasks.slice(0, 4);

  const filteredTeams = q
    ? teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    )
    : teams.slice(0, 3);

  const hasResults =
    filteredProjects.length > 0 ||
    filteredTasks.length > 0 ||
    filteredTeams.length > 0;

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-5 gap-0 overflow-hidden max-h-[70vh] flex flex-col"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-none border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, teams…"
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm bg-transparent"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-2">
          {!hasResults && (
            <p className="text-center text-sm text-muted-foreground py-8">
              {q ? "No results found" : "Start typing to search…"}
            </p>
          )}

          {filteredProjects.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Projects
              </p>
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <FolderKanban size={15} className="text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-auto text-[10px] shrink-0 capitalize"
                  >
                    {project.status}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                My Tasks
              </p>
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <ListTodo size={15} className="text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {task.projectName}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "destructive"
                        : task.priority === "medium"
                          ? "secondary"
                          : "outline"
                    }
                    className="ml-auto text-[10px] shrink-0 capitalize"
                  >
                    {task.priority}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {filteredTeams.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Teams
              </p>
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <UsersRound size={15} className="text-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{team.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {team.members?.length} member{team.members?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Email detail dialog ──────────────────────────────────────────────────────
function EmailDetailDialog({ email, open, onOpenChange }) {
  if (!email) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base normal-case tracking-normal">
            {email.subject}
          </DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>
            <span className="font-medium text-foreground">From:</span>{" "}
            {email.from.name} &lt;{email.from.email}&gt;
          </p>
          <p>
            <span className="font-medium text-foreground">To:</span>{" "}
            {email.to.name} &lt;{email.to.email}&gt;
          </p>
          <p>
            <span className="font-medium text-foreground">Date:</span>{" "}
            {new Date(email.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="border-t border-border pt-3 text-sm whitespace-pre-line leading-relaxed text-foreground">
          {email.body}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);

  const { user, logout } = useAuth();
  const { notifications, unreadCount: notifUnread, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { emails, unreadCount: emailUnread, markAsRead: markEmailRead, markAllAsRead: markAllEmailsRead, deleteEmail } = useEmails();

  // Ctrl+K opens command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenEmail = (email) => {
    markEmailRead(email.id);
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <SideBar />

      {/* Right column */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className=" h-14 md:h-16 px-4 md:px-6 flex justify-between items-center shrink-0 mx-4 md:mx-5 my-4 rounded-xl bg-white md:bg-neutral-50">

          {/* Search — desktop only */}
          <div className="relative w-full max-w-sm hidden md:flex">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              id="search-input"
              readOnly
              className="rounded-xl pl-9 pr-16 bg-white cursor-pointer"
              placeholder="Search tasks, projects…"
              onFocus={() => { setIsSearchFocused(true); setCommandOpen(true); }}
              onBlur={() => setIsSearchFocused(false)}
              onClick={() => setCommandOpen(true)}
            />
            {!isSearchFocused && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                <kbd className="text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-mono leading-none">
                  Ctrl
                </kbd>
                <kbd className="text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-mono leading-none">
                  K
                </kbd>
              </div>
            )}
          </div>

          {/* Right actions — full width on mobile, auto on desktop */}
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex md:hidden">
              <img src="/single-icon.png" alt="image logo" width={45} height={45} className="rounded-full" />
            </div>

            {/* Email + Notifications grouped */}
            <div className="flex items-center gap-2">
              {/* Email */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative rounded-full bg-white p-2 cursor-pointer">
                    <Mail size={20} className="text-current" />
                    {emailUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-600 text-[10px] text-white font-bold flex items-center justify-center">
                        {emailUnread > 9 ? "9+" : emailUnread}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 rounded-xl" align="end">
                  <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold">
                      Inbox
                      {emailUnread > 0 && (
                        <Badge className="ml-2 bg-green-600 text-white text-[10px] px-1.5">
                          {emailUnread}
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    {emailUnread > 0 && (
                      <button
                        onClick={markAllEmailsRead}
                        className="text-[11px] text-green-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {emails.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No messages</p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {emails.map((email) => (
                        <div
                          key={email.id}
                          className={cn(
                            "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors",
                            !email.read && "bg-green-50"
                          )}
                          onClick={() => handleOpenEmail(email)}
                        >
                          <EmailTypeIcon type={email.meta?.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={cn("text-xs truncate", !email.read ? "font-semibold" : "font-normal")}>
                                {email.subject}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {relativeTime(email.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {email.from.name}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteEmail(email.id); }}
                            className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative rounded-full bg-white p-2 cursor-pointer">
                    <Bell size={20} />
                    {notifUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
                        {notifUnread > 9 ? "9+" : notifUnread}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 rounded-xl" align="end">
                  <div className="flex items-center justify-between px-3 py-2">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold">
                      Notifications
                      {notifUnread > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white text-[10px] px-1.5">
                          {notifUnread}
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    {notifUnread > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-green-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors",
                            !notif.read && "bg-red-50"
                          )}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <NotifIcon type={notif.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={cn("text-xs truncate", !notif.read ? "font-semibold" : "font-normal")}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {relativeTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {notif.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            

            {/* Profile — always pushed to the end */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 rounded-full py-3 shadow-none">
                  <Avatar>
                    <AvatarImage src="/avatar.png" alt="@shadcn" className={"size-sm"} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="font-normal text-sm hidden sm:block">{user.fullname}</p>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-green-700 lowercase">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link to={"/dashboard/settings"}>
                  <DropdownMenuItem className="cursor-pointer rounded-lg">
                    <UserRound className="mr-1 h-4 w-4" />

                    <span>Profile</span>
                  </DropdownMenuItem>
                  </Link>
                   <Link to={"/dashboard/settings"}>
                  <DropdownMenuItem className="cursor-pointer rounded-lg">
                    <Settings className="mr-1 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <MobileBottomBar />
      </div>

      {/* Command palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Email detail */}
      <EmailDetailDialog
        email={selectedEmail}
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
      />
    </div>
  );
}