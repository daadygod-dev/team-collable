import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

function safeGetFromStorage(key, defaultValue = []) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage:`, error);
        return defaultValue;
    }
}

const PROTECTED_FIELDS = ["id", "createdAt", "createdBy", "members", "teamId"];

export function ProjectProvider({ children }) {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const isLoaded = useRef(false);  // ✅ FIX: Track if initial load is done

    // Load projects from localStorage on mount
    useEffect(() => {
        const stored = safeGetFromStorage("projects_db", []);
        setProjects(stored);
        isLoaded.current = true;  // ✅ Mark as loaded AFTER setting state
    }, []);

    // Save to localStorage ONLY after initial load
    useEffect(() => {
        if (!isLoaded.current) return;  // ✅ Skip save on initial render
        try {
            localStorage.setItem("projects_db", JSON.stringify(projects));
        } catch (error) {
            console.error("Failed to save projects to localStorage:", error);
        }
    }, [projects]);

    // ... rest of the code stays the same ...
    
    const getProjectById = useCallback((projectId, projectList = null) => {
        const list = projectList || projects;
        return list.find((p) => p.id === projectId) || null;
    }, [projects]);

    const getMemberRole = useCallback((projectId, projectList = null) => {
        const project = getProjectById(projectId, projectList);
        return project?.members.find((m) => m.userId === user?.id) || null;
    }, [getProjectById, user?.id]);

    const getProjectsByTeam = useCallback((teamId) => {
        if (!teamId) return [];
        return projects.filter((p) => p.teamId === teamId);
    }, [projects]);

    const createProject = ({ name, description, teamId = null, status = "active" }) => {
        if (!user) throw new Error("You must be logged in to create a project.");
        
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            throw new Error("Project name is required.");
        }

        const validStatuses = ["active", "completed", "archived"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }

        // ✅ If teamId provided, add all team members to project
        let initialMembers = [
            {
                userId: user.id,
                fullname: user.fullname,
                email: user.email,
                role: "owner",
                joinedAt: new Date().toISOString(),
            }
        ];

        if (teamId) {
            const teams = safeGetFromStorage("teams_db", []);
            const team = teams.find((t) => t.id === teamId);
            if (team) {
                // Add team members (skip creator, already added as owner)
                team.members.forEach((member) => {
                    if (member.userId !== user.id) {
                        const exists = initialMembers.some((m) => m.userId === member.userId);
                        if (!exists) {
                            initialMembers.push({
                                userId: member.userId,
                                fullname: member.fullname,
                                email: member.email,
                                role: member.role === "owner" ? "admin" : "member",
                                joinedAt: new Date().toISOString(),
                            });
                        }
                    }
                });
            }
        }

        const newProject = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description?.trim() || "",
            teamId,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user.id,
            members: initialMembers,
        };

        setProjects((prev) => [...prev, newProject]);
        return newProject;
    };

    const updateProject = (projectId, updates) => {
        if (!user) throw new Error("You must be logged in to update a project.");

        let project = null;

        setProjects((prev) => {
            project = prev.find((p) => p.id === projectId);
            if (!project) throw new Error("Project not found.");

            const currentMember = project.members.find((m) => m.userId === user.id);
            if (!["owner", "admin"].includes(currentMember?.role)) {
                throw new Error("Only owners and admins can update this project.");
            }

            const safeUpdates = { ...updates };
            PROTECTED_FIELDS.forEach((field) => {
                delete safeUpdates[field];
            });

            if (Object.keys(safeUpdates).length === 0) return prev;

            return prev.map((p) =>
                p.id === projectId
                    ? { ...p, ...safeUpdates, updatedAt: new Date().toISOString() }
                    : p
            );
        });

        return project;
    };

    const deleteProject = (projectId) => {
        if (!user) throw new Error("You must be logged in to delete a project.");

        let canDelete = false;

        setProjects((prev) => {
            const project = prev.find((p) => p.id === projectId);
            if (!project) throw new Error("Project not found.");

            const currentMember = project.members.find((m) => m.userId === user.id);
            if (currentMember?.role !== "owner") {
                throw new Error("Only the owner can delete this project.");
            }

            canDelete = true;
            return prev.filter((p) => p.id !== projectId);
        });

        return canDelete;
    };

    const addMember = (projectId, newMember) => {
        if (!user) throw new Error("You must be logged in.");

        if (!newMember?.userId || !newMember?.fullname || !newMember?.email) {
            throw new Error("userId, fullname, and email are required.");
        }

        setProjects((prev) => {
            const project = prev.find((p) => p.id === projectId);
            if (!project) throw new Error("Project not found.");

            const currentMember = project.members.find((m) => m.userId === user.id);
            if (!["owner", "admin"].includes(currentMember?.role)) {
                throw new Error("Only owners and admins can add members.");
            }

            if (project.members.some((m) => m.userId === newMember.userId)) {
                throw new Error("User is already a member of this project.");
            }

            const validRoles = ["owner", "admin", "member"];
            const memberRole = newMember.role || "member";
            if (!validRoles.includes(memberRole)) {
                throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
            }

            if (memberRole === "owner") {
                throw new Error("Cannot add another owner. Use role transfer instead.");
            }

            const memberToAdd = {
                userId: newMember.userId,
                fullname: newMember.fullname,
                email: newMember.email,
                role: memberRole,
                joinedAt: new Date().toISOString(),
            };

            return prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: [...p.members, memberToAdd],
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            );
        });
    };

    const removeMember = (projectId, targetUserId) => {
        if (!user) throw new Error("You must be logged in.");

        setProjects((prev) => {
            const project = prev.find((p) => p.id === projectId);
            if (!project) throw new Error("Project not found.");

            const currentMember = project.members.find((m) => m.userId === user.id);
            const targetMember = project.members.find((m) => m.userId === targetUserId);

            if (!currentMember) throw new Error("You are not a member of this project.");
            if (!targetMember) throw new Error("Target user is not a member of this project.");
            if (targetMember.role === "owner") throw new Error("The owner cannot be removed.");
            if (currentMember.role === "admin" && targetMember.role === "admin") {
                throw new Error("Admins cannot remove other admins.");
            }
            if (!["owner", "admin"].includes(currentMember.role)) {
                throw new Error("You don't have permission to remove members.");
            }

            return prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: p.members.filter((m) => m.userId !== targetUserId),
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            );
        });
    };

    const updateMemberRole = (projectId, targetUserId, newRole) => {
        if (!user) throw new Error("You must be logged in.");

        if (targetUserId === user.id) {
            throw new Error("You cannot change your own role.");
        }

        const validRoles = ["admin", "member"];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }

        setProjects((prev) => {
            const project = prev.find((p) => p.id === projectId);
            if (!project) throw new Error("Project not found.");

            const currentMember = project.members.find((m) => m.userId === user.id);
            if (currentMember?.role !== "owner") {
                throw new Error("Only the owner can change member roles.");
            }

            const targetMember = project.members.find((m) => m.userId === targetUserId);
            if (!targetMember) throw new Error("Target user is not a member.");

            return prev.map((p) =>
                p.id === projectId
                    ? {
                        ...p,
                        members: p.members.map((m) =>
                            m.userId === targetUserId ? { ...m, role: newRole } : m
                        ),
                        updatedAt: new Date().toISOString(),
                      }
                    : p
            );
        });
    };

    const getMyProjects = useCallback(() => {
        if (!user) return [];
        return projects.filter((p) =>
            p.members.some((m) => m.userId === user.id)
        );
    }, [projects, user?.id]);

    const hasRole = useCallback((projectId, ...roles) => {
        const member = getMemberRole(projectId);
        return roles.includes(member?.role);
    }, [getMemberRole]);

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
                getProjectsByTeam,
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