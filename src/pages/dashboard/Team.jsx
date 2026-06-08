import { useState } from "react";
import { useTeams } from "@/context/TeamContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Shadcn UI Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Lucide Icons
import {
  Plus,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  UserPlus,
  ShieldCheck,
  Crown,
  Shield,
  LogOut,
  UserMinus,
  AlertCircle
} from "lucide-react";

const roleStyles = {
  owner: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  admin: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  member: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const roleIcons = {
  owner: Crown,
  admin: ShieldCheck,
  member: Shield,
};

export default function TeamPage() {
  const { user } = useAuth();
  const {
    getMyTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
    leaveTeam,
    transferOwnership,
    hasRole,
    getTeamById,
    getNonMembers,
  } = useTeams();

  const teams = getMyTeams();

  // ── View Mode ──────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // ── Create Dialog State ────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [createError, setCreateError] = useState("");

  // ── Edit Dialog State ──────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editError, setEditError] = useState("");

  // ── Manage Members Dialog State ────────────────────────────
 // ── Manage Members Dialog State ────────────────────────────
const [manageTeamId, setManageTeamId] = useState(null);
const [inviteEmail, setInviteEmail] = useState("");   // ✅ email input instead of dropdown
const [inviteRole, setInviteRole] = useState("member");
const [inviteError, setInviteError] = useState("");
const [invitedUser, setInvitedUser] = useState("");

  // ── Confirm Action Dialog State ────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ── Derived State for Manage Dialog ────────────────────────
  // This ensures that when inviteMember updates the context, our modal instantly reflects the new member
  const manageTeam = manageTeamId ? getTeamById(manageTeamId) : null;
  const nonMembers = manageTeamId ? getNonMembers(manageTeamId) : [];
  const isOwnerInManagedTeam = manageTeam?.members.find((m) => m.userId === user?.id)?.role === "owner";

  // ── Handlers ───────────────────────────────────────────────

  const handleCreate = () => {
    try {
      if (!createForm.name.trim()) {
        setCreateError("Team name is required.");
        return;
      }
      createTeam(createForm);
      toast.success("Team created successfully!");
      setCreateOpen(false);
      setCreateForm({ name: "", description: "" });
      setCreateError("");
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const openEdit = (team) => {
    setEditTarget(team);
    setEditForm({ name: team.name, description: team.description });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = () => {
    try {
      if (!editForm.name.trim()) {
        setEditError("Team name is required.");
        return;
      }
      updateTeam(editTarget.id, editForm);
      toast.success("Team updated successfully!");
      setEditOpen(false);
      setEditTarget(null);
      setEditError("");
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = (teamId) => {
    try {
      deleteTeam(teamId);
      toast.success("Team deleted successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLeave = (teamId) => {
    try {
      leaveTeam(teamId);
      toast.success("You have left the team.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openManage = (teamId) => {
    setManageTeamId(teamId);
    setInviteUserId("");
    setInviteRole("member");
  };

 // ── handleInvite — use email directly ─────────────────────
const handleInvite = () => {
    try {
        if (!inviteEmail.trim()) {
            setInviteError("Please enter an email address.");
            return;
        }
        inviteMember(manageTeam.id, {
            email: inviteEmail.trim(),
            role: inviteRole,
        });
        toast.success(`Member added successfully!`);
        setInviteEmail("");
        setInviteRole("member");
        setInviteError("");
    } catch (err) {
        setInviteError(err.message);   // shows "no account found" or "already a member"
    }
};

  const handleRemoveMember = (teamId, userId, name) => {
    try {
      removeMember(teamId, userId);
      toast.success(`${name} has been removed.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = (teamId, userId, newRole) => {
    try {
      updateMemberRole(teamId, userId, newRole);
      toast.success("Role updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTransferOwnership = (teamId, userId) => {
    try {
      transferOwnership(teamId, userId);
      toast.success("Ownership transferred successfully!");
      setConfirmOpen(false);
      setConfirmAction(null);
      setManageTeamId(null); // Close manage dialog as role changed significantly
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openConfirm = (action, teamId, payload) => {
    setConfirmAction({ action, teamId, payload });
    setConfirmOpen(true);
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    const { action, teamId, payload } = confirmAction;

    switch (action) {
      case "delete":
        handleDelete(teamId);
        break;
      case "leave":
        handleLeave(teamId);
        break;
      case "remove":
        handleRemoveMember(teamId, payload.userId, payload.name);
        break;
      case "transfer":
        handleTransferOwnership(teamId, payload.userId);
        return; // Early return handled inside handleTransferOwnership
      default:
        break;
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your teams, members, and roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-md p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>

          {/* Create Team Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b]">
                <Plus size={16} />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  You will be assigned as the owner of this team.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Engineering Team"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    className="border"
                    id="description"
                    placeholder="What is this team about?"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="cursor-pointer capitalize"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  className="cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b]"
                >
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Team Grid / List ──────────────────────────────── */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted">
            <Users size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">No teams yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first team to start collaborating.
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2 cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            New Team
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {teams.map((team) => {
            const isOwnerOrAdmin = hasRole(team.id, "owner", "admin");
            const isOwner = hasRole(team.id, "owner");
            const myRole = team.members.find((m) => m.userId === user?.id)?.role;

            return (
              <Card
                key={team.id}
                className={`flex justify-between shadow-md transition-shadow rounded-2xl ${
                  viewMode === "list"
                    ? "flex-row items-center p-4 gap-6"
                    : "flex-col"
                }`}
              >
                <CardHeader className={`pb-2 ${viewMode === "list" ? "p-0 flex-1" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center rounded-lg bg-gradient-to-b from-[#14532d] to-[#064e3b] p-2 text-white ${
                          viewMode === "list" ? "w-9 h-9" : "w-10 h-10"
                        }`}
                      >
                        <Users size={20} />
                      </div>
                      <div>
                        <CardTitle
                          className={`leading-snug ${
                            viewMode === "list" ? "text-base" : "text-lg"
                          }`}
                        >
                          {team.name}
                        </CardTitle>
                        {myRole && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize mt-1 ${
                              roleStyles[myRole]
                            }`}
                          >
                            {myRole}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl">
                        {isOwnerOrAdmin && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer capitalize rounded-xl"
                            onClick={() => openManage(team.id)}
                          >
                            <UserPlus size={14} />
                            Manage Members
                          </DropdownMenuItem>
                        )}
                        {isOwnerOrAdmin && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer capitalize rounded-xl"
                            onClick={() => openEdit(team)}
                          >
                            <Pencil size={14} />
                            Edit Team
                          </DropdownMenuItem>
                        )}
                        {isOwnerOrAdmin && <DropdownMenuSeparator />}
                        {!isOwner && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive capitalize rounded-xl"
                            onClick={() => openConfirm("leave", team.id)}
                          >
                            <LogOut size={14} />
                            Leave Team
                          </DropdownMenuItem>
                        )}
                        {isOwner && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive capitalize rounded-xl"
                            onClick={() => openConfirm("delete", team.id)}
                          >
                            <Trash2 size={14} />
                            Delete Team
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {viewMode === "grid" && (
                    <CardDescription className="text-xs line-clamp-2 mt-2">
                      {team.description || "No description provided."}
                    </CardDescription>
                  )}
                </CardHeader>

                {viewMode === "list" && (
                  <CardContent className="py-0 flex-1 hidden md:block">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {team.description || "No description provided."}
                    </p>
                  </CardContent>
                )}

                <CardFooter
                  className={`flex items-center justify-between text-xs text-muted-foreground ${
                    viewMode === "list"
                      ? "p-0 w-48 justify-end gap-4"
                      : "pt-2 border-t border-border"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {team.members.length}{" "}
                    {team.members.length === 1 ? "member" : "members"}
                  </span>
                  {viewMode === "grid" && (
                    <span className="flex items-center gap-1.5">
                      Created{" "}
                      {new Date(team.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Edit Team Dialog ──────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update your team details.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="cursor-pointer capitalize"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b]"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manage Members Dialog ─────────────────────────── */}
      <Dialog
        open={!!manageTeamId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setManageTeamId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Manage Members</DialogTitle>
            <DialogDescription>
              Invite new members or update existing roles for{" "}
              <span className="font-semibold text-foreground">
                {manageTeam?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Invite Section - Only visible to Owner/Admin */}
           
{isOwnerInManagedTeam && (
    <div className="flex flex-col gap-3 p-3 border rounded-xl bg-muted/40">
        <Label className="text-sm font-semibold flex items-center gap-2">
            <UserPlus size={14} /> Add New Member
        </Label>

        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                {/* ✅ Email input instead of dropdown */}
                <Input
                    placeholder="Enter member's email address"
                    value={inviteEmail}
                    onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setInviteError("");
                    }}
                    className="flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-28 cursor-pointer">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim()}
                    className="bg-linear-to-b from-[#14532d] to-[#064e3b] capitalize"
                >
                    Add
                </Button>
            </div>

            {/* Inline error — shows why invite failed */}
            {inviteError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {inviteError}
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                The person must have an account to be added.
            </p>
        </div>
    </div>
)}

            {/* Current Members List */}
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {manageTeam?.members.map((member) => {
                const RoleIcon = roleIcons[member.role] || Shield;
                const isMe = member.userId === user?.id;
                const isMemberOwner = member.role === "owner";
                const canManageMember = isOwnerInManagedTeam && !isMe;

                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {member.fullname?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.fullname}{" "}
                          {isMe && (
                            <span className="text-muted-foreground text-xs">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageMember && !isMemberOwner ? (
                        <Select
                          value={member.role}
                          onValueChange={(val) => {
                            if (val === "owner") {
                              openConfirm("transfer", manageTeam.id, {
                                userId: member.userId,
                                name: member.fullname,
                              });
                            } else {
                              handleRoleChange(
                                manageTeam.id,
                                member.userId,
                                val
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="admin"
                              className="cursor-pointer"
                            >
                              Admin
                            </SelectItem>
                            <SelectItem
                              value="member"
                              className="cursor-pointer"
                            >
                              Member
                            </SelectItem>
                            <SelectItem
                              value="owner"
                              className="cursor-pointer"
                            >
                              Make Owner
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize gap-1 ${roleStyles[member.role]}`}
                        >
                          <RoleIcon size={10} />
                          {member.role}
                        </Badge>
                      )}

                      {canManageMember && !isMemberOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl"
                          >
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive gap-2 cursor-pointer rounded-xl"
                              onClick={() =>
                                openConfirm("remove", manageTeam.id, {
                                  userId: member.userId,
                                  name: member.fullname,
                                })
                              }
                            >
                              <UserMinus size={14} /> Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Action Dialog ─────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {confirmAction?.action === "delete" && "Delete Team"}
              {confirmAction?.action === "leave" && "Leave Team"}
              {confirmAction?.action === "remove" && "Remove Member"}
              {confirmAction?.action === "transfer" && "Transfer Ownership"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "delete" &&
                "This will permanently delete the team and remove all members. This action cannot be undone."}
              {confirmAction?.action === "leave" &&
                "You will lose access to this team and its resources. You'll need to be re-invited to join."}
              {confirmAction?.action === "remove" &&
                `Are you sure you want to remove ${confirmAction?.payload?.name}? They will lose access immediately.`}
              {confirmAction?.action === "transfer" &&
                `This will transfer full ownership to ${confirmAction?.payload?.name}. You will be demoted to Admin.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="capitalize cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeConfirm}
              className="capitalize cursor-pointer"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}