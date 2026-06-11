import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

function safeGetFromStorage(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() =>
    safeGetFromStorage("notifications_db", [])
  );

  const isMounted = useRef(false);
  useEffect(() => { isMounted.current = true; }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    try {
      localStorage.setItem("notifications_db", JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications:", e);
    }
  }, [notifications]);

  // Derive notifications from tasks/projects/teams for current user
  useEffect(() => {
    if (!user) return;

    const tasks = safeGetFromStorage("tasks_db", []);
    const projects = safeGetFromStorage("projects_db", []);
    const teams = safeGetFromStorage("teams_db", []);
    const existing = safeGetFromStorage("notifications_db", []);
    const existingIds = new Set(existing.map((n) => n.sourceId));

    const newNotifications = [];

    // Tasks assigned to current user
    tasks.forEach((task) => {
      const id = `task-assigned-${task.id}`;
      if (task.assignedTo?.userId === user.id && !existingIds.has(id)) {
        newNotifications.push({
          id: crypto.randomUUID(),
          sourceId: id,
          type: "task_assigned",
          title: "New task assigned to you",
          message: `"${task.title}" in project ${task.projectName}`,
          read: false,
          createdAt: task.createdAt,
          meta: { taskId: task.id, projectId: task.projectId },
        });
      }

      // Overdue tasks assigned to user
      if (
        task.assignedTo?.userId === user.id &&
        task.dueDate &&
        task.status !== "done" &&
        new Date(task.dueDate) < new Date()
      ) {
        const overdueId = `task-overdue-${task.id}`;
        if (!existingIds.has(overdueId)) {
          newNotifications.push({
            id: crypto.randomUUID(),
            sourceId: overdueId,
            type: "task_overdue",
            title: "Task overdue",
            message: `"${task.title}" was due ${new Date(task.dueDate).toLocaleDateString()}`,
            read: false,
            createdAt: task.dueDate,
            meta: { taskId: task.id, projectId: task.projectId },
          });
        }
      }

      // Tasks created by user that are now done
      if (task.createdBy === user.id && task.status === "done") {
        const doneId = `task-done-${task.id}`;
        if (!existingIds.has(doneId)) {
          newNotifications.push({
            id: crypto.randomUUID(),
            sourceId: doneId,
            type: "task_completed",
            title: "Task completed",
            message: `"${task.title}" has been marked as done`,
            read: false,
            createdAt: task.updatedAt,
            meta: { taskId: task.id, projectId: task.projectId },
          });
        }
      }
    });

    // Projects: user added as member
    projects.forEach((project) => {
      const membership = project.members?.find((m) => m.userId === user.id);
      if (membership && membership.role !== "owner") {
        const id = `project-joined-${project.id}`;
        if (!existingIds.has(id)) {
          newNotifications.push({
            id: crypto.randomUUID(),
            sourceId: id,
            type: "project_joined",
            title: "Added to a project",
            message: `You are now a ${membership.role} in "${project.name}"`,
            read: false,
            createdAt: membership.joinedAt || project.createdAt,
            meta: { projectId: project.id },
          });
        }
      }
    });

    // Teams: user added as member
    teams.forEach((team) => {
      const membership = team.members?.find((m) => m.userId === user.id);
      if (membership && membership.role !== "owner") {
        const id = `team-joined-${team.id}`;
        if (!existingIds.has(id)) {
          newNotifications.push({
            id: crypto.randomUUID(),
            sourceId: id,
            type: "team_joined",
            title: "Added to a team",
            message: `You joined "${team.name}" as ${membership.role}`,
            read: false,
            createdAt: membership.joinedAt || team.createdAt,
            meta: { teamId: team.id },
          });
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        const merged = [...newNotifications, ...prev];
        // Sort by date descending
        return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    }
  }, [user?.id]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Push a manual notification (for future use from other contexts)
  const pushNotification = useCallback(({ type, title, message, meta = {} }) => {
    const newNotification = {
      id: crypto.randomUUID(),
      sourceId: `manual-${crypto.randomUUID()}`,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      meta,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        pushNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}