import { useState } from "react";
import { useTeams } from "@/context/TeamContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import {
  Plus,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  ShieldCheck,
  Crown,
  Shield,
  LogOut,
  UserMinus,
  AlertCircle,
  Settings,
} from "lucide-react";

// ── Style maps ─────────────────────────────────────────────
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
  } = useTeams();

  const teams = getMyTeams();

  // ── Selected team ──────────────────────────────────────
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "");

  const selectedTeam = selectedTeamId ? getTeamById(selectedTeamId) : null;
  const myRoleInTeam = selectedTeam?.members.find(
    (m) => m.userId === user?.id
  )?.role;
  const isOwnerOfSelected = myRoleInTeam === "owner";
  const isAdminOfSelected = ["owner", "admin"].includes(myRoleInTeam);

  // ── Create Dialog ──────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [createError, setCreateError] = useState("");

  // ── Edit Dialog ────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editError, setEditError] = useState("");

  // ── Add Member Dialog ──────────────────────────────────
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteError, setInviteError] = useState("");

  // ── Confirm Dialog ─────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ── Handlers ───────────────────────────────────────────

  const handleCreate = () => {
    try {
      if (!createForm.name.trim()) {
        setCreateError("Team name is required.");
        return;
      }
      const newTeam = createTeam(createForm);
      toast.success("Team created successfully!");
      setCreateOpen(false);
      setCreateForm({ name: "", description: "" });
      setCreateError("");
      // Auto-select the newly created team
      setSelectedTeamId(newTeam.id);
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const openEdit = () => {
    if (!selectedTeam) return;
    setEditForm({
      name: selectedTeam.name,
      description: selectedTeam.description,
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = () => {
    try {
      if (!editForm.name.trim()) {
        setEditError("Team name is required.");
        return;
      }
      updateTeam(selectedTeamId, editForm);
      toast.success("Team updated successfully!");
      setEditOpen(false);
      setEditError("");
    } catch (err) {
      setEditError(err.message);
    }
  };

  const openAddMember = () => {
    if (!selectedTeamId) return toast.error("Select a team first.");
    setInviteEmail("");
    setInviteRole("member");
    setInviteError("");
    setAddMemberOpen(true);
  };

  const handleInvite = () => {
    try {
      if (!inviteEmail.trim()) {
        setInviteError("Please enter an email address.");
        return;
      }
      inviteMember(selectedTeamId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success("Member added successfully!");
      setInviteEmail("");
      setInviteRole("member");
      setInviteError("");
      setAddMemberOpen(false);
    } catch (err) {
      setInviteError(err.message);
    }
  };

  const handleRemoveMember = (userId, name) => {
    try {
      removeMember(selectedTeamId, userId);
      toast.success(`${name} has been removed.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    try {
      updateMemberRole(selectedTeamId, userId, newRole);
      toast.success("Role updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTransferOwnership = (userId) => {
    try {
      transferOwnership(selectedTeamId, userId);
      toast.success("Ownership transferred successfully!");
      setConfirmOpen(false);
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteTeam = () => {
    try {
      deleteTeam(selectedTeamId);
      toast.success("Team deleted successfully!");
      const remaining = getMyTeams();
      setSelectedTeamId(remaining[0]?.id || "");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLeaveTeam = () => {
    try {
      leaveTeam(selectedTeamId);
      toast.success("You have left the team.");
      const remaining = getMyTeams();
      setSelectedTeamId(remaining[0]?.id || "");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openConfirm = (action, payload) => {
    setConfirmAction({ action, payload });
    setConfirmOpen(true);
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    const { action, payload } = confirmAction;

    switch (action) {
      case "delete":
        handleDeleteTeam();
        break;
      case "leave":
        handleLeaveTeam();
        break;
      case "remove":
        handleRemoveMember(payload.userId, payload.name);
        break;
      case "transfer":
        handleTransferOwnership(payload.userId);
        return; // early return — handleTransferOwnership closes dialog itself
      default:
        break;
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 rounded-xl bg-neutral-50">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their roles.
            </p>
          </div>

          {/* Team selector — only when multiple teams */}
          {teams.length > 1 && (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* New Team button — always visible */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer rounded-full"
            onClick={() => {
              setCreateForm({ name: "", description: "" });
              setCreateError("");
              setCreateOpen(true);
            }}
          >
            <Plus size={14} />
            New Team
          </Button>

          {/* Team settings dropdown */}
          {selectedTeam && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <Settings size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl w-[180px]">
                {isAdminOfSelected && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer rounded-lg"
                    onClick={openEdit}
                  >
                    <Pencil size={14} />
                    Edit Team
                  </DropdownMenuItem>
                )}
                {!isOwnerOfSelected && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                    onClick={() => openConfirm("leave")}
                  >
                    <LogOut size={14} />
                    Leave Team
                  </DropdownMenuItem>
                )}
                {isOwnerOfSelected && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                      onClick={() => openConfirm("delete")}
                    >
                      <Trash2 size={14} />
                      Delete Team
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            className="gap-2 cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
            onClick={openAddMember}
            disabled={!selectedTeamId || !isAdminOfSelected}
          >
            <UserPlus size={16} />
            Add Member
          </Button>
        </div>
      </div>

      {/* ── Empty: no teams ──────────────────────────────── */}
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
            className="gap-2 cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
            onClick={() => {
              setCreateForm({ name: "", description: "" });
              setCreateError("");
              setCreateOpen(true);
            }}
          >
            <Plus size={14} />
            New Team
          </Button>
        </div>
      ) : !selectedTeam || selectedTeam.members.length === 0 ? (
        /* ── Empty: no members ───────────────────────────── */
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted">
            <Users size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">No members yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first member to get started.
            </p>
          </div>
          {isAdminOfSelected && (
            <Button
              size="sm"
              className="gap-2 cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
              onClick={openAddMember}
            >
              <UserPlus size={14} />
              Add Member
            </Button>
          )}
        </div>
      ) : (
        /* ── Members Table ──────────────────────────────────*/
        <div className="rounded-xl border border-border overflow-hidden bg-white">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4">Members</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px] pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTeam.members.map((member) => {
                  const RoleIcon = roleIcons[member.role] || Shield;
                  const isMe = member.userId === user?.id;
                  const isMemberOwner = member.role === "owner";
                  const canManage =
                    isOwnerOfSelected && !isMe && !isMemberOwner;

                  return (
                    <TableRow key={member.userId} className="group">
                      {/* Name */}
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.role === "owner" ? (
                              <img src="/admin.png" alt={member.fullname} className="" />
                            ) : member.role === "admin" ? (
                              <img src="/avatar.png" alt={member.fullname} className="" />
                            ) : (
                              <img src="/user-avatar.png" alt={member.fullname} className="" />
                            )}
                          </Avatar>

                          <span className="text-sm font-medium">
                            {member.fullname}
                            {isMe && (
                              <span className="text-muted-foreground text-xs ml-1.5">
                                (You)
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {member.email}
                        </span>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        {canManage ? (
                          <Select
                            value={member.role}
                            onValueChange={(val) => {
                              if (val === "owner") {
                                openConfirm("transfer", {
                                  userId: member.userId,
                                  name: member.fullname,
                                });
                              } else {
                                handleRoleChange(member.userId, val);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-[110px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="owner">Make Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize gap-1 ${roleStyles[member.role]}`}
                          >
                            <RoleIcon size={10} />
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Tasks */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground">—</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                        >
                          Active
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-lg w-[180px]"
                          >
                            {canManage && (
                              <>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer rounded-lg"
                                  onClick={() =>
                                    handleRoleChange(member.userId, "admin")
                                  }
                                >
                                  <ShieldCheck size={14} />
                                  Set as Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer rounded-lg"
                                  onClick={() =>
                                    handleRoleChange(member.userId, "member")
                                  }
                                >
                                  <Shield size={14} />
                                  Set as Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer rounded-lg"
                                  onClick={() =>
                                    openConfirm("transfer", {
                                      userId: member.userId,
                                      name: member.fullname,
                                    })
                                  }
                                >
                                  <Crown size={14} />
                                  Transfer Ownership
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                                  onClick={() =>
                                    openConfirm("remove", {
                                      userId: member.userId,
                                      name: member.fullname,
                                    })
                                  }
                                >
                                  <UserMinus size={14} />
                                  Remove Member
                                </DropdownMenuItem>
                              </>
                            )}
                            {/* Admin can also be removed by owner */}
                            {isOwnerOfSelected &&
                              !isMe &&
                              isMemberOwner &&
                              selectedTeam.members.length > 1 && (
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer rounded-lg"
                                  onClick={() =>
                                    openConfirm("transfer", {
                                      userId: member.userId,
                                      name: member.fullname,
                                    })
                                  }
                                >
                                  <Crown size={14} />
                                  Transfer Ownership
                                </DropdownMenuItem>
                              )}
                            {isMe && !isMemberOwner && (
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-lg"
                                onClick={() => openConfirm("leave")}
                              >
                                <LogOut size={14} />
                                Leave Team
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col divide-y divide-border">
            {selectedTeam.members.map((member) => {
              const RoleIcon = roleIcons[member.role] || Shield;
              const isMe = member.userId === user?.id;
              const isMemberOwner = member.role === "owner";
              const canManage = isOwnerOfSelected && !isMe && !isMemberOwner;

              return (
                <div key={member.userId} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-muted text-xs font-semibold">
                          {member.fullname?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {member.fullname}
                          {isMe && (
                            <span className="text-muted-foreground text-xs ml-1.5">
                              (You)
                            </span>
                          )}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() =>
                                handleRoleChange(member.userId, "admin")
                              }
                            >
                              <ShieldCheck size={14} />
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() =>
                                handleRoleChange(member.userId, "member")
                              }
                            >
                              <Shield size={14} />
                              Set as Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              onClick={() =>
                                openConfirm("remove", {
                                  userId: member.userId,
                                  name: member.fullname,
                                })
                              }
                            >
                              <UserMinus size={14} />
                              Remove
                            </DropdownMenuItem>
                          </>
                        )}
                        {isMe && !isMemberOwner && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => openConfirm("leave")}
                          >
                            <LogOut size={14} />
                            Leave
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-11">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize gap-1 ${roleStyles[member.role]}`}
                    >
                      <RoleIcon size={10} />
                      {member.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Create Team Dialog ───────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              You will be assigned as the owner of this team.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Team Name</Label>
              <Input
                placeholder="e.g. Engineering Team"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
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
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle size={12} />
                {createError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
            >
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Team Dialog ─────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update your team details.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Team Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
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
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle size={12} />
                {editError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Member Dialog ────────────────────────────── */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to{" "}
              <span className="font-semibold text-foreground">
                {selectedTeam?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Email Address</Label>
              <Input
                placeholder="Enter member's email address"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inviteError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle size={12} />
                {inviteError}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              The person must have an account to be added.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddMemberOpen(false)}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="cursor-pointer bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Action Dialog ────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
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
              onClick={() => {
                setConfirmOpen(false);
                setConfirmAction(null);
              }}
              className="cursor-pointer rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeConfirm}
              className="cursor-pointer rounded-full"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}