import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutList,
  UserRound,
  Search,
  X,
  LogOut,
  Settings,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Main nav items for bottom bar (limited space)
const MobileNavItems = [
  { id: 1, title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { id: 2, title: "Tasks", href: "/dashboard/tasks", icon: LayoutList },
  { id: 3, title: "Members", href: "/dashboard/teams", icon: UserRound },
];

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if current route matches nav item (including sub-routes)
  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="absolute top-0 left-0 right-0 p-4 pt-safe">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-lg">
                <Search size={18} className="ml-2 text-muted-foreground shrink-0" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, projects..."
                  className="border-0 focus-visible:ring-0 h-10 bg-transparent px-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </form>
            <div className="absolute top-full left-0 right-0 h-4" onClick={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        {/* Safe area spacer for notch devices */}
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <nav className="flex items-center justify-around px-2 py-1">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg text-muted-foreground active:text-foreground transition-colors"
            >
              <Search size={20} strokeWidth={2} />
              <span className="text-[10px] font-medium">Search</span>
            </button>

            {/* Nav Items */}
            {MobileNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg transition-colors relative",
                    active
                      ? "text-green-800 dark:text-green-400"
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-800 dark:bg-green-400" />
                  )}
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                    {item.title}
                  </span>
                </Link>
              );
            })}

            {/* Profile Button */}
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg transition-colors",
                    profileOpen
                      ? "text-green-800 dark:text-green-400"
                      : "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user?.avatar} alt={user?.fullname} />
                      <AvatarFallback className="text-[8px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {getInitials(user?.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <span className="text-[10px] font-medium">Profile</span>
                </button>
              </PopoverTrigger>
              <PopoverContent 
                side="top" 
                align="end" 
                sideOffset={8}
                className="w-64 p-2 rounded-xl"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.fullname} />
                    <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {getInitials(user?.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.fullname}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col gap-0.5">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>

                {/* Bottom chevron hint */}
                <div className="flex justify-center mt-2">
                  <ChevronUp size={14} className="text-muted-foreground/50" />
                </div>
              </PopoverContent>
            </Popover>
          </nav>
        </div>
      </div>
    </>
  );
}