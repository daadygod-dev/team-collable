import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const TeamContext = createContext();

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

function safeSetToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to save ${key}:`, error);
    }
}

function syncMemberToProjects(teamId, newMember) {
    try {
        const projects = safeGetFromStorage("projects_db", []);
        const teamProjects = projects.filter((p) => p.teamId === teamId);
        if (teamProjects.length === 0) return;

        const updatedProjects = projects.map((project) => {
            if (project.teamId !== teamId) return project;
            const alreadyMember = project.members.some(
                (m) => m.userId === newMember.userId
            );
            if (alreadyMember) return project;

            return {
                ...project,
                members: [
                    ...project.members,
                    {
                        userId: newMember.userId,
                        fullname: newMember.fullname,
                        email: newMember.email,
                        role: newMember.role || "member",
                        joinedAt: new Date().toISOString(),
                    },
                ],
                updatedAt: new Date().toISOString(),
            };
        });

        safeSetToStorage("projects_db", updatedProjects);
    } catch (error) {
        console.error("Failed to sync member to projects:", error);
    }
}

function removeMemberFromProjects(teamId, targetUserId) {
    try {
        const projects = safeGetFromStorage("projects_db", []);
        const updatedProjects = projects.map((project) => {
            if (project.teamId !== teamId) return project;
            return {
                ...project,
                members: project.members.filter((m) => m.userId !== targetUserId),
                updatedAt: new Date().toISOString(),
            };
        });
        safeSetToStorage("projects_db", updatedProjects);
    } catch (error) {
        console.error("Failed to remove member from projects:", error);
    }
}

function updateMemberRoleInProjects(teamId, targetUserId, newRole) {
    try {
        const projects = safeGetFromStorage("projects_db", []);
        const updatedProjects = projects.map((project) => {
            if (project.teamId !== teamId) return project;
            return {
                ...project,
                members: project.members.map((m) =>
                    m.userId === targetUserId ? { ...m, role: newRole } : m
                ),
                updatedAt: new Date().toISOString(),
            };
        });
        safeSetToStorage("projects_db", updatedProjects);
    } catch (error) {
        console.error("Failed to update member role in projects:", error);
    }
}

export function TeamProvider({ children }) {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const isLoaded = useRef(false);  // ✅ FIX: Track if initial load is done

    // Load from localStorage on mount
    useEffect(() => {
        const stored = safeGetFromStorage("teams_db", []);
        setTeams(stored);
        isLoaded.current = true;  // ✅ Mark as loaded AFTER setting state
    }, []);

    // Save to localStorage ONLY after initial load
    useEffect(() => {
        if (!isLoaded.current) return;  // ✅ Skip save on initial render
        safeSetToStorage("teams_db", teams);
    }, [teams]);

    const getTeamById = (teamId) => {
        return teams.find((t) => t.id === teamId) || null;
    };

    const getMemberRole = (teamId) => {
        const team = getTeamById(teamId);
        return team?.members.find((m) => m.userId === user?.id) || null;
    };

    const hasRole = (teamId, ...roles) => {
        const member = getMemberRole(teamId);
        return roles.includes(member?.role);
    };

    const getMyTeams = () => {
        return teams.filter((t) => t.members.some((m) => m.userId === user?.id));
    };

    const getAllUsers = () => {
        const raw = safeGetFromStorage("users_db", []);
        return raw.map(({ password: _, ...u }) => u);
    };

    const getNonMembers = (teamId) => {
        const team = getTeamById(teamId);
        if (!team) return [];
        const memberIds = new Set(team.members.map((m) => m.userId));
        return getAllUsers().filter((u) => !memberIds.has(u.id));
    };

    const createTeam = ({ name, description }) => {
        if (!user) throw new Error("You must be logged in to create a team.");
        if (!name?.trim()) throw new Error("Team name is required.");

        const nameExists = teams.some(
            (t) => t.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (nameExists) throw new Error(`A team named "${name}" already exists.`);

        const newTeam = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description?.trim() || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user.id,
            members: [
                {
                    userId: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    role: "owner",
                    joinedAt: new Date().toISOString(),
                },
            ],
        };

        setTeams((prev) => [...prev, newTeam]);
        return newTeam;
    };

    const updateTeam = (teamId, updates) => {
        const role = getMemberRole(teamId)?.role;
        if (!["owner", "admin"].includes(role)) {
            throw new Error("Only owners and admins can update this team.");
        }

        if (updates.name) {
            const nameExists = teams.some(
                (t) =>
                    t.id !== teamId &&
                    t.name.toLowerCase() === updates.name.trim().toLowerCase()
            );
            if (nameExists) {
                throw new Error(`A team named "${updates.name}" already exists.`);
            }
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    };

    const deleteTeam = (teamId) => {
        const role = getMemberRole(teamId)?.role;
        if (role !== "owner") {
            throw new Error("Only the owner can delete this team.");
        }

        const projects = safeGetFromStorage("projects_db", []);
        const updatedProjects = projects.map((p) => {
            if (p.teamId === teamId) {
                return { ...p, teamId: null };
            }
            return p;
        });
        safeSetToStorage("projects_db", updatedProjects);

        setTeams((prev) => prev.filter((t) => t.id !== teamId));
    };

    const inviteMember = (teamId, targetUser) => {
        const role = getMemberRole(teamId)?.role;
        if (!["owner", "admin"].includes(role)) {
            throw new Error("Only owners and admins can invite members.");
        }

        const team = getTeamById(teamId);
        if (!team) throw new Error("Team not found.");

        const alreadyMember = team.members.some(
            (m) => m.userId === targetUser.id || m.email === targetUser.email
        );
        if (alreadyMember) throw new Error("This user is already a team member.");

        const allUsers = getAllUsers();
        const foundUser = allUsers.find(
            (u) => u.id === targetUser.id || u.email === targetUser.email
        );
        if (!foundUser) {
            throw new Error("No account found for this user. They must sign up first.");
        }

        const newMember = {
            userId: foundUser.id,
            fullname: foundUser.fullname,
            email: foundUser.email,
            role: targetUser.role || "member",
            joinedAt: new Date().toISOString(),
        };

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                        ...t,
                        members: [...t.members, newMember],
                        updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );

        syncMemberToProjects(teamId, newMember);
        return newMember;
    };

    const removeMember = (teamId, targetUserId) => {
        const currentRole = getMemberRole(teamId)?.role;
        const team = getTeamById(teamId);
        const targetMember = team?.members.find((m) => m.userId === targetUserId);

        if (!currentRole) throw new Error("You are not a member of this team.");
        if (!targetMember) throw new Error("User is not in this team.");
        if (targetMember.role === "owner") throw new Error("The owner cannot be removed.");
        if (targetUserId === user.id) throw new Error("You cannot remove yourself. Use Leave Team.");
        if (currentRole === "admin" && targetMember.role === "admin") {
            throw new Error("Admins cannot remove other admins.");
        }
        if (!["owner", "admin"].includes(currentRole)) {
            throw new Error("You don't have permission to remove members.");
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                        ...t,
                        members: t.members.filter((m) => m.userId !== targetUserId),
                        updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );

        removeMemberFromProjects(teamId, targetUserId);
    };

    const updateMemberRole = (teamId, targetUserId, newRole) => {
        const currentRole = getMemberRole(teamId)?.role;
        if (currentRole !== "owner") {
            throw new Error("Only the owner can change member roles.");
        }
        if (targetUserId === user.id) {
            throw new Error("You cannot change your own role.");
        }

        const validRoles = ["admin", "member"];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role. Choose from: ${validRoles.join(", ")}`);
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                        ...t,
                        members: t.members.map((m) =>
                            m.userId === targetUserId ? { ...m, role: newRole } : m
                        ),
                        updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );

        updateMemberRoleInProjects(teamId, targetUserId, newRole);
    };

    const leaveTeam = (teamId) => {
        const member = getMemberRole(teamId);
        if (!member) throw new Error("You are not a member of this team.");
        if (member.role === "owner") {
            throw new Error("Owners cannot leave. Transfer ownership or delete the team first.");
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                        ...t,
                        members: t.members.filter((m) => m.userId !== user.id),
                        updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );

        removeMemberFromProjects(teamId, user.id);
    };

    const transferOwnership = (teamId, targetUserId) => {
        const currentRole = getMemberRole(teamId)?.role;
        if (currentRole !== "owner") {
            throw new Error("Only the owner can transfer ownership.");
        }
        if (targetUserId === user.id) {
            throw new Error("You are already the owner.");
        }

        const team = getTeamById(teamId);
        const targetExists = team?.members.some((m) => m.userId === targetUserId);
        if (!targetExists) throw new Error("Target user is not a member of this team.");

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                        ...t,
                        members: t.members.map((m) => {
                            if (m.userId === user.id) return { ...m, role: "admin" };
                            if (m.userId === targetUserId) return { ...m, role: "owner" };
                            return m;
                        }),
                        updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );

        updateMemberRoleInProjects(teamId, user.id, "admin");
        updateMemberRoleInProjects(teamId, targetUserId, "owner");
    };

    const getTeamMembers = (teamId) => {
        return getTeamById(teamId)?.members || [];
    };

    return (
        <TeamContext.Provider
            value={{
                teams,
                createTeam,
                updateTeam,
                deleteTeam,
                inviteMember,
                removeMember,
                updateMemberRole,
                leaveTeam,
                transferOwnership,
                getMyTeams,
                getTeamById,
                getTeamMembers,
                getMemberRole,
                hasRole,
                getAllUsers,
                getNonMembers,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeams() {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeams must be used within a TeamProvider");
    }
    return context;
}