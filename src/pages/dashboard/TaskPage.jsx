import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectContext";
import { useTasks } from "../../context/TaskContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Field, FieldLabel, FieldGroup } from "../../components/ui/field";
import { Plus, Trash2, Calendar as CalendarIcon, ClipboardList, CheckCircle2, Clock, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const COLUMNS = [
    { id: "todo", title: "To Do", icon: <ClipboardList size={18} className="text-blue-500" />, bgColor: "bg-blue-500/10" },
    { id: "in-progress", title: "In Progress", icon: <Clock size={18} className="text-amber-500" />, bgColor: "bg-amber-500/10" },
    { id: "done", title: "Done", icon: <CheckCircle2 size={18} className="text-emerald-500" />, bgColor: "bg-emerald-500/10" }
];

export default function TasksPage() {
    const { user } = useAuth();
    const { getMyProjects, getProjectById, getMemberRole } = useProjects();
    const { createTask, updateTaskStatus, deleteTask, getTasksByProject } = useTasks();

    // Fetch only projects the logged-in user belongs to
    const myProjects = getMyProjects();

    // Component tracking states
    const [selectedProjectId, setSelectedProjectId] = useState(myProjects[0]?.id || "");
    const [showModal, setShowModal] = useState(false);
    
    // Form management states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignedToUserId, setAssignedToUserId] = useState("");

    // Active project context extraction variables
    const activeProject = getProjectById(selectedProjectId);
    const activeProjectTasks = selectedProjectId ? getTasksByProject(selectedProjectId) : [];
    const userRoleInActiveProject = selectedProjectId ? getMemberRole(selectedProjectId) : null;
    
    // Check if user is authorized to assign tasks (Owner or Admin)
    const isLeader = userRoleInActiveProject && ["owner", "admin"].includes(userRoleInActiveProject.role);

    // Open modal and pre-seed the first available team member
    const handleOpenModal = () => {
        if (!selectedProjectId) {
            return toast.error("Please select or create a project first.");
        }
        if (!isLeader) {
            return toast.error("Only project owners and admins can assign tasks.");
        }
        if (activeProject?.members?.length > 0) {
            setAssignedToUserId(activeProject.members[0].userId);
        }
        setShowModal(true);
    };

    // Form Submission Dispatcher
    const handleAddTask = (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Task title is required");
        if (!assignedToUserId) return toast.error("Please assign this task to a team member");

        try {
            createTask({
                projectId: selectedProjectId,
                title,
                description,
                dueDate,
                priority,
                assignedToUserId
            });

            toast.success("Task created and assigned successfully!");
            
            // Clean up state fields
            setTitle("");
            setDescription("");
            setDueDate("");
            setPriority("Medium");
            setShowModal(false);
        } catch (error) {
            toast.error(error.message || "Failed to create task");
        }
    };

    // Cycle status forward through Kanban pipeline sequentially
    const handleMoveTask = (taskId, currentStatus) => {
        let nextStatus = "";
        if (currentStatus === "todo") nextStatus = "in-progress";
        else if (currentStatus === "in-progress") nextStatus = "done";
        else return; // Locked at done state

        try {
            updateTaskStatus(taskId, nextStatus);
            toast.success(`Task shifted to ${nextStatus.replace("-", " ")}`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete task call handler
    const handleDeleteTask = (taskId, e) => {
        e.stopPropagation(); // Restrict card trigger click propagation fire rules
        try {
            deleteTask(taskId);
            toast.success("Task deleted successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full h-full min-w-0">
            {/* Top Workspace Bar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-border">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tasks Management</h1>
                    <p className="text-sm text-muted-foreground">Select a project scope to distribute and manage sprint workloads.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Project Workspace Selector Filter Dropdown */}
                    <div className="flex flex-col gap-1">
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                        >
                            {myProjects.length === 0 ? (
                                <option value="">No Active Projects</option>
                            ) : (
                                myProjects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {isLeader && (
                        <Button onClick={handleOpenModal} className="gap-2 cursor-pointer bg-primary text-primary-foreground h-9">
                            <Plus size={16} /> Add Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Quick Warning Alert Banner if user is standard member */}
            {selectedProjectId && !isLeader && (
                <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-md border border-amber-500/20">
                    <AlertCircle size={14} />
                    <span>You are a <strong>{userRoleInActiveProject?.role || "member"}</strong> in this project. You can view and advance tasks but cannot assign new ones.</span>
                </div>
            )}

            {/* Main Kanban Content Grid Panels */}
            {!selectedProjectId ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl py-20 text-center bg-muted/10">
                    <ClipboardList size={48} className="text-muted-foreground/60 mb-3" />
                    <h3 className="font-semibold text-lg">No Project Selected</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">Join or build out a project canvas view path to start mapping development milestones.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-start">
                    {COLUMNS.map((col) => {
                        const columnTasks = activeProjectTasks.filter(t => t.status === col.id);
                        return (
                            <div key={col.id} className="bg-muted/30 rounded-xl p-4 border border-border flex flex-col gap-3 min-h-[500px]">
                                {/* Pipeline Title Card headers */}
                                <div className="flex items-center justify-between border-b pb-2 mb-1">
                                    <div className="flex items-center gap-2 font-semibold text-sm">
                                        {col.icon}
                                        <span>{col.title}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bgColor}`}>
                                        {columnTasks.length}
                                    </span>
                                </div>

                                {/* Task Cards Container */}
                                <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
                                    {columnTasks.length === 0 ? (
                                        <p className="text-xs text-center text-muted-foreground py-10 border border-dashed rounded-lg bg-card/40">
                                            No tasks in this stage
                                        </p>
                                    ) : (
                                        columnTasks.map((task) => (
                                            <Card 
                                                key={task.id} 
                                                onClick={() => handleMoveTask(task.id, task.status)}
                                                className={`group relative hover:border-primary/40 cursor-pointer transition-all hover:shadow-xs border bg-card ${task.status === "done" ? "opacity-75" : ""}`}
                                            >
                                                <CardHeader className="p-3 pb-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="text-sm font-semibold truncate leading-tight w-[80%]">
                                                            {task.title}
                                                        </CardTitle>
                                                        
                                                        {/* Allow creator, owner, or admin to delete task */}
                                                        {(task.createdBy === user?.id || isLeader) && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={(e) => handleDeleteTask(task.id, e)}
                                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity flex items-center justify-center rounded-sm cursor-pointer"
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {task.description && (
                                                        <CardDescription className="text-xs line-clamp-2 mt-1">
                                                            {task.description}
                                                        </CardDescription>
                                                    )}
                                                </CardHeader>
                                                
                                                <CardContent className="p-3 pt-2 flex flex-col gap-2 text-xs border-t border-border/40 mt-2 bg-muted/10 rounded-b-xl">
                                                    {/* Assignee Information Widget */}
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <User size={12} className="text-primary/70" />
                                                        <span className="font-medium text-foreground truncate">
                                                            {task.assignedTo?.userId === user?.id ? "Assigned to Me" : task.assignedTo?.fullname}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <CalendarIcon size={12} />
                                                            <span>{task.dueDate || "No date"}</span>
                                                        </div>
                                                        <span className={`px-1.5 py-0.5 rounded-sm font-medium text-[10px] ${
                                                            task.priority === "High" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                            task.priority === "Medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                                                            "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                                        }`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Popout Task Creation Modal Overlay Dialog */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 dark:bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6 bg-card border shadow-lg rounded-xl">
                        <div className="flex flex-col gap-1 mb-4">
                            <h2 className="text-lg font-bold tracking-tight">Create New Task</h2>
                            <p className="text-xs text-muted-foreground">Assign work to members of <span className="font-semibold text-foreground">{activeProject?.name}</span></p>
                        </div>
                        
                        <form onSubmit={handleAddTask}>
                            <FieldGroup className="flex flex-col gap-4">
                                <Field>
                                    <FieldLabel htmlFor="task-title">Task Title</FieldLabel>
                                    <Input 
                                        id="task-title" 
                                        placeholder="E.g., Design UI Layout Dashboard" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </Field>
                                
                                <Field>
                                    <FieldLabel htmlFor="task-desc">Description</FieldLabel>
                                    <Input 
                                        id="task-desc" 
                                        placeholder="Provide brief context details..." 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                    />
                                </Field>

                                {/* Dropdown Selector mapping actual project members */}
                                <Field>
                                    <FieldLabel htmlFor="task-assignee">Assign To Team Member</FieldLabel>
                                    <select
                                        id="task-assignee"
                                        value={assignedToUserId}
                                        onChange={(e) => setAssignedToUserId(e.target.value)}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                        required
                                    >
                                        {activeProject?.members?.map((member) => (
                                            <option key={member.userId} value={member.userId}>
                                                {member.fullname} ({member.role}) {member.userId === user?.id ? "- Me" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <Field>
                                        <FieldLabel htmlFor="task-date">Due Date</FieldLabel>
                                        <Input 
                                            id="task-date"
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </Field>
                                    
                                    <Field>
                                        <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                                        <select
                                            id="task-priority"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </Field>
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="cursor-pointer">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="cursor-pointer bg-primary text-primary-foreground">
                                        Assign Task
                                    </Button>
                                </div>
                            </FieldGroup>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}