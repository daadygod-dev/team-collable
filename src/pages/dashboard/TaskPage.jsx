import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { useTasks } from "@/context/TaskContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  ClipboardList,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  CalendarDays,
  User,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ── Style maps ────────────────────────────────────────────
const priorityStyles = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusStyles = {
  todo: "bg-slate-100 text-slate-600 border-slate-200",
  "in-progress": "bg-amber-50 text-amber-600 border-amber-200",
  done: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const displayStatusLabel = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Completed",
};

const nextStatus = {
  todo: "in-progress",
  "in-progress": "done",
};

const statusTabs = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Completed" },
];

const TASKS_PER_PAGE = 5;

// Project color palette for dots
const projectColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-orange-500",
];

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export default function TaskPage() {
  const { user } = useAuth();
  const { getMyProjects, getProjectById, getMemberRole } = useProjects();
  const {
    createTask,
    updateTaskStatus,
    deleteTask,
    getTasksByProject,
    getAssignableMembers,
  } = useTasks();

  const myProjects = getMyProjects();

  // ── Gather all tasks across projects ───────────────────
  const allTasks = myProjects.flatMap((project, pIdx) => {
    const tasks = getTasksByProject(project.id);
    return tasks.map((task) => ({
      ...task,
      projectName: project.name,
      projectColor: projectColors[pIdx % projectColors.length],
    }));
  });

  // ── Filters ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTasks = allTasks.filter((t) => {
    const matchStatus = activeTab === "all" || t.status === activeTab;
    const matchSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Page number generator with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("start-ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("end-ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Per-task helpers ───────────────────────────────────
  const getIsLeader = (projectId) => {
    const role = getMemberRole(projectId);
    return ["owner", "admin"].includes(role?.role);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "done") return false;
    return new Date(task.dueDate) < getToday();
  };

  // ── Create dialog ─────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: null,
    priority: "medium",
    assignedToUserId: "",
    projectId: "",
  });
  const [formError, setFormError] = useState("");

  const formMembers = form.projectId
    ? getAssignableMembers(form.projectId)
    : [];

  const openCreate = () => {
    if (myProjects.length === 0) {
      return toast.error("You need at least one project to create tasks.");
    }
    const firstProject = myProjects[0];
    const firstMembers = getAssignableMembers(firstProject.id);
    setForm({
      title: "",
      description: "",
      dueDate: null,
      priority: "medium",
      assignedToUserId: firstMembers[0]?.userId || "",
      projectId: firstProject.id,
    });
    setFormError("");
    setCalendarOpen(false);
    setCreateOpen(true);
  };

  const handleFormProjectChange = (projectId) => {
    const members = getAssignableMembers(projectId);
    setForm((prev) => ({
      ...prev,
      projectId,
      assignedToUserId: members[0]?.userId || "",
    }));
  };

  const handleDateSelect = (date) => {
    setForm((prev) => ({ ...prev, dueDate: date }));
    setCalendarOpen(false);
  };

  const clearDate = () => {
    setForm((prev) => ({ ...prev, dueDate: null }));
  };

  const handleCreate = () => {
    try {
      if (!form.projectId) {
        setFormError("Please select a project.");
        return;
      }
      if (!form.title.trim()) {
        setFormError("Task title is required.");
        return;
      }
      if (!form.assignedToUserId) {
        setFormError("Please assign this task to a member.");
        return;
      }
      if (form.dueDate && form.dueDate < getToday()) {
        setFormError("Due date cannot be in the past.");
        return;
      }

      createTask({
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedToUserId: form.assignedToUserId,
        dueDate: form.dueDate ? form.dueDate.toISOString() : null,
      });

      toast.success("Task created successfully.");
      setCreateOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── Move / Delete ─────────────────────────────────────
  const handleMove = (task) => {
    const next = nextStatus[task.status];
    if (!next) return;
    try {
      updateTaskStatus(task.id, next);
      toast.success(`Moved to ${displayStatusLabel[next]}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (taskId) => {
    try {
      deleteTask(taskId);
      toast.success("Task deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Tab style helper ──────────────────────────────────
  const tabClass = (isActive) =>
    cn(
      "px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all cursor-pointer select-none",
      isActive
        ? "bg-[#22C55E]/10 text-[#16A34A]"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    );

  // ── Render ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-xl bg-neutral-50  mb-6">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, Organize and track all your tasks.
          </p>
        </div>

        <Button
          className="gap-2 bg-linear-to-br border-none from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full shadow-none transition-shadow"
          onClick={openCreate}
        >
          <Plus size={16} />
          Add Task
        </Button>
      </div>

      {/* ── Status tabs + search ───────────────────────── */}
      {myProjects.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border-none border-border shadow-none">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                className={tabClass(activeTab === tab.value) }
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 sm:w-[220px] h-9 bg-white border-none shadow-none"
            />
          </div>
        </div>
      )}

      {/* ── Empty states ──────────────────────────────── */}
      {myProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-border rounded-xl bg-white text-center">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">No projects yet</p>
          <p className="text-xs text-muted-foreground">
            Create a project first to start adding tasks.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-border rounded-xl bg-white text-center">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">No tasks found</p>
          <p className="text-xs text-muted-foreground">
            {search
              ? "Nothing found in your search"
              : "Create your first task to get started."}
          </p>
          {!search && (
            <Button
              size="sm"
              className="gap-2 mt-1 bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
              onClick={openCreate}
            >
              <Plus size={14} /> Add Task
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* ── Table ──────────────────────────────────── */}
          <div className="rounded-xl border border-border overflow-hidden bg-white shadow-none">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table className={"shadow-none"}>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="w-[280px]">Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className={cn(
                        "group transition-colors",
                        task.status === "done" && "opacity-60"
                      )}
                    >
                      {/* Task */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-sm leading-tight">
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              task.projectColor
                            )}
                          />
                          <span className="text-sm text-muted-foreground truncate max-w-[130px]">
                            {task.projectName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Assigned to */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-xs font-bold shrink-0 ring-1 ring-primary/10">
                            {task.assignedTo?.fullname?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm truncate max-w-[110px]">
                            {task.assignedTo?.userId === user?.id
                              ? "Me"
                              : task.assignedTo?.fullname}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium px-2.5 py-0.5 rounded-full",
                            statusStyles[task.status]
                          )}
                        >
                          {displayStatusLabel[task.status]}
                        </Badge>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        <div
                          className={cn(
                            "flex items-center gap-1.5 text-sm",
                            isOverdue(task)
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <CalendarDays size={13} className="shrink-0" />
                          {formatDueDate(task.dueDate) || (
                            <span className="text-muted-foreground/40 text-xs">
                              No date
                            </span>
                          )}
                          {isOverdue(task) && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0 ml-1 rounded-full"
                            >
                              Late
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium px-2.5 py-0.5 rounded-full capitalize",
                            priorityStyles[task.priority]
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px] rounded-xl"
                          >
                            {task.status !== "done" &&
                              (getIsLeader(task.projectId) ||
                                task.assignedTo?.userId === user?.id) && (
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer rounded-lg"
                                  onClick={() => handleMove(task)}
                                >
                                  <ArrowRight size={14} />
                                  Move to{" "}
                                  {displayStatusLabel[nextStatus[task.status]]}
                                </DropdownMenuItem>
                              )}
                            {(getIsLeader(task.projectId) ||
                              task.createdBy === user?.id) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                                    onClick={() => handleDelete(task.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-border">
              {paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 flex flex-col gap-3 transition-colors",
                    task.status === "done" && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-medium text-sm leading-tight">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {task.status !== "done" &&
                          (getIsLeader(task.projectId) ||
                            task.assignedTo?.userId === user?.id) && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => handleMove(task)}
                            >
                              <ArrowRight size={14} />
                              Move to{" "}
                              {displayStatusLabel[nextStatus[task.status]]}
                            </DropdownMenuItem>
                          )}
                        {(getIsLeader(task.projectId) ||
                          task.createdBy === user?.id) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => handleDelete(task.id)}
                              >
                                <Trash2 size={14} />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Project row */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FolderOpen size={12} className="shrink-0" />
                    {task.projectName}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        statusStyles[task.status]
                      )}
                    >
                      {displayStatusLabel[task.status]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                        priorityStyles[task.priority]
                      )}
                    >
                      {task.priority}
                    </Badge>
                    {isOverdue(task) && (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0 rounded-full"
                      >
                        Late
                      </Badge>
                    )}
                  </div>

                  {/* Bottom info row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {task.assignedTo?.fullname?.[0]?.toUpperCase() || "?"}
                      </div>
                      {task.assignedTo?.userId === user?.id
                        ? "Me"
                        : task.assignedTo?.fullname}
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        isOverdue(task) && "text-red-600 font-medium"
                      )}
                    >
                      <CalendarDays size={12} />
                      {formatDueDate(task.dueDate) || "No date"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination footer ─────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50/50">
              <p className="text-sm text-muted-foreground">
                Total{" "}
                <span className="font-semibold text-foreground">
                  {filteredTasks.length}
                </span>{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} />
                  </Button>

                  {getPageNumbers().map((page, idx) =>
                    page === "start-ellipsis" || page === "end-ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1.5 text-muted-foreground text-sm select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-lg text-sm font-medium",
                          currentPage === page &&
                          "bg-[#22C55E] hover:bg-[#16A34A] text-white border-[#22C55E] shadow-sm"
                        )}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Create task dialog ────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Task</DialogTitle>
            <DialogDescription>
              Assign work to a member in your project.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Project selector */}
            <div className="flex flex-col gap-2">
              <Label>Project</Label>
              <Select
                value={form.projectId}
                onValueChange={handleFormProjectChange}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {myProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Design landing page"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional details..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                className="rounded-lg resize-none"
              />
            </div>

            {/* Assign To */}
            <div className="flex flex-col gap-2">
              <Label>Assign To</Label>
              <Select
                value={form.assignedToUserId}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, assignedToUserId: val }))
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {formMembers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No members available
                    </SelectItem>
                  ) : (
                    formMembers.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {/* ✅ FIXED: Removed "(Me)" logic, now just shows Name and Role cleanly */}
                        {m.fullname} — <span className="capitalize">{m.role}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Due Date</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 rounded-lg",
                        !form.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.dueDate
                        ? format(form.dueDate, "MMM dd, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={form.dueDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < getToday()}
                      initialFocus
                    />
                    {form.dueDate && (
                      <div className="border-t px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-muted-foreground hover:text-foreground"
                          onClick={clearDate}
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, priority: val }))
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
                {formError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full shadow-md shadow-green-500/20"
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}