import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useProjects } from "./ProjectContext";
import { useTeams } from "./TeamContext"; // ✅ ADDED: Import Teams

const TaskContext = createContext();

function safeGetFromStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    console.error(`Failed to parse ${key}:`, error);
    return defaultValue;
  }
}

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const { getProjectById, getMemberRole, getMyProjects } = useProjects();
  const { getTeamMembers } = useTeams(); // ✅ ADDED: Get team members function

  const [tasks, setTasks] = useState(() =>
    safeGetFromStorage("tasks_db", [])
  );

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    try {
      localStorage.setItem("tasks_db", JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }, [tasks]);

  // ✅ NEW: Smart helper to always get the correct member list
  const getContextMembers = (project) => {
    if (!project) return [];
    
    // If project belongs to a team, pull members directly from the team
    if (project.teamId) {
      const teamMembers = getTeamMembers(project.teamId);
      if (teamMembers && teamMembers.length > 0) {
        return teamMembers;
      }
    }
    
    // Fallback to project members if no team is linked
    return project.members || [];
  };

  const createTask = ({
    projectId,
    title,
    description,
    dueDate,
    priority,
    assignedToUserId,
  }) => {
    if (!user) throw new Error("You must be logged in to create tasks.");
    if (!title?.trim()) throw new Error("Task title is required.");
    if (!projectId) throw new Error("Please select a project.");
    if (!assignedToUserId)
      throw new Error("Please select a member to assign the task to.");

    const project = getProjectById(projectId);
    if (!project) throw new Error("Project not found.");

    // ✅ FIXED: Use smart helper instead of project.members
    const activeMembers = getContextMembers(project);

    const currentUserMember = activeMembers.find(
      (m) => m.userId === user.id
    );
    if (!currentUserMember)
      throw new Error("You are not a member of this project.");

    const assignedMember = activeMembers.find(
      (m) => m.userId === assignedToUserId
    );
    if (!assignedMember)
      throw new Error("Selected user is not a member of this project.");

    const validPriorities = ["low", "medium", "high"];
    const finalPriority = validPriorities.includes(priority)
      ? priority
      : "medium";

    const newTask = {
      id: crypto.randomUUID(),
      projectId,
      projectName: project.name,
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: dueDate || null,
      priority: finalPriority,
      status: "todo",
      assignedTo: {
        userId: assignedMember.userId,
        fullname: assignedMember.fullname,
        email: assignedMember.email,
        role: assignedMember.role,
      },
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    let updatedTask = null;

    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found.");

      const projectRole = getMemberRole(task.projectId);
      const isAssignee = task.assignedTo.userId === user?.id;
      const isCreator = task.createdBy === user?.id;
      const isOwnerOrAdmin = ["owner", "admin"].includes(projectRole?.role);

      if (!isAssignee && !isCreator && !isOwnerOrAdmin)
        throw new Error("You don't have permission to update this task.");

      if (isAssignee && !isOwnerOrAdmin && !isCreator) {
        const hasDisallowedKey = Object.keys(updates).some(
          (k) => k !== "status"
        );
        if (hasDisallowedKey)
          throw new Error(
            "You can only update the status of your assigned tasks."
          );
      }

      const resolvedUpdates = { ...updates };

      if (updates.assignedToUserId) {
        const project = getProjectById(task.projectId);
        
        // ✅ FIXED: Use smart helper for reassignment validation
        const activeMembers = getContextMembers(project);
        const newAssignee = activeMembers.find(
          (m) => m.userId === updates.assignedToUserId
        );
        
        if (!newAssignee)
          throw new Error(
            "Selected user is not a member of this project."
          );
        resolvedUpdates.assignedTo = {
          userId: newAssignee.userId,
          fullname: newAssignee.fullname,
          email: newAssignee.email,
          role: newAssignee.role,
        };
        delete resolvedUpdates.assignedToUserId;
      }

      const validStatuses = ["todo", "in-progress", "done"];
      if (
        resolvedUpdates.status &&
        !validStatuses.includes(resolvedUpdates.status)
      )
        throw new Error("Invalid status value.");

      updatedTask = {
        ...task,
        ...resolvedUpdates,
        updatedAt: new Date().toISOString(),
      };

      return prev.map((t) => (t.id === taskId ? updatedTask : t));
    });

    return updatedTask;
  };

  const updateTaskStatus = (taskId, newStatus) =>
    updateTask(taskId, { status: newStatus });

  const deleteTask = (taskId) => {
    let canDelete = false;

    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found.");

      const projectRole = getMemberRole(task.projectId);
      const isCreator = task.createdBy === user?.id;
      const isOwnerOrAdmin = ["owner", "admin"].includes(projectRole?.role);

      if (!isCreator && !isOwnerOrAdmin)
        throw new Error("You don't have permission to delete this task.");

      canDelete = true;
      return prev.filter((t) => t.id !== taskId);
    });

    return canDelete;
  };

  const getTasksByProject = useCallback(
    (projectId) => tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  const getMyAssignedTasks = useCallback(() => {
    if (!user) return [];
    return tasks.filter((t) => t.assignedTo.userId === user.id);
  }, [tasks, user?.id]);

  const getTasksByStatus = useCallback(
    (projectId, status) =>
      tasks.filter(
        (t) => t.projectId === projectId && t.status === status
      ),
    [tasks]
  );

  const getAssignableProjects = useCallback(
    () => getMyProjects(),
    [getMyProjects]
  );

  // ✅ FIXED: Dropdown now uses the smart helper
  const getAssignableMembers = useCallback(
    (projectId) => {
      const project = getProjectById(projectId);
      if (!project) return [];
      
      const activeMembers = getContextMembers(project);

      return activeMembers.map(({ userId, fullname, email, role }) => ({
        userId,
        fullname,
        email,
        role,
      }));
    },
    [getProjectById, getTeamMembers] // ✅ ADDED getTeamMembers to dependencies
  );

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
        getTasksByStatus,
        getAssignableProjects,
        getAssignableMembers,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context)
    throw new Error("useTasks must be used within a TaskProvider");
  return context;
}