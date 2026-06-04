import { useState } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  CalendarDays,
} from "lucide-react";

const statusStyles = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-1 text-xs rounded-xl",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function ProjectPage() {
  const { user } = useAuth();
  const { getMyProjects, createProject, updateProject, deleteProject, hasRole } =
    useProjects();

  const projects = getMyProjects();

  // ── Create dialog state ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [createError, setCreateError] = useState("");

  // ── Edit dialog state ──
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [editError, setEditError] = useState("");

  // ── Handlers ──────────────────────────────────────────────

  const handleCreate = () => {
    try {
      if (!createForm.name.trim()) {
        setCreateError("Project name is required.");
        return;
      }
      createProject(createForm);
      setCreateOpen(false);
      setCreateForm({ name: "", description: "", status: "active" });
      setCreateError("");
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const openEdit = (project) => {
    setEditTarget(project);
    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = () => {
    try {
      if (!editForm.name.trim()) {
        setEditError("Project name is required.");
        return;
      }
      updateProject(editTarget.id, editForm);
      setEditOpen(false);
      setEditTarget(null);
      setEditError("");
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = (projectId) => {
    try {
      deleteProject(projectId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your team projects.
          </p>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen} className={""}>
          <DialogTrigger asChild>
            <Button className="gap-2 cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b] ">
              <Plus size={16} />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                You will be assigned as the owner of this project.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Website Redesign"
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
                  placeholder="What is this project about?"
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

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select className="cursor-pointer border"
                  value={createForm.status}
                  onValueChange={(val) =>
                    setCreateForm((prev) => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="cursor-pointer border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className={""} >
                    <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                    <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                    <SelectItem value="archived" className="cursor-pointer">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="cursor-pointer capitalize">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b] " >Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Project Grid ──────────────────────────────────── */}
      {projects.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-border rounded-xl">
          <div className="p-4 rounded-full bg-muted">
            <FolderOpen size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first project to get started.
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2 cursor-pointer capitalize bg-linear-to-b from-[#14532d] to-[#064e3b] "
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const isOwnerOrAdmin = hasRole(project.id, "owner", "admin");
            const isOwner = hasRole(project.id, "owner");

            return (
              <Card
                key={project.id}
                className="flex flex-col justify-between shadow-md transition-shadow rounded-2xl"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {project.name}
                    </CardTitle>

                    {/* Actions — only for owner/admin */}
                    {isOwnerOrAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                          >
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={"rounded-2xl"}>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer capitalize rounded-xl"
                            onClick={() => openEdit(project)}
                          >
                            <Pencil size={14} />
                            Edit
                          </DropdownMenuItem>
                          {isOwner && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive capitalize rounded-xl"
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {project.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </Badge>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {project.members.length}{" "}
                    {project.members.length === 1 ? "member" : "members"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Edit Dialog ───────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of your project.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
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

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className={"capitalize"}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}