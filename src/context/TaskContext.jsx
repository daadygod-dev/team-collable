import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useProjects } from "./ProjectContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const { user } = useAuth();
    const { getProjectById, getMemberRole } = useProjects();
    const [tasks, setTasks] = useState([]);

    // 1. Initialize tasks from localStorage on component mount
    useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem("tasks_db")) || [];
        setTasks(storedTasks);
    }, []);

    // 2. Synchronize changes to localStorage instantly
    useEffect(() => {
        localStorage.setItem("tasks_db", JSON.stringify(tasks));
    }, [tasks]);

    // ─── CREATE & ASSIGN TASK ─────────────────────────────────
    const createTask = ({ projectId, title, description, dueDate, priority, assignedToUserId }) => {
        if (!user) throw new Error("You must be logged in to create tasks.");

        // Fetch the corresponding project details
        const project = getProjectById(projectId);
        if (!project) throw new Error("Target project not found.");

        // Rule: Verify that the current user is an owner or admin of the project
        const currentUserRole = getMemberRole(projectId);
        if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
            throw new Error("Only the project owner or admins can create and assign tasks.");
        }

        // Rule: Verify that the person being assigned is actually a member of this project
        const assignedMember = project.members.find(m => m.userId === assignedToUserId);
        if (!assignedMember) {
            throw new Error("The assigned person must be a member of this project.");
        }

        const newTask = {
            id: crypto.randomUUID(),
            projectId,
            title,
            description: description || "",
            dueDate: dueDate || "No date set",
            priority: priority || "Medium", // "Low" | "Medium" | "High"
            status: "todo",                // Default Kanban column destination
            assignedTo: {
                userId: assignedMember.userId,
                fullname: assignedMember.fullname,
                email: assignedMember.email
            },
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setTasks((prev) => [newTask, ...prev]);
        return newTask;
    };

    // ─── UPDATE STATUS (KANBAN DRIFT) ─────────────────────────
    const updateTaskStatus = (taskId, newStatus) => {
        const validStatuses = ["todo", "in-progress", "done"];
        if (!validStatuses.includes(newStatus)) throw new Error("Invalid status type.");

        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId
                    ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    };

    // ─── DELETE TASK ──────────────────────────────────────────
    const deleteTask = (taskId) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (!taskToDelete) throw new Error("Task not found.");

        // Rule: Allow deletion if the user created the task, or is project owner/admin
        const projectRole = getMemberRole(taskToDelete.projectId);
        const isAuthorized = taskToDelete.createdBy === user?.id || ["owner", "admin"].includes(projectRole?.role);
        
        if (!isAuthorized) {
            throw new Error("You don't have permission to remove this task.");
        }

        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    // ─── HELPER QUERIES ───────────────────────────────────────

    // Get all tasks tied to a specific project ID
    const getTasksByProject = (projectId) => {
        return tasks.filter((t) => t.projectId === projectId);
    };

    // Get all tasks assigned specifically to the logged-in user across all projects
    const getMyAssignedTasks = () => {
        return tasks.filter((t) => t.assignedTo.userId === user?.id);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                createTask,
                updateTaskStatus,
                deleteTask,
                getTasksByProject,
                getMyAssignedTasks
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
