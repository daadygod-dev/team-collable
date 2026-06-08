import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useProjects } from "./ProjectContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const { user } = useAuth();
    const { getProjectById, getMemberRole, getMyProjects } = useProjects();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem("tasks_db")) || [];
        setTasks(storedTasks);
    }, []);

    useEffect(() => {
        localStorage.setItem("tasks_db", JSON.stringify(tasks));
    }, [tasks]);

    // ─── CREATE ───────────────────────────────────────────────
    const createTask = ({ projectId, title, description, dueDate, priority, assignedToUserId }) => {
        if (!user) throw new Error("You must be logged in to create tasks.");
        if (!title?.trim()) throw new Error("Task title is required.");
        if (!projectId) throw new Error("Please select a project.");
        if (!assignedToUserId) throw new Error("Please select a member to assign.");

        const project = getProjectById(projectId);
        if (!project) throw new Error("Project not found.");

        const currentUserRole = getMemberRole(projectId);
        if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
            throw new Error("Only project owners and admins can create tasks.");
        }

        const assignedMember = project.members.find((m) => m.userId === assignedToUserId);
        if (!assignedMember) {
            throw new Error("Assigned user must be a member of this project.");
        }

        const newTask = {
            id: crypto.randomUUID(),
            projectId,
            projectName: project.name,          // ✅ store for display without extra lookups
            title: title.trim(),
            description: description?.trim() || "",
            dueDate: dueDate || null,
            priority: priority || "medium",      // "low" | "medium" | "high"
            status: "todo",                      // "todo" | "in-progress" | "done"
            assignedTo: {
                userId: assignedMember.userId,
                fullname: assignedMember.fullname,
                email: assignedMember.email,
            },
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        return newTask;
    };

    // ─── UPDATE FULL TASK ─────────────────────────────────────
    const updateTask = (taskId, updates) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) throw new Error("Task not found.");

        const projectRole = getMemberRole(task.projectId);
        const isAssignee = task.assignedTo.userId === user?.id;
        const isOwnerOrAdmin = ["owner", "admin"].includes(projectRole?.role);

        // Assignee can only update status, owner/admin can update everything
        if (!isAssignee && !isOwnerOrAdmin) {
            throw new Error("You don't have permission to update this task.");
        }

        // If assignee (not owner/admin), restrict to status updates only
        if (isAssignee && !isOwnerOrAdmin) {
            const allowedKeys = ["status"];
            const hasDisallowedKey = Object.keys(updates).some(
                (k) => !allowedKeys.includes(k)
            );
            if (hasDisallowedKey) {
                throw new Error("You can only update the status of your assigned tasks.");
            }
        }

        const validStatuses = ["todo", "in-progress", "done"];
        if (updates.status && !validStatuses.includes(updates.status)) {
            throw new Error("Invalid status value.");
        }

        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId
                    ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    };

    // ─── UPDATE STATUS ONLY (kanban drag) ────────────────────
    const updateTaskStatus = (taskId, newStatus) => {
        updateTask(taskId, { status: newStatus });
    };

    // ─── DELETE ───────────────────────────────────────────────
    const deleteTask = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) throw new Error("Task not found.");

        const projectRole = getMemberRole(task.projectId);
        const isCreator = task.createdBy === user?.id;
        const isOwnerOrAdmin = ["owner", "admin"].includes(projectRole?.role);

        if (!isCreator && !isOwnerOrAdmin) {
            throw new Error("You don't have permission to delete this task.");
        }

        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    // ─── HELPERS ──────────────────────────────────────────────

    // All tasks for a specific project
    const getTasksByProject = (projectId) => {
        return tasks.filter((t) => t.projectId === projectId);
    };

    // Tasks assigned to current user
    const getMyAssignedTasks = () => {
        return tasks.filter((t) => t.assignedTo.userId === user?.id);
    };

    // ✅ Projects where current user can create tasks (owner/admin only)
    const getAssignableProjects = () => {
        return getMyProjects().filter((p) => {
            const role = getMemberRole(p.id);
            return ["owner", "admin"].includes(role?.role);
        });
    };

    // ✅ Members of a project available to be assigned (for dropdown)
    const getAssignableMembers = (projectId) => {
        const project = getProjectById(projectId);
        return project?.members || [];
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                createTask,
                updateTask,
                updateTaskStatus,
                deleteTask,
                getTasksByProject,
                getMyAssignedTasks,
                getAssignableProjects,  // ✅ feeds the project dropdown
                getAssignableMembers,   // ✅ feeds the member dropdown
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error("useTasks must be used within a TaskProvider");
    }
    return context;
}