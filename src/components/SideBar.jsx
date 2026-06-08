import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
    LayoutDashboard, 
    LayoutList, 
    MessageCircleQuestionMark, 
    Settings, 
    SquareMousePointer, 
    UserRound, 
    Calendar,
    ChevronLeft, 
    ChevronRight 
} from "lucide-react";
import { Button } from "./ui/button";

const LinkMenu = [
    { id: 1, title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: 2, title: "Projects", href: "/dashboard/projects", icon: <SquareMousePointer size={20} /> },
    { id: 3, title: "Tasks", href: "/dashboard/tasks", icon: <LayoutList size={20} /> },
    { id: 4, title: "Members", href: "/dashboard/teams", icon: <UserRound size={20} /> },
    { id: 5, title: "Calendar", href: "/dashboard/calendar", icon: <Calendar size={20} /> }
];

const General = [
    { id: 1, title: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
    { id: 2, title: "Help", href: "/dashboard/help", icon: <MessageCircleQuestionMark size={20} /> }
];

export default function SideBar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside 
            className={`
                hidden lg:flex  // ✅ Hide on mobile, show on lg+
                self-start h-[calc(100vh-2rem)] my-4 mx-3 bg-card border border-border rounded-xl flex-col justify-between p-3 relative transition-all duration-300 ease-in-out shadow-sm
                ${isCollapsed ? "w-20" : "w-64"}
            `}
        >
            {/* Collapse Toggle */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-xs cursor-pointer z-50 flex items-center justify-center"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>

            {/* Top Navigation */}
            <div className="flex flex-col gap-6">
                {/* Logo */}
                <div className={`flex items-center gap-3 px-2 h-15 ${isCollapsed ? "justify-center" : ""}`}>
                    <img src="/logo.png" alt="Logo" width={32} height={32} className="min-w-[32px]" />
                    {!isCollapsed && <span className="font-bold text-lg tracking-tight truncate">Workspace</span>}
                </div>

                {/* Primary Menu */}
                <nav className="flex flex-col gap-1">
                    {LinkMenu.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                to={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group relative font-semibold
                                    ${isActive 
                                        ? "bg-none text-green-800" 
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }
                                    ${isCollapsed ? "justify-center" : ""}
                                `}
                            >
                                <span className={isActive ? "text-current" : "text-muted-foreground group-hover:text-accent-foreground"}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.title}</span>}
                                
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-semibold rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md border z-50 whitespace-nowrap">
                                        {item.title}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* General Utilities */}
            <div className="flex flex-col gap-1 border-t pt-4 border-border">
                {General.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group relative
                                ${isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }
                                ${isCollapsed ? "justify-center" : ""}
                            `}
                        >
                            <span className={isActive ? "text-current" : "text-muted-foreground group-hover:text-accent-foreground"}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.title}</span>}
                            
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-semibold rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-md border z-50 whitespace-nowrap">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}