import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { useTasks } from "@/context/TaskContext";
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
import {
  Plus,
  ClipboardList,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Style maps ────────────────────────────────────────────
const priorityStyles = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusStyles = {
  todo: "bg-muted text-muted-foreground border-border",
  "in-progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const statusLabel = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

const nextStatus = {
  todo: "in-progress",
  "in-progress": "done",
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

  // ── Selected project ──────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState(
    myProjects[0]?.id || ""
  );

  const activeProject = getProjectById(selectedProjectId);
  const activeProjectTasks = selectedProjectId
    ? getTasksByProject(selectedProjectId)
    : [];
  const userRole = selectedProjectId ? getMemberRole(selectedProjectId) : null;
  const isLeader = ["owner", "admin"].includes(userRole?.role);

  // ── Filter ────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTasks = activeProjectTasks.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.fullname?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── Create dialog ─────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignedToUserId: "",
  });
  const [formError, setFormError] = useState("");

  const members = getAssignableMembers(selectedProjectId);

  const openCreate = () => {
    if (!selectedProjectId) return toast.error("Select a project first.");
    if (!isLeader)
      return toast.error("Only owners and admins can create tasks.");
    setForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignedToUserId: members[0]?.userId || "",
    });
    setFormError("");
    setCreateOpen(true);
  };

  const handleCreate = () => {
    try {
      if (!form.title.trim()) {
        setFormError("Task title is required.");
        return;
      }
      if (!form.assignedToUserId) {
        setFormError("Please assign this task to a member.");
        return;
      }
      createTask({ projectId: selectedProjectId, ...form });
      toast.success("Task created successfully.");
      setCreateOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── Move task ─────────────────────────────────────────
  const handleMove = (task) => {
    const next = nextStatus[task.status];
    if (!next) return;
    try {
      updateTaskStatus(task.id, next);
      toast.success(`Moved to ${statusLabel[next]}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Delete task ───────────────────────────────────────
  const handleDelete = (taskId) => {
    try {
      deleteTask(taskId);
      toast.success("Task deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track work across your projects.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Project selector */}
          <Select
            value={selectedProjectId}
            onValueChange={(val) => {
              setSelectedProjectId(val);
              setFilterStatus("all");
              setSearch("");
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className={"rounded-xl"}>
              {myProjects.length === 0 ? (
                <SelectItem value="none" disabled>
                  No projects
                </SelectItem>
              ) : (
                myProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {isLeader && (
            <Button className="gap-2 bg-linear-to-b from-[#14532d] to-[#064e3b]" onClick={openCreate}>
              <Plus size={16} />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* ── Member warning ────────────────────────────── */}
      {selectedProjectId && !isLeader && (
        <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-md border border-amber-500/20">
          <AlertCircle size={14} />
          <span>
            You are a{" "}
            <strong>{userRole?.role || "member"}</strong> in this project.
            You can view and advance tasks but cannot create new ones.
          </span>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────── */}
      {selectedProjectId && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by title or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="sm:w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className={"rounded-xl"}>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Empty — no project ────────────────────────── */}
      {!selectedProjectId ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-border rounded-xl text-center">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">No project selected</p>
          <p className="text-xs text-muted-foreground">
            Select a project above to view its tasks.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* ── Empty — no tasks ───────────────────────── */
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-border rounded-xl text-center">
          <div className="p-4 rounded-full bg-muted">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">No tasks found</p>
          <p className="text-xs text-muted-foreground">
            {isLeader
              ? "Create your first task to get started."
              : "No tasks have been assigned yet."}
          </p>
          {isLeader && (
            <Button size="sm" className="gap-2 mt-1 bg-linear-to-b from-[#14532d] to-[#064e3b]" onClick={openCreate}>
              <Plus size={14} /> Add Task
            </Button>
          )}
        </div>
      ) : (
        /* ── Table ──────────────────────────────────── */
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className={task.status === "done" ? "opacity-60" : ""}
                  >
                    {/* Title */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate max-w-[220px]">
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 w-full  text-wrap">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Assignee */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                          {task.assignedTo?.fullname?.[0]?.toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px]">
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
                        className={`text-xs capitalize ${statusStyles[task.status]}`}
                      >
                        {statusLabel[task.status]}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>

                    {/* Due date */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays size={13} />
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No date"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={"rounded-lg"}>
                          {/* Move forward — available to assignee + leaders */}
                          {task.status !== "done" &&
                            (isLeader ||
                              task.assignedTo?.userId === user?.id) && (
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer rounded-lg"
                                onClick={() => handleMove(task)}
                              >
                                <ArrowRight size={14} />
                                Move to {statusLabel[nextStatus[task.status]]}
                              </DropdownMenuItem>
                            )}

                          {/* Delete — creator or leader */}
                          {(isLeader || task.createdBy === user?.id) && (
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

          {/* Mobile cards — shown below sm breakpoint */}
          <div className="sm:hidden flex flex-col divide-y divide-border">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 flex flex-col gap-3 ${
                  task.status === "done" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{task.title}</span>
                    {task.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== "done" &&
                        (isLeader || task.assignedTo?.userId === user?.id) && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => handleMove(task)}
                          >
                            <ArrowRight size={14} />
                            Move to {statusLabel[nextStatus[task.status]]}
                          </DropdownMenuItem>
                        )}
                      {(isLeader || task.createdBy === user?.id) && (
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

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusStyles[task.status]}`}
                  >
                    {statusLabel[task.status]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${priorityStyles[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    {task.assignedTo?.userId === user?.id
                      ? "Assigned to Me"
                      : task.assignedTo?.fullname}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "No date"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create task dialog ────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Assign work to a member of{" "}
              <span className="font-semibold text-foreground">
                {activeProject?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Design landing page"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional details..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Assign To</Label>
              <Select
                value={form.assignedToUserId}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, assignedToUserId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullname}
                      {m.userId === user?.id ? " (Me)" : ""} — {m.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, priority: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className={"bg-linear-to-b from-[#14532d] to-[#064e3b]"}>Assign Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}