import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);

    // Load projects from localStorage on mount
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("projects_db")) || [];
        setProjects(stored);
    }, []);

    // Save to localStorage whenever projects change
    useEffect(() => {
        localStorage.setItem("projects_db", JSON.stringify(projects));
    }, [projects]);

    // ─── CREATE ───────────────────────────────────────────────
    const createProject = ({ name, description, status = "active" }) => {
        if (!user) throw new Error("You must be logged in to create a project.");

        const newProject = {
            id: crypto.randomUUID(),
            name,
            description,
            status,                  // "active" | "completed" | "archived"
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user.id,
            members: [
                {
                    userId: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    role: "owner",   // ✅ creator is always owner
                    joinedAt: new Date().toISOString(),
                }
            ],
        };

        setProjects((prev) => [...prev, newProject]);
        return newProject;
    };

    // ─── UPDATE ───────────────────────────────────────────────
    const updateProject = (projectId, updates) => {
        const project = getProjectById(projectId);
        if (!project) throw new Error("Project not found.");

        const currentMember = getMemberRole(projectId);
        if (!["owner", "admin"].includes(currentMember?.role)) {
            throw new Error("Only owners and admins can update this project.");
        }

        setProjects((prev) =>
            prev.map((p) =>
                p.id === projectId
                    ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                    : p
            )
        );
    };

    // ─── DELETE ───────────────────────────────────────────────
    const deleteProject = (projectId) => {
        const currentMember = getMemberRole(projectId);
        if (currentMember?.role !== "owner") {
            throw new Error("Only the owner can delete this project.");
        }

        setProjects((prev) => prev.filter((p) => p.id !== projectId));
    };

    // ─── MEMBERS ──────────────────────────────────────────────

    // Add a member to a project (admin or owner only)
    const addMember = (projectId, newMember) => {
        const currentMember = getMemberRole(projectId);
        if (!["owner", "admin"].includes(currentMember?.role)) {
            throw new Error("Only owners and admins can add members.");
        }

        const project = getProjectById(projectId);
        const alreadyExists = project.members.some((m) => m.userId === newMember.userId);
        if (alreadyExists) throw new Error("User is already a member of this project.");

        const memberToAdd = {
            userId: newMember.userId,
            fullname: newMember.fullname,
            email: newMember.email,
            role: newMember.role || "member",  // default to member if not specified
            joinedAt: new Date().toISOString(),
        };

        setProjects((prev) =>
            prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: [...p.members, memberToAdd],
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            )
        );
    };

    // Remove a member (owner can remove anyone, admin can remove members only)
    const removeMember = (projectId, targetUserId) => {
        const currentMember = getMemberRole(projectId);
        const targetMember = getProjectById(projectId)?.members.find(
            (m) => m.userId === targetUserId
        );

        if (!currentMember) throw new Error("You are not a member of this project.");
        if (targetMember?.role === "owner") throw new Error("The owner cannot be removed.");
        if (
            currentMember.role === "admin" &&
            targetMember?.role === "admin"
        ) {
            throw new Error("Admins cannot remove other admins.");
        }
        if (!["owner", "admin"].includes(currentMember.role)) {
            throw new Error("You don't have permission to remove members.");
        }

        setProjects((prev) =>
            prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: p.members.filter((m) => m.userId !== targetUserId),
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            )
        );
    };

    // Promote or demote a member's role (owner only)
    const updateMemberRole = (projectId, targetUserId, newRole) => {
        const currentMember = getMemberRole(projectId);
        if (currentMember?.role !== "owner") {
            throw new Error("Only the owner can change member roles.");
        }
        if (targetUserId === user.id) {
            throw new Error("You cannot change your own role.");
        }

        const validRoles = ["admin", "member"];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }

        setProjects((prev) =>
            prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: p.members.map((m) =>
                            m.userId === targetUserId ? { ...m, role: newRole } : m
                        ),
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            )
        );
    };

    // ─── HELPERS ──────────────────────────────────────────────

    // Get all projects the current user is a member of
    const getMyProjects = () => {
        return projects.filter((p) =>
            p.members.some((m) => m.userId === user?.id)
        );
    };

    // Get a single project by id
    const getProjectById = (projectId) => {
        return projects.find((p) => p.id === projectId) || null;
    };

    // Get the current user's role in a specific project
    const getMemberRole = (projectId) => {
        const project = getProjectById(projectId);
        return project?.members.find((m) => m.userId === user?.id) || null;
    };

    // Check if current user has a given role in a project
    const hasRole = (projectId, ...roles) => {
        const member = getMemberRole(projectId);
        return roles.includes(member?.role);
    };

    return (
        <ProjectContext.Provider
            value={{
                projects,
                createProject,
                updateProject,
                deleteProject,
                addMember,
                removeMember,
                updateMemberRole,
                getMyProjects,
                getProjectById,
                getMemberRole,
                hasRole,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProjects must be used within a ProjectProvider");
    }
    return context;
}