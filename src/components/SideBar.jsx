import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    LayoutList,
    MessageCircleQuestionMark,
    Settings,
    SquareMousePointer,
    UsersRound,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FolderKanban,

    ListTodo,
    DownloadCloud
} from "lucide-react";
import { Button } from "./ui/button";
import { CardContent, CardHeader, CardTitle, Card } from "./ui/card";

const LinkMenu = [
    { id: 1, title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: 2, title: "Projects", href: "/dashboard/projects", icon: <FolderKanban size={20} /> },
    { id: 3, title: "Tasks", href: "/dashboard/tasks", icon: <ListTodo size={20} /> },
    { id: 4, title: "Team", href: "/dashboard/teams", icon: <UsersRound size={20} /> },
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
                self-start h-[calc(100vh-2rem)] my-4 mx-3  bg-neutral-50 rounded-xl flex-col justify-between p-3 relative transition-all duration-300 ease-in-out shadow-none
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
                    <img src="/single-icon.png" alt="Logo" width={32} height={32} className="min-w-[32px] rounded-full" />
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
                                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group relative font-normal
                                    ${isActive
                                        ? "bg-none text-green-800 font-semibold"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }
                                    ${isCollapsed ? "justify-center" : ""}
                                `}
                            >
                                <span className={isActive ? " text-green-600" : "text-muted-foreground group-hover:text-accent-foreground"}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.title}</span>}

                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-green-600 text-xs rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-none border border-green-600/45 z-50 whitespace-nowrap">
                                        {item.title}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* General Utilities */}
            <div className="flex flex-col gap-2 ">

                {General.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group relative
                                ${isActive
                                    ? "bg-none text-green-800 font-semibold"
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
                <Card className={`w-full max-w-xs overflow-hidden bg-black bg-[radial-gradient(circle_at_right_top,#15803d_0%,transparent_60%),radial-gradient(circle_at_right_bottom,#22c55e_10%,#022c22_60%,#000_100%)] p-5 text-white rounded-3xl border-none shadow-none
                  ${isCollapsed ? "w-15 justify-center items-center" : "w-full"
                    }
                    `}>
                    <CardHeader className="p-0 space-y-1">

                        {/* Top Floating Badge Icon matching the screenshot */}
                        
                           
                                {/* <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur-md mb-2 border border-white/10">
                                    <div className="h-2.5 w-2.5 rounded-full border-2 border-green-400 bg-transparent" />
                                </div> */}
                         


                        {/* Heading Stack */}
                        {
                            !isCollapsed && (
                                <CardTitle className="text-xl font-extrabold tracking-tight leading-6">
                                    Download our <br />
                                    Mobile App
                                </CardTitle>
                            )
                        }

                        {/* Subtitle description */}
                        {
                            !isCollapsed && (
                                <p className="text-[11px] font-medium tracking-wide text-zinc-300 pt-0.5">
                                    Get easy in another way
                                </p>
                            )
                        }



                    </CardHeader>

                    {/* Kept as empty spacer structure to match your template format */}
                    <CardContent className="p-0 h-fit " >
                        {
                            isCollapsed ? (
                                <button
                                    className="bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full text-white w-fit p-2 cursor-pointer hover:scale-90 duration-100"
                                >
                                    <DownloadCloud size={20} />

                                </button>
                            ) : (
                                <Button className={" border-none bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full text-white"} variant="ghost" >
                                  Download

                                </Button>
                            )
                        }

                    </CardContent>
                </Card>
            </div>
        </aside>
    );
}