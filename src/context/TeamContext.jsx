import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TeamContext = createContext();

export function TeamProvider({ children }) {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);

    // ── Persist ───────────────────────────────────────────────
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("teams_db")) || [];
        setTeams(stored);
    }, []);

    useEffect(() => {
        localStorage.setItem("teams_db", JSON.stringify(teams));
    }, [teams]);

    // ── CREATE ────────────────────────────────────────────────
    const createTeam = ({ name, description }) => {
        if (!user) throw new Error("You must be logged in to create a team.");
        if (!name?.trim()) throw new Error("Team name is required.");

        const allTeams = JSON.parse(localStorage.getItem("teams_db")) || [];
        const nameExists = allTeams.some(
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
                    role: "owner",          // ✅ creator is always owner
                    joinedAt: new Date().toISOString(),
                },
            ],
        };

        setTeams((prev) => [...prev, newTeam]);
        return newTeam;
    };

    // ── UPDATE ────────────────────────────────────────────────
    const updateTeam = (teamId, updates) => {
        const role = getMemberRole(teamId)?.role;
        if (!["owner", "admin"].includes(role)) {
            throw new Error("Only owners and admins can update this team.");
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    };

    // ── DELETE ────────────────────────────────────────────────
    const deleteTeam = (teamId) => {
        const role = getMemberRole(teamId)?.role;
        if (role !== "owner") {
            throw new Error("Only the owner can delete this team.");
        }

        setTeams((prev) => prev.filter((t) => t.id !== teamId));
    };

    // ── MEMBERS ───────────────────────────────────────────────

    // Invite a user to a team by email (owner/admin only)
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

        // Look up user from users_db by email
        const allUsers = JSON.parse(localStorage.getItem("users_db")) || [];
        const foundUser = allUsers.find((u) => u.email === targetUser.email);
        if (!foundUser) {
            throw new Error(
                `No account found with email "${targetUser.email}". They must sign up first.`
            );
        }

        const newMember = {
            userId: foundUser.id,
            fullname: foundUser.fullname,
            email: foundUser.email,
            role: targetUser.role || "member",  // default member
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

        return newMember;
    };

    // Remove a member (owner can remove anyone, admin can remove members only)
    const removeMember = (teamId, targetUserId) => {
        const currentRole = getMemberRole(teamId)?.role;
        const team = getTeamById(teamId);
        const targetMember = team?.members.find((m) => m.userId === targetUserId);

        if (!currentRole) throw new Error("You are not a member of this team.");
        if (!targetMember) throw new Error("Target user is not in this team.");
        if (targetMember.role === "owner") throw new Error("The owner cannot be removed.");
        if (targetUserId === user.id) throw new Error("You cannot remove yourself.");
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
    };

    // Update a member's role (owner only)
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
    };

    // Leave a team (any member except owner)
    const leaveTeam = (teamId) => {
        const member = getMemberRole(teamId);
        if (!member) throw new Error("You are not a member of this team.");
        if (member.role === "owner") {
            throw new Error(
                "Owners cannot leave their team. Transfer ownership or delete the team."
            );
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
    };

    // Transfer ownership to another member (owner only)
    const transferOwnership = (teamId, targetUserId) => {
        const currentRole = getMemberRole(teamId)?.role;
        if (currentRole !== "owner") {
            throw new Error("Only the owner can transfer ownership.");
        }
        if (targetUserId === user.id) {
            throw new Error("You are already the owner.");
        }

        setTeams((prev) =>
            prev.map((t) =>
                t.id === teamId
                    ? {
                          ...t,
                          members: t.members.map((m) => {
                              if (m.userId === user.id) return { ...m, role: "admin" }; // demote current owner to admin
                              if (m.userId === targetUserId) return { ...m, role: "owner" }; // promote target
                              return m;
                          }),
                          updatedAt: new Date().toISOString(),
                      }
                    : t
            )
        );
    };

    // ── HELPERS ───────────────────────────────────────────────

    // All teams current user belongs to
    const getMyTeams = () => {
        return teams.filter((t) =>
            t.members.some((m) => m.userId === user?.id)
        );
    };

    // Single team by id
    const getTeamById = (teamId) => {
        return teams.find((t) => t.id === teamId) || null;
    };

    // Current user's membership object in a team
    const getMemberRole = (teamId) => {
        const team = getTeamById(teamId);
        return team?.members.find((m) => m.userId === user?.id) || null;
    };

    // Check if current user has one of the given roles
    const hasRole = (teamId, ...roles) => {
        const member = getMemberRole(teamId);
        return roles.includes(member?.role);
    };

    // Get all registered users (for invite lookup)
    const getAllUsers = () => {
        return JSON.parse(localStorage.getItem("users_db")) || [];
    };

    // Get users not yet in a team (for invite suggestions)
    const getNonMembers = (teamId) => {
        const team = getTeamById(teamId);
        if (!team) return [];
        const memberIds = new Set(team.members.map((m) => m.userId));
        return getAllUsers().filter((u) => !memberIds.has(u.id));
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