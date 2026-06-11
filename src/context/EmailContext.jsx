import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const EmailContext = createContext();

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

export function EmailProvider({ children }) {
  const { user } = useAuth();

  const [emails, setEmails] = useState(() =>
    safeGetFromStorage("emails_db", [])
  );

  const isMounted = useRef(false);
  useEffect(() => { isMounted.current = true; }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    try {
      localStorage.setItem("emails_db", JSON.stringify(emails));
    } catch (e) {
      console.error("Failed to save emails:", e);
    }
  }, [emails]);

  // Derive emails from tasks/projects/teams for the current user
  useEffect(() => {
    if (!user) return;

    const tasks = safeGetFromStorage("tasks_db", []);
    const projects = safeGetFromStorage("projects_db", []);
    const teams = safeGetFromStorage("teams_db", []);
    const existing = safeGetFromStorage("emails_db", []);
    const existingIds = new Set(existing.map((e) => e.sourceId));

    const newEmails = [];

    // Task assigned to current user → email from task creator
    tasks.forEach((task) => {
      if (task.assignedTo?.userId !== user.id) return;

      const id = `email-task-assigned-${task.id}`;
      if (existingIds.has(id)) return;

      // Try to find creator info
      const allUsers = safeGetFromStorage("users_db", []);
      const creator = allUsers.find((u) => u.id === task.createdBy);
      const fromName = creator?.fullname || "A team member";
      const fromEmail = creator?.email || "team@app.com";

      const priorityLabel =
        task.priority === "high" ? "🔴 High" :
        task.priority === "medium" ? "🟡 Medium" : "🟢 Low";

      newEmails.push({
        id: crypto.randomUUID(),
        sourceId: id,
        from: { name: fromName, email: fromEmail },
        to: { name: user.fullname, email: user.email },
        subject: `Task assigned: "${task.title}"`,
        body: `Hi ${user.fullname},\n\nYou have been assigned a new task.\n\nTask: ${task.title}\nProject: ${task.projectName}\nPriority: ${priorityLabel}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}\n\n${task.description ? `Description:\n${task.description}` : ""}\n\nPlease log in to view and update this task.\n\nBest,\nThe ${task.projectName} team`,
        read: false,
        createdAt: task.createdAt,
        meta: { type: "task_assigned", taskId: task.id, projectId: task.projectId },
      });
    });

    // Overdue task reminder
    tasks.forEach((task) => {
      if (task.assignedTo?.userId !== user.id) return;
      if (!task.dueDate || task.status === "done") return;
      if (new Date(task.dueDate) >= new Date()) return;

      const id = `email-task-overdue-${task.id}`;
      if (existingIds.has(id)) return;

      newEmails.push({
        id: crypto.randomUUID(),
        sourceId: id,
        from: { name: "Task Reminder", email: "noreply@app.com" },
        to: { name: user.fullname, email: user.email },
        subject: `Overdue: "${task.title}"`,
        body: `Hi ${user.fullname},\n\nThis is a reminder that the following task is overdue:\n\nTask: ${task.title}\nProject: ${task.projectName}\nDue date: ${new Date(task.dueDate).toLocaleDateString()}\nStatus: ${task.status}\n\nPlease update the task status or reach out to your project manager.\n\nBest,\nTask Manager`,
        read: false,
        createdAt: task.dueDate,
        meta: { type: "task_overdue", taskId: task.id, projectId: task.projectId },
      });
    });

    // Added to a project
    projects.forEach((project) => {
      const membership = project.members?.find((m) => m.userId === user.id);
      if (!membership || membership.role === "owner") return;

      const id = `email-project-joined-${project.id}`;
      if (existingIds.has(id)) return;

      const allUsers = safeGetFromStorage("users_db", []);
      const owner = project.members.find((m) => m.role === "owner");
      const ownerUser = owner ? allUsers.find((u) => u.id === owner.userId) : null;
      const fromName = ownerUser?.fullname || "Project Owner";
      const fromEmail = ownerUser?.email || "team@app.com";

      newEmails.push({
        id: crypto.randomUUID(),
        sourceId: id,
        from: { name: fromName, email: fromEmail },
        to: { name: user.fullname, email: user.email },
        subject: `You've been added to "${project.name}"`,
        body: `Hi ${user.fullname},\n\nYou have been added to the project "${project.name}" as a ${membership.role}.\n\n${project.description ? `About this project:\n${project.description}\n\n` : ""}You can now view and contribute to tasks in this project.\n\nBest,\n${fromName}`,
        read: false,
        createdAt: membership.joinedAt || project.createdAt,
        meta: { type: "project_joined", projectId: project.id },
      });
    });

    // Added to a team
    teams.forEach((team) => {
      const membership = team.members?.find((m) => m.userId === user.id);
      if (!membership || membership.role === "owner") return;

      const id = `email-team-joined-${team.id}`;
      if (existingIds.has(id)) return;

      const allUsers = safeGetFromStorage("users_db", []);
      const owner = team.members.find((m) => m.role === "owner");
      const ownerUser = owner ? allUsers.find((u) => u.id === owner.userId) : null;
      const fromName = ownerUser?.fullname || "Team Owner";
      const fromEmail = ownerUser?.email || "team@app.com";

      newEmails.push({
        id: crypto.randomUUID(),
        sourceId: id,
        from: { name: fromName, email: fromEmail },
        to: { name: user.fullname, email: user.email },
        subject: `Welcome to the "${team.name}" team`,
        body: `Hi ${user.fullname},\n\nYou've been added to the team "${team.name}" as a ${membership.role}.\n\n${team.description ? `About this team:\n${team.description}\n\n` : ""}You now have access to all projects under this team.\n\nBest,\n${fromName}`,
        read: false,
        createdAt: membership.joinedAt || team.createdAt,
        meta: { type: "team_joined", teamId: team.id },
      });
    });

    if (newEmails.length > 0) {
      setEmails((prev) => {
        const merged = [...newEmails, ...prev];
        return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    }
  }, [user?.id]);

  const markAsRead = useCallback((emailId) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, read: true } : e))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setEmails((prev) => prev.map((e) => ({ ...e, read: true })));
  }, []);

  const deleteEmail = useCallback((emailId) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
  }, []);

  const clearAll = useCallback(() => {
    setEmails([]);
  }, []);

  // Send a manual in-app email (for future use)
  const sendEmail = useCallback(({ to, subject, body, meta = {} }) => {
    const newEmail = {
      id: crypto.randomUUID(),
      sourceId: `manual-${crypto.randomUUID()}`,
      from: { name: "System", email: "noreply@app.com" },
      to,
      subject,
      body,
      read: false,
      createdAt: new Date().toISOString(),
      meta,
    };
    setEmails((prev) => [newEmail, ...prev]);
  }, []);

  const unreadCount = emails.filter((e) => !e.read).length;

  return (
    <EmailContext.Provider
      value={{
        emails,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteEmail,
        clearAll,
        sendEmail,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmails() {
  const context = useContext(EmailContext);
  if (!context)
    throw new Error("useEmails must be used within an EmailProvider");
  return context;
}