import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import { Bell, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
export default function DashboardLayout() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user } = useAuth();

  // Listen for Ctrl+K to focus the search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input").focus();
        setIsSearchFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* 1. Sidebar */}
      <SideBar />

      {/* 2. Right column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 px-6 bg-card flex justify-between items-center shrink-0 my-3">

          {/* Search with icon + kbd badge */}
          <div className="relative w-full max-w-sm">
            {/* Search icon on the left */}
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />

            <Input
              id="search-input"
              className="rounded-xl pl-9 pr-16"
              placeholder="Search tasks"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />

            {/* Ctrl+K badge on the right — hides when focused */}
            {!isSearchFocused && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                <kbd className="text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-mono leading-none">
                  Ctrl
                </kbd>
                <kbd className="text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-mono leading-none">
                  K
                </kbd>
              </div>
            )}
          </div>

          {/* Notifications and profile */}
          <div className="flex items-center gap-5">
            <button  className="rounded-full bg-transparent h-6 w-6">
              <Bell size={25} />
            </button>
            <div className="flex gap-2">
              <div className="my-auto">
                <img src="/avatar.jpg" alt="avatar" className="w-8 h-8 rounded-full" />
              </div>
              <div className="text-xs text-neutral-600">
                <p className="font-black text-sm">
                 
                    {
                      user.fullname
                    }
                    </p>
                
                  <p className="text-neutral-400">
                    {
                      user.email
                    }
                  </p>
               

              </div>






            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}