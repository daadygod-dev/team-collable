import { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Trophy,
  Layers,
  CalendarDays,
  Sparkles,
  AlertCircle,
  ListTodo,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function toYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function parseYMD(str) {
  if (!str) return null;
  const [y,m,d] = str.split("-").map(Number);
  return new Date(y, m-1, d);
}

const PRIORITY_META = {
  high:   { color: "#EF4444", bg: "#FEF2F2", label: "High",   dot: "bg-red-500"    },
  medium: { color: "#F59E0B", bg: "#FFFBEB", label: "Medium", dot: "bg-amber-400"  },
  low:    { color: "#10B981", bg: "#ECFDF5", label: "Low",    dot: "bg-emerald-500" },
};

const STATUS_META = {
  "todo":        { label: "To do",       icon: Circle,       color: "text-slate-400" },
  "in-progress": { label: "In progress", icon: Clock,        color: "text-blue-500"  },
  "done":        { label: "Done",        icon: CheckCircle2, color: "text-emerald-500" },
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user } = useAuth();
  const {
    tasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getAssignableProjects,
    getAssignableMembers,
  } = useTasks();
  const { getMyProjects } = useProjects();

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [activeTab, setActiveTab] = useState("calendar"); // "calendar" | "milestones"
  const [selectedDay, setSelectedDay] = useState(toYMD(today));

  // ── Task modal state ─────────────────────────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false);
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [detailTask,   setDetailTask]   = useState(null);
  const [formError,    setFormError]    = useState("");
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assignedToUserId: "",
    priority: "medium", dueDate: "",
  });

  // ── Derived data ──────────────────────────────────────────────────────────────

  const myProjects = getMyProjects();

  // All tasks that have a dueDate, keyed by YMD string
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate.slice(0,10); // "YYYY-MM-DD"
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  // Completed tasks sorted by completedAt / updatedAt — for milestones
  const doneTasks = useMemo(() =>
    [...tasks]
      .filter((t) => t.status === "done")
      .sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [tasks]
  );

  // Tasks for selected day
  const dayTasks = tasksByDate[selectedDay] || [];

  // Calendar grid
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstDayOfMonth(viewYear, viewMonth);
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth, daysInMonth, firstWeekday]);

  // Stats for header
  const totalTasks   = tasks.length;
  const donCount     = tasks.filter(t => t.status === "done").length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < today;
  }).length;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v-1); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v+1); }
    else setViewMonth(m => m+1);
  };

  const openNewTask = (dayStr) => {
    setForm({
      title: "", description: "",
      projectId: myProjects[0]?.id || "",
      assignedToUserId: user?.id || "",
      priority: "medium",
      dueDate: dayStr || selectedDay,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (!form.title.trim()) { setFormError("Task title is required."); return; }
    if (!form.projectId)    { setFormError("Select a project."); return; }
    if (!form.assignedToUserId) { setFormError("Assign to a member."); return; }
    try {
      createTask(form);
      toast.success("Task added to calendar!");
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleStatusCycle = (task) => {
    const order = ["todo","in-progress","done"];
    const next  = order[(order.indexOf(task.status)+1) % order.length];
    try {
      updateTaskStatus(task.id, next);
      if (next === "done") toast.success("Task marked complete! 🎉");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (taskId) => {
    try {
      deleteTask(taskId);
      toast.success("Task removed.");
      setDetailOpen(false);
    } catch(err) { toast.error(err.message); }
  };

  const openDetail = (task) => { setDetailTask(task); setDetailOpen(true); };

  const members = form.projectId ? getAssignableMembers(form.projectId) : [];

  // ── Render helpers ───────────────────────────────────────────────────────────

  const TaskPill = ({ task, compact = false }) => {
    const pm   = PRIORITY_META[task.priority] || PRIORITY_META.medium;
    const isDone = task.status === "done";
    return (
      <button
        onClick={() => openDetail(task)}
        className={`w-full text-left rounded-md px-2 py-1 text-xs font-medium truncate transition-all
          hover:opacity-80 active:scale-[0.98]
          ${isDone ? "opacity-50 line-through" : ""}`}
        style={{ background: pm.bg, color: pm.color, border: `1px solid ${pm.color}22` }}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${pm.dot}`} />
        {task.title}
      </button>
    );
  };

  const MilestoneCard = ({ task, index }) => {
    const pm = PRIORITY_META[task.priority] || PRIORITY_META.medium;
    const date = parseYMD(task.dueDate?.slice(0,10));
    return (
      <div className="relative flex gap-4 pb-8 last:pb-0">
        {/* timeline line */}
        <div className="flex flex-col items-center">
          <div
            className="z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
            style={{ background: pm.bg, border: `2px solid ${pm.color}` }}
          >
            <CheckCircle2 size={14} style={{ color: pm.color }} />
          </div>
          <div className="w-px flex-1 bg-border mt-1" />
        </div>

        {/* card */}
        <div className="flex-1 bg-white border border-border rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground leading-tight">{task.title}</p>
            <Badge
              variant="outline"
              className="text-xs shrink-0"
              style={{ color: pm.color, borderColor: `${pm.color}44`, background: pm.bg }}
            >
              {pm.label}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers size={10} />
              {task.projectName}
            </span>
            {date && (
              <span className="flex items-center gap-1">
                <CalendarDays size={10} />
                {date.toLocaleDateString("en-US", { month:"short", day:"numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold uppercase text-muted-foreground">
                {task.assignedTo?.fullname?.charAt(0) || "?"}
              </span>
              {task.assignedTo?.fullname?.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-neutral-50 rounded-xl">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
              {today.toLocaleDateString("en-US", { weekday:"long" })}, {today.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
              <ListTodo size={12} className="text-slate-400" />
              <span>{totalTasks} tasks</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-xs">
              <CheckCircle2 size={12} />
              <span>{donCount} done</span>
            </div>
            {overdueTasks > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 shadow-xs">
                <AlertCircle size={12} />
                <span>{overdueTasks} overdue</span>
              </div>
            )}
            <Button
              className="gap-1.5 rounded-full text-xs h-8 bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] shadow-sm"
              onClick={() => openNewTask(selectedDay)}
            >
              <Plus size={13} />
              Add task
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mt-5 border-b border-border">
          {[
            { id:"calendar",   label:"Calendar",   icon: CalendarDays },
            { id:"milestones", label:"Milestones", icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                ${activeTab === id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={14} />
              {label}
              {id === "milestones" && doneTasks.length > 0 && (
                <span className="ml-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5">
                  {doneTasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar tab ─────────────────────────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="flex flex-col lg:flex-row gap-0 flex-1 px-5 md:px-8 pb-8">

          {/* Left: month grid */}
          <div className="flex-1 min-w-0">
            {/* Month navigator */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {MONTHS[viewMonth]} <span className="text-muted-foreground font-normal text-base">{viewYear}</span>
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={prevMonth}>
                  <ChevronLeft size={13} />
                </Button>
                <Button
                  variant="outline"
                  className="h-7 rounded-full text-xs px-3"
                  onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(toYMD(today)); }}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={nextMonth}>
                  <ChevronRight size={13} />
                </Button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold tracking-wide text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;

                const ymd       = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isToday   = ymd === toYMD(today);
                const isSelected = ymd === selectedDay;
                const cellTasks = tasksByDate[ymd] || [];
                const hasDone   = cellTasks.some(t => t.status === "done");
                const hasOverdue = cellTasks.some(t => t.status !== "done" && new Date(ymd) < today);

                return (
                  <button
                    key={ymd}
                    onClick={() => setSelectedDay(ymd)}
                    className={`relative min-h-[72px] rounded-xl p-1.5 text-left transition-all flex flex-col
                      ${isSelected
                        ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 ring-offset-1"
                        : isToday
                          ? "bg-emerald-50 border-2 border-emerald-400"
                          : "bg-white border border-border hover:border-emerald-300 hover:shadow-sm"}
                    `}
                  >
                    {/* Day number */}
                    <span className={`text-xs font-bold mb-1 px-0.5
                      ${isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-foreground"}
                    `}>
                      {day}
                    </span>

                    {/* Task pills — show up to 2, then "+N more" */}
                    <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                      {cellTasks.slice(0,2).map(t => {
                        const pm = PRIORITY_META[t.priority] || PRIORITY_META.medium;
                        const done = t.status === "done";
                        return (
                          <span
                            key={t.id}
                            className={`block truncate text-[10px] font-medium rounded px-1 py-0.5 leading-tight
                              ${isSelected ? "bg-white/20 text-white" : ""}
                              ${done && !isSelected ? "opacity-40 line-through" : ""}
                            `}
                            style={!isSelected ? { background: pm.bg, color: pm.color } : {}}
                          >
                            {t.title}
                          </span>
                        );
                      })}
                      {cellTasks.length > 2 && (
                        <span className={`text-[10px] font-semibold px-1
                          ${isSelected ? "text-white/70" : "text-muted-foreground"}
                        `}>
                          +{cellTasks.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Status indicator dots — bottom right */}
                    {cellTasks.length > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                        {hasOverdue && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        )}
                        {hasDone && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: day detail panel */}
          <div className="lg:w-80 lg:ml-6 mt-6 lg:mt-0">
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {parseYMD(selectedDay)?.toLocaleDateString("en-US",{weekday:"long"})}
                  </p>
                  <p className="text-base font-bold text-foreground leading-tight">
                    {parseYMD(selectedDay)?.toLocaleDateString("en-US",{month:"long",day:"numeric"})}
                  </p>
                </div>
                <Button
                  size="icon"
                  className="h-7 w-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={() => openNewTask(selectedDay)}
                >
                  <Plus size={13} />
                </Button>
              </div>

              {/* Tasks list */}
              <div className="p-3 flex flex-col gap-2 max-h-[440px] overflow-y-auto">
                {dayTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">Nothing scheduled</p>
                    <p className="text-[11px] text-muted-foreground">Tap + to add a task for this day.</p>
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const pm     = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                    const sm     = STATUS_META[task.status]     || STATUS_META.todo;
                    const Icon   = sm.icon;
                    const isDone = task.status === "done";

                    return (
                      <div
                        key={task.id}
                        className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-border hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer"
                        onClick={() => openDetail(task)}
                      >
                        {/* Status toggle */}
                        <button
                          className={`mt-0.5 shrink-0 ${sm.color} hover:scale-110 transition-transform`}
                          onClick={(e) => { e.stopPropagation(); handleStatusCycle(task); }}
                          title="Cycle status"
                        >
                          <Icon size={16} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight truncate
                            ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                              style={{ background: pm.bg, color: pm.color }}
                            >
                              {pm.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {task.projectName}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold uppercase text-muted-foreground">
                          {task.assignedTo?.fullname?.charAt(0) || "?"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel footer summary */}
              {dayTasks.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{dayTasks.filter(t=>t.status==="done").length}/{dayTasks.length} complete</span>
                  {/* Mini progress bar */}
                  <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(dayTasks.filter(t=>t.status==="done").length / dayTasks.length)*100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* This week's mini-summary */}
            <div className="mt-4 bg-white border border-border rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                This month
              </p>
              {[
                { label:"Total tasks",    value: Object.values(tasksByDate).flat().filter(t => {
                    const d = parseYMD(t.dueDate?.slice(0,10));
                    return d && d.getMonth()===viewMonth && d.getFullYear()===viewYear;
                  }).length, color:"text-foreground" },
                { label:"Completed",      value: Object.values(tasksByDate).flat().filter(t => {
                    const d = parseYMD(t.dueDate?.slice(0,10));
                    return d && d.getMonth()===viewMonth && d.getFullYear()===viewYear && t.status==="done";
                  }).length, color:"text-emerald-600" },
                { label:"In progress",    value: Object.values(tasksByDate).flat().filter(t => {
                    const d = parseYMD(t.dueDate?.slice(0,10));
                    return d && d.getMonth()===viewMonth && d.getFullYear()===viewYear && t.status==="in-progress";
                  }).length, color:"text-blue-600" },
                { label:"Overdue",        value: Object.values(tasksByDate).flat().filter(t => {
                    const d = parseYMD(t.dueDate?.slice(0,10));
                    return d && d.getMonth()===viewMonth && d.getFullYear()===viewYear && t.status!=="done" && d<today;
                  }).length, color:"text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Milestones tab ────────────────────────────────────────────────────── */}
      {activeTab === "milestones" && (
        <div className="px-5 md:px-8 pb-8">
          {doneTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Trophy size={28} className="text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">No milestones yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Completed tasks appear here as milestones. Finish your first task to see it celebrated.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Milestone header */}
              <div className="flex items-center gap-3 mb-8 pt-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">
                    {doneTasks.length} milestone{doneTasks.length !== 1 ? "s" : ""} reached
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Every completed task is a step forward.
                  </p>
                </div>

                {/* Priority breakdown badges */}
                <div className="ml-auto flex items-center gap-1.5">
                  {(["high","medium","low"]).map(p => {
                    const count = doneTasks.filter(t=>t.priority===p).length;
                    if (!count) return null;
                    const pm = PRIORITY_META[p];
                    return (
                      <span key={p} className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: pm.bg, color: pm.color }}>
                        {count} {pm.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Group by month */}
              {(() => {
                const groups = {};
                doneTasks.forEach(t => {
                  const d    = new Date(t.updatedAt);
                  const key  = `${d.getFullYear()}-${d.getMonth()}`;
                  const label = d.toLocaleDateString("en-US", { month:"long", year:"numeric" });
                  if (!groups[key]) groups[key] = { label, tasks: [] };
                  groups[key].tasks.push(t);
                });

                return Object.entries(groups).map(([key, { label, tasks: grpTasks }]) => (
                  <div key={key} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {grpTasks.length} tasks
                      </span>
                    </div>
                    <div className="pl-1">
                      {grpTasks.map((task, i) => (
                        <MilestoneCard key={task.id} task={task} index={i} />
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Create Task Modal ─────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag size={16} className="text-emerald-600" />
              New task
            </DialogTitle>
            <DialogDescription>
              Scheduled for{" "}
              <span className="font-semibold text-foreground">
                {parseYMD(form.dueDate)?.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) || form.dueDate}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-1">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Task title</Label>
              <Input
                placeholder="e.g. Review design mockups"
                value={form.title}
                onChange={e => setForm(f=>({...f, title:e.target.value}))}
                onKeyDown={e => e.key==="Enter" && handleCreate()}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea
                placeholder="Add details..."
                rows={2}
                value={form.description}
                onChange={e => setForm(f=>({...f, description:e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Project */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={v => setForm(f=>({...f, projectId:v, assignedToUserId:""}))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {myProjects.length === 0 ? (
                      <SelectItem value="__none__" disabled>No projects found</SelectItem>
                    ) : myProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={form.priority} onValueChange={v=>setForm(f=>({...f,priority:v}))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Assign to */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Assign to</Label>
                <Select
                  value={form.assignedToUserId}
                  onValueChange={v=>setForm(f=>({...f,assignedToUserId:v}))}
                  disabled={!form.projectId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.fullname}{m.userId===user?.id ? " (you)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Due date</Label>
                <Input
                  type="date"
                  className="h-9 text-xs"
                  value={form.dueDate}
                  onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle size={11} />{formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>setModalOpen(false)} className="rounded-full cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="rounded-full cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D]"
            >
              Add task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Task detail drawer ────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          {detailTask && (() => {
            const pm   = PRIORITY_META[detailTask.priority] || PRIORITY_META.medium;
            const sm   = STATUS_META[detailTask.status]     || STATUS_META.todo;
            const Icon = sm.icon;
            const due  = parseYMD(detailTask.dueDate?.slice(0,10));

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                      style={{ background: pm.bg, color: pm.color }}
                    >
                      {pm.label} priority
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-medium ${sm.color}`}>
                      <Icon size={11} />{sm.label}
                    </span>
                  </div>
                  <DialogTitle className="text-base leading-snug">{detailTask.title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-1 text-xs">
                  {detailTask.description && (
                    <p className="text-muted-foreground leading-relaxed">{detailTask.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Project</p>
                      <p className="font-semibold text-foreground truncate">{detailTask.projectName}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Assigned to</p>
                      <p className="font-semibold text-foreground truncate">{detailTask.assignedTo?.fullname}</p>
                    </div>
                    {due && (
                      <div className="bg-muted/40 rounded-lg p-2.5">
                        <p className="text-muted-foreground mb-0.5">Due date</p>
                        <p className="font-semibold text-foreground">
                          {due.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </p>
                      </div>
                    )}
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <p className="text-muted-foreground mb-0.5">Status</p>
                      <Select
                        value={detailTask.status}
                        onValueChange={v => {
                          updateTaskStatus(detailTask.id, v);
                          setDetailTask(t=>({...t, status:v}));
                          if (v==="done") toast.success("Task complete! 🎉");
                        }}
                      >
                        <SelectTrigger className="h-6 text-[11px] border-0 p-0 bg-transparent shadow-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To do</SelectItem>
                          <SelectItem value="in-progress">In progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5 rounded-full cursor-pointer text-xs"
                    onClick={() => handleDelete(detailTask.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full cursor-pointer text-xs bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D]"
                    onClick={() => setDetailOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}