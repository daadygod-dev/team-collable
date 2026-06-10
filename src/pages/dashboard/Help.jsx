import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  Search,
  HelpCircle,
  LogOut,
  ArrowRight,
  ChevronDown,
  Mail,
  BookOpen,
  Shield,
  Users,
  FolderKanban,
  ClipboardList,
  Settings,
  Bell,
  CreditCard,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── FAQ Data ────────────────────────────────────────────
const helpTopics = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    items: [
      {
        q: "How do I create my first project?",
        a: "Navigate to the Projects page from the sidebar and click the 'New Project' button. Fill in the project name, description, and select a team. Click 'Create Project' to get started.",
      },
      {
        q: "How do I invite team members?",
        a: "Go to the Team page, click the settings icon next to your team name, then select 'Manage Members'. Enter the email address of the person you want to invite and assign them a role.",
      },
      {
        q: "What are the different user roles?",
        a: "There are three roles: Owner has full control including deletion and ownership transfer. Admin can manage members and project settings. Member can view and work on assigned tasks.",
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderKanban,
    items: [
      {
        q: "How do I edit a project's details?",
        a: "Open the project you want to edit, click the three-dot menu in the top-right corner, and select 'Edit Project'. Update the name or description and save your changes.",
      },
      {
        q: "Can I archive or delete a project?",
        a: "Project owners and admins can delete a project from the project's settings menu. Note that deleting a project will also remove all associated tasks. This action cannot be undone.",
      },
      {
        q: "How do project statuses work?",
        a: "Projects can be in Running, Completed, Pending, or Discussion status. You can change a project's status from its settings. Completed projects appear separately in analytics.",
      },
    ],
  },
  {
    id: "tasks",
    title: "Tasks",
    icon: ClipboardList,
    items: [
      {
        q: "How do I create a task?",
        a: "Go to the Tasks page, select a project from the dropdown, then click 'Add Task'. Fill in the title, description, assignee, priority, and due date. Click 'Assign Task' to create it.",
      },
      {
        q: "How do I move a task to the next stage?",
        a: "Click the three-dot menu on any task row and select 'Move to [Next Stage]'. Tasks flow from To Do → In Progress → Completed automatically.",
      },
      {
        q: "What do the priority levels mean?",
        a: "High priority tasks are urgent and should be handled first. Medium priority tasks are important but not urgent. Low priority tasks can be deferred to a later time.",
      },
      {
        q: "Can I set due dates for tasks?",
        a: "Yes, when creating or editing a task you can pick a due date from the calendar picker. Tasks past their due date will show a 'Late' indicator if not completed.",
      },
    ],
  },
  {
    id: "teams",
    title: "Teams",
    icon: Users,
    items: [
      {
        q: "How do I create a new team?",
        a: "On the Team page, click 'New Team'. Enter a name and optional description. You'll automatically become the team owner. After creation, you can add members immediately.",
      },
      {
        q: "How do I transfer team ownership?",
        a: "Open the team's manage members panel, find the member you want to transfer to, click their action menu, and select 'Transfer Ownership'. You'll be demoted to Admin.",
      },
      {
        q: "What happens when I remove a member?",
        a: "Removed members lose access to all team projects and tasks immediately. Their previously assigned tasks will remain but show unassigned.",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    items: [
      {
        q: "How do I customize my notifications?",
        a: "Go to Settings → Notifications. You can toggle email and push notifications, set digest frequency, and choose which events trigger alerts (task assignments, mentions, etc.).",
      },
      {
        q: "Why am I not receiving email notifications?",
        a: "Check your notification settings to ensure email notifications are enabled. Also verify your email address in Account settings is correct. Check your spam folder as well.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    items: [
      {
        q: "How do I change my password?",
        a: "Go to Settings → Security, enter your current password, then set and confirm your new password. Your new password must be at least 8 characters long.",
      },
      {
        q: "Is my data secure?",
        a: "All data is stored locally in your browser and never sent to external servers. Your password is never stored in plain text. Enable two-factor authentication for extra security.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Navigate to Settings → Security and toggle on 'Enable 2FA'. Follow the setup instructions to link an authenticator app to your account.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    icon: CreditCard,
    items: [
      {
        q: "Is this application free to use?",
        a: "Yes, this application is completely free. There are no hidden charges, premium tiers, or subscription fees. All features are available to every user.",
      },
      {
        q: "Will there be a paid plan in the future?",
        a: "We may introduce optional premium features in the future, but the core functionality will always remain free. Any changes will be communicated well in advance.",
      },
    ],
  },
];

export default function HelpPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  // ── Filter topics by search ──────────────────────────
  const filteredTopics = useMemo(() => {
    if (!search.trim()) return helpTopics;

    const query = search.toLowerCase();
    return helpTopics
      .map((topic) => {
        const titleMatch = topic.title.toLowerCase().includes(query);
        const matchedItems = topic.items.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        );
        if (titleMatch) return topic;
        if (matchedItems.length > 0) return { ...topic, items: matchedItems };
        return null;
      })
      .filter(Boolean);
  }, [search]);

  const hasResults = filteredTopics.length > 0;

  // ── Handle logout ────────────────────────────────────
  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Failed to log out.");
    }
  };

  // ── Search result count ──────────────────────────────
  const totalResults = useMemo(() => {
    return filteredTopics.reduce((sum, t) => sum + t.items.length, 0);
  }, [filteredTopics]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-5 md:p-8 rounded-xl bg-neutral-50 min-h-screen">
      {/* ═══════════════════════════════════════════════
          LEFT: Help Content
      ═══════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#16A34A]">
              <HelpCircle size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
                Help
              </h1>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions and learn how to use the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search for help topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white text-sm rounded-xl"
          />
          {search.trim() && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search results indicator */}
        {search.trim() && (
          <p className="text-xs text-muted-foreground -mt-3">
            {hasResults
              ? `Found ${totalResults} result${totalResults !== 1 ? "s" : ""} for "${search}"`
              : `No results found for "${search}"`}
          </p>
        )}

        {/* Popular Topics — Accordion */}
        {hasResults ? (
          <div className="flex flex-col gap-0">
            {!search.trim() && (
              <h2 className="text-sm font-semibold text-neutral-700 mb-2">
                Popular Topics
              </h2>
            )}
            <Accordion
              type="multiple"
              className="flex flex-col gap-2"
            >
              {filteredTopics.map((topic) => {
                const TopicIcon = topic.icon;
                return (
                  <AccordionItem
                    key={topic.id}
                    value={topic.id}
                    className="bg-white rounded-xl px-1 data-[state=open]:bg-white"
                  >
                    <AccordionTrigger className="py-4 px-4 hover:no-underline hover:bg-neutral-50/80 rounded-xl transition-colors group">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            "bg-[#22C55E]/10 text-[#16A34A] group-data-[state=open]:bg-[#22C55E] group-data-[state=open]:text-white"
                          )}
                        >
                          <TopicIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-neutral-800">
                          {topic.title}
                        </span>
                        {search.trim() && (
                          <span className="text-[11px] text-muted-foreground font-normal ml-1">
                            ({topic.items.length})
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0 px-4">
                      <div className="flex flex-col gap-0 ml-11">
                        {topic.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="py-3"
                          >
                            <p className="text-sm font-medium text-neutral-700 mb-1.5">
                              {item.q}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.a}
                            </p>
                            {idx < topic.items.length - 1 && (
                              <div className="w-full h-px bg-neutral-100 mt-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Search size={24} />
            </div>
            <div>
              <p className="font-semibold text-sm text-neutral-700">
                No results found
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Try different keywords or browse the topics below.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full mt-1"
              onClick={() => setSearch("")}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Support section */}
        <div className="mt-4 flex flex-col gap-3 p-5 bg-white rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#16A34A]">
              <MessageCircle size={17} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                Still need help?
              </h3>
              <p className="text-xs text-muted-foreground">
                Our support team is here for you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-12">
            <Mail size={14} className="text-[#16A34A]" />
            <span>
              Email us at{" "}
              <span className="font-medium text-[#16A34A]">
                support@taskflow.app
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT: Logout Card
      ═══════════════════════════════════════════════ */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="lg:sticky lg:top-8 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl">
            {/* Icon */}
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <LogOut size={26} />
            </div>

            {/* Text */}
            <div className="text-center">
              <h2 className="text-base font-semibold text-neutral-800">
                Ready to leave?
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[220px]">
                You will be signed out of your account and redirected to the login page.
              </p>
            </div>

            {/* Arrow visual */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Session ends</span>
              <ArrowRight size={14} />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 w-full mt-1">
              <Button
                onClick={() => setLogoutOpen(true)}
                className="gap-2 bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full w-full"
              >
                <LogOut size={15} />
                Yes, Logout
              </Button>
              <Button
                variant="outline"
                className="rounded-full w-full"
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </Button>
            </div>

            {/* Hint */}
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Your unsaved work may be lost. Make sure to save before logging out.
            </p>
          </div>

          {/* Quick links under logout */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">
              Quick Links
            </p>
            {[
              { label: "Settings", path: "/dashboard/settings" },
              { label: "Projects", path: "/dashboard/projects" },
              { label: "Tasks", path: "/dashboard/tasks" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-colors cursor-pointer group"
              >
                <span>{link.label}</span>
                <ExternalLink
                  size={13}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          LOGOUT CONFIRM DIALOG
      ═══════════════════════════════════════════════ */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <LogOut size={26} />
              </div>
              <DialogTitle className="text-center">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-center max-w-xs">
                Are you sure you want to sign out? You'll need to sign in again to access your account.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col pt-2">
            <Button
              variant="destructive"
              className="gap-2 rounded-full w-full"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Yes, Logout
            </Button>
            <Button
              variant="outline"
              className="rounded-full w-full"
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}