import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import { Input } from "@/components/ui/input";
import { Bell, Search, UserRound, Settings,LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage,AvatarFallback } from "@/components/ui/avatar";
import MobileBottomBar from "@/components/MobileBottomBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";


import { useAuth } from "@/context/AuthContext";
export default function DashboardLayout() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, logout } = useAuth();


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
        <header className="h-16 px-6  flex justify-between items-center shrink-0 mx-5.5 my-4 rounded-xl bg-neutral-50">

          {/* Search with icon + kbd badge */}
          <div className="relative w-full max-w-sm">
            {/* Search icon on the left */}
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />

            <Input
              id="search-input"
              className="rounded-xl pl-9 pr-16 bg-white"
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
          <div className="flex items-center gap-4">
            <button className="rounded-full bg-white p-2 cursor-pointer ">
              <Mail size={24}  className="text-current" />
            </button>
            <button className="rounded-full bg-white p-2 cursor-pointer ">
              <Bell size={24} />
            </button>
            <div className="flex gap-2">
              <div className="my-auto">

              </div>
              <div className="text-xs text-neutral-600">
                <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={"px-2 rounded-full py-3   shadow-none"}
                  
                  >
                  <Avatar>
                    <AvatarImage
                      src="/avatar.jpg"
                      
                      alt="@shadcn"
                      className=""
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="font-normal text-sm">

                    {
                      user.fullname
                    }
                  </p>


                </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48 rounded-xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-green-700 lowercase">
              {
                user.email
            }
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer rounnded-lg">
            <UserRound className="mr-1 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer rounnded-lg">
            <Settings className="mr-1 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer rounnded-lg"
          onClick={() => logout()}
        >
          <LogOut className="mr-1 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
                </DropdownMenu>




              </div>
             






            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <MobileBottomBar />
      </div>
    </div>
  );
}