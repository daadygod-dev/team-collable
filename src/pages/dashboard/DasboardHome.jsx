import React, { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, CloudDownload, Plus, Triangle, TriangleAlert, Video, X, Upload, FileSpreadsheet, FileJson, FileText, CheckCircle2, AlertCircle } from "lucide-react"

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, PieChart, Label, Pie } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { useTasks } from "@/context/TaskContext"
import { useTeams } from "@/context/TeamContext"
import { useProjects } from "@/context/ProjectContext"

const CardData = [
    { id: 1, title: "Total Projects", key: "total", trend: "6", status: "increased from last month", Icon: <ArrowUpRight size={18} /> },
    { id: 2, title: "Ended Projects", key: "ended", trend: "12", status: "increased from last month", Icon: <ArrowUpRight size={18} /> },
    { id: 3, title: "Running Projects", key: "running", trend: "4", status: "increased from last month", Icon: <ArrowUpRight size={18} /> },
    { id: 4, title: "Pending Projects", key: "pending", trend: "2", status: "On discuss", Icon: <ArrowUpRight size={18} /> },
]

const importFormats = [
    { id: "csv", name: "CSV", description: "Comma-separated values from spreadsheets", icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "json", name: "JSON", description: "Structured data in JSON format", icon: FileJson, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "xlsx", name: "XLSX", description: "Microsoft Excel workbooks", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
]

export default function DashboardHome() {
    const { tasks } = useTasks()
    const { teams } = useTeams()
    const { projects } = useProjects()

    // ── Import modal state ──────────────────────────────
    const [importOpen, setImportOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isClosing, setIsClosing] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState("csv")
    const [dragOver, setDragOver] = useState(false)
    const [importedFile, setImportedFile] = useState(null)
    const [importStep, setImportStep] = useState("upload") // upload → preview → done
    const fileInputRef = useRef(null)

    const openImport = () => {
        setImportOpen(true)
        setImportStep("upload")
        setImportedFile(null)
        setSelectedFormat("csv")
        // Trigger enter animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsAnimating(true)
            })
        })
    }

    const closeImport = () => {
        setIsClosing(true)
        setIsAnimating(false)
        setTimeout(() => {
            setImportOpen(false)
            setIsClosing(false)
            setImportedFile(null)
            setImportStep("upload")
        }, 400)
    }

    // Lock body scroll when modal is open
    useEffect(() => {
        if (importOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [importOpen])

    const handleFileDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) processFile(file)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const processFile = (file) => {
        const ext = file.name.split(".").pop()?.toLowerCase()
        const validExts = {
            csv: ["csv"],
            json: ["json"],
            xlsx: ["xlsx", "xls"],
        }
        if (!validExts[selectedFormat]?.includes(ext)) {
            return
        }
        setImportedFile(file)
        setImportStep("preview")
    }

    const handleImport = () => {
        setImportStep("done")
        setTimeout(() => {
            closeImport()
        }, 1800)
    }

    // ── Metrics ─────────────────────────────────────────
    const metrics = useMemo(() => {
        const total = projects?.length || 0
        const ended = projects?.filter((p) => p.status === "completed" || p.status === "ended").length || 0
        const running = projects?.filter((p) => p.status === "running" || p.status === "active").length || 0
        const pending = projects?.filter((p) => p.status === "pending" || p.status === "discussion").length || 0
        return { total, ended, running, pending }
    }, [projects])

    const weeklyAnalyticsData = useMemo(() => {
        const days = ["S", "M", "T", "W", "T", "F", "S"]
        return days.map((dayLabel, index) => {
            const tasksOnDay = tasks?.filter((t) => new Date(t.createdAt).getDay() === index) || []
            const completedOnDay = tasksOnDay.filter((t) => t.status === "completed").length
            const completionRate = tasksOnDay.length > 0
                ? Math.round((completedOnDay / tasksOnDay.length) * 100)
                : Math.floor(Math.random() * 40) + 40
            return { day: dayLabel, value: completionRate, isActive: index === 2 }
        })
    }, [tasks])

    const chartData = useMemo(() => {
        const total = projects?.length || 0
        if (!total) {
            return [
                { name: "Completed", value: 50, color: "#3E8E41" },
                { name: "In Progress", value: 30, color: "#0A3911" },
                { name: "Pending", value: 20, color: "url(#legendStripes)" },
                { name: "EmptyTrackSpace", value: 40, color: "transparent" }
            ]
        }
        const completed = projects.filter(p => p.status === "completed" || p.status === "ended").length
        const inProgress = projects.filter(p => p.status === "running" || p.status === "active").length
        const pending = projects.filter(p => p.status === "pending" || p.status === "discussion").length
        const activeSum = completed + inProgress + pending
        const emptyHalfSpace = activeSum * 0.45
        return [
            { name: "Completed", value: completed, color: "#3E8E41" },
            { name: "In Progress", value: inProgress, color: "#0A3911" },
            { name: "Pending", value: pending, color: "url(#legendStripes)" },
            { name: "EmptyTrackSpace", value: emptyHalfSpace, color: "transparent" }
        ]
    }, [projects])

    const completedPercentage = useMemo(() => {
        const totalCount = projects?.length || 0
        if (!totalCount) return 41
        const completedCount = projects.filter(p => p.status === "completed" || p.status === "ended").length
        return Math.round((completedCount / totalCount) * 100)
    }, [projects])

    return (
        <>
            <div className="flex flex-col gap-4 bg-neutral-50 rounded-xl p-4">
                {/* Header section */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 min-h-20">
                    <div>
                        <h3 className="font-semibold text-2xl text-neutral-700">Dashboard</h3>
                        <p className="text-md text-green-600">Plan, prioritize, and accomplish your tasks with ease</p>
                    </div>

                    <div className="flex gap-2 justify-center items-center">
                        <Button className="flex gap-1 justify-center items-center rounded-full bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] cursor-pointer capitalize text-white hover:opacity-90">
                            <Plus size={18} /> add project
                        </Button>
                        <Button
                            variant="outline"
                            className="cursor-pointer flex gap-1 justify-center items-center capitalize rounded-full bg-white"
                            onClick={openImport}
                        >
                            <CloudDownload size={18} /> Import Data
                        </Button>
                    </div>
                </div>

                {/* Metric Cards Section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 w-full">
                    {CardData.map((card) => {
                        const rawCount = metrics[card.key]
                        return (
                            <div
                                key={card.id}
                                className="group flex flex-col justify-between p-5 rounded-2xl h-40 border border-none bg-white hover:bg-linear-to-br hover:from-[#22C55E] hover:via-[#16A34A] hover:to-[#14532D] hover:border-transparent cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                            >
                                <div className="flex justify-between items-start w-full">
                                    <h3 className="font-medium text-neutral-500 group-hover:text-white/90 text-sm transition-colors">
                                        {card.title}
                                    </h3>
                                    <div className="rounded-full h-8 w-8 flex items-center justify-center border border-neutral-200 bg-neutral-50 text-neutral-600 group-hover:bg-white/20 group-hover:border-transparent group-hover:text-white transition-all">
                                        {card.Icon}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="font-bold text-3xl text-neutral-800 group-hover:text-white transition-colors">
                                        {rawCount}
                                    </h2>
                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400 group-hover:text-white/80 transition-colors">
                                        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium border border-green-200 bg-green-50 text-green-700 group-hover:bg-white/20 group-hover:border-transparent group-hover:text-white">
                                            {card.trend}
                                            <Triangle size={10} className="fill-current" />
                                        </span>
                                        <span className="capitalize">{card.status}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </section>

                {/* Analytics Chart Section */}
                <section className="p-4 w-full max-w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="w-full border border-none shadow-none rounded-3xl p-2 bg-white">
                        <CardHeader className="pb-2 pt-3">
                            <CardTitle className="text-xl font-bold text-neutral-800 tracking-tight">Project Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <svg className="absolute w-0 h-0">
                                <defs>
                                    <pattern id="diagonalStripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                        <line x1="0" y1="0" x2="0" y2="8" stroke="#14532D" strokeWidth="2" opacity="0.75" />
                                    </pattern>
                                </defs>
                            </svg>

                            <div className="absolute left-[34%] top-[-8px] -translate-x-1/2 flex flex-col items-center z-10">
                                <div className="border border-green-200 bg-white rounded px-1 py-0.5 text-[9px] font-medium text-green-600 shadow-xs">
                                    79%
                                </div>
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full -mt-0.5" />
                            </div>

                            <div className="h-32 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyAnalyticsData} margin={{ top: 10, bottom: 5, left: 5, right: 5 }} barSize={26}>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
                                        />
                                        <Bar dataKey="value" radius={[20, 20, 20, 20]}>
                                            {weeklyAnalyticsData.map((entry, index) => {
                                                let barColor = "url(#diagonalStripes)"
                                                if (index === 1) barColor = "#2E7D32"
                                                if (index === 2) barColor = "#4ADE80"
                                                if (index === 3) barColor = "#062F16"
                                                return <Cell key={`cell-${index}`} fill={barColor} />
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full border border-none shadow-none rounded-3xl p-2 bg-white">
                        <CardHeader className="pt-4">
                            <CardTitle className="text-xl font-bold text-neutral-800 tracking-tight flex gap-1.5">
                                Remainders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <h2>
                                Meeting with senior software engineer
                            </h2>
                            <CardDescription className="flex flex-col gap-3">
                                <p>
                                    Meeting at:
                                    <span> 16:00 PM</span>
                                </p>
                                <Button className="flex gap-1.5 rounded-full bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] w-fit">
                                    <Video size={20} />
                                    Start meeting
                                </Button>
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card className="w-full max-w-full border border-none shadow-none rounded-3xl p-4 bg-white select-none">
                        <CardHeader className="pt-4">
                            <CardTitle className="text-xl font-bold text-neutral-800 tracking-tight flex gap-1.5">
                                Project progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col gap-2">
                            <div className="relative h-16 w-full flex items-center justify-center overflow-hidden">
                                <svg className="absolute w-0 h-0">
                                    <defs>
                                        <pattern id="legendStripes" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                            <line x1="0" y1="0" x2="0" y2="5" stroke="#737373" strokeWidth="1.2" opacity="0.6" />
                                        </pattern>
                                    </defs>
                                </svg>

                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            cx="50%"
                                            cy="90%"
                                            startAngle={200}
                                            endAngle={-20}
                                            innerRadius={24}
                                            outerRadius={36}
                                            stroke="none"
                                            cornerRadius={12}
                                            paddingAngle={0}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="absolute bottom-0 text-center flex flex-col items-center justify-center">
                                    <span className="text-sm font-extrabold text-neutral-900 leading-none">
                                        {completedPercentage}%
                                    </span>
                                    <span className="text-[8px] font-semibold text-neutral-400 mt-0.5 tracking-tight whitespace-nowrap">
                                        Project Ended
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#3E8E41]" />
                                    <span className="text-xs font-semibold text-neutral-700">Completed</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#0A3911]" />
                                    <span className="text-xs font-semibold text-neutral-700">In Progress</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-neutral-300 bg-[url(#legendStripes)] bg-repeat" style={{ backgroundImage: "linear-gradient(45deg, #737373 12%, transparent 12%, transparent 50%, #737373 50%, #737373 62%, transparent 62%, transparent)" }} />
                                    <span className="text-xs font-semibold text-neutral-700">Pending</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* ═══════════════════════════════════════════════
                FULLPAGE BOTTOM-STICKY IMPORT MODAL
            ═══════════════════════════════════════════════ */}
            {importOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/40 transition-opacity duration-400 ${
                            isAnimating && !isClosing ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={closeImport}
                    />

                    {/* Panel — slides up from bottom */}
                    <div
                        className={`absolute inset-x-0 bottom-0 top-[8%] bg-white rounded-t-3xl flex flex-col transition-all duration-400 ease-out ${
                            isAnimating && !isClosing
                                ? "translate-y-0 opacity-100"
                                : "translate-y-full opacity-0"
                        }`}
                    >
                        {/* Drag handle bar */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 rounded-full bg-neutral-300" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] flex items-center justify-center text-white">
                                    <CloudDownload size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg text-neutral-800">Import Data</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {importStep === "upload" && "Select a format and upload your file"}
                                        {importStep === "preview" && "Review your file before importing"}
                                        {importStep === "done" && "Import completed successfully"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-neutral-100"
                                onClick={closeImport}
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {/* ── Step: Upload ──────────────────── */}
                            {importStep === "upload" && (
                                <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                                    {/* Format selector */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                                            Choose import format
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {importFormats.map((fmt) => {
                                                const FmtIcon = fmt.icon
                                                const isSelected = selectedFormat === fmt.id
                                                return (
                                                    <button
                                                        key={fmt.id}
                                                        onClick={() => setSelectedFormat(fmt.id)}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                                            isSelected
                                                                ? "border-[#22C55E] bg-green-50/50"
                                                                : "border-neutral-200 bg-white hover:border-neutral-300"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                                                                isSelected ? fmt.color : "bg-neutral-50 border-neutral-200 text-neutral-500"
                                                            }`}
                                                        >
                                                            <FmtIcon size={20} />
                                                        </div>
                                                        <span
                                                            className={`text-sm font-semibold ${
                                                                isSelected ? "text-neutral-800" : "text-neutral-500"
                                                            }`}
                                                        >
                                                            {fmt.name}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground text-center leading-tight">
                                                            {fmt.description}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Drop zone */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                                            Upload file
                                        </h3>
                                        <div
                                            className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                                dragOver
                                                    ? "border-[#22C55E] bg-green-50/50"
                                                    : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 hover:bg-neutral-50"
                                            }`}
                                            onDragOver={(e) => {
                                                e.preventDefault()
                                                setDragOver(true)
                                            }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleFileDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400">
                                                <Upload size={24} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-neutral-700">
                                                    Drag & drop your file here
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    or <span className="text-[#16A34A] font-medium underline underline-offset-2">browse files</span>
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Supports .{selectedFormat.toUpperCase()} files up to 10MB
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept={`.${selectedFormat}`}
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                    </div>

                                    {/* Info box */}
                                    <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-700 leading-relaxed">
                                            <p className="font-semibold mb-1">Before importing, make sure your file follows the required format:</p>
                                            <ul className="list-disc list-inside space-y-0.5 text-amber-600">
                                                <li>First row must contain column headers</li>
                                                <li>Required columns: <span className="font-mono font-semibold">title</span>, <span className="font-mono font-semibold">status</span>, <span className="font-mono font-semibold">priority</span></li>
                                                <li>Date fields should use ISO format (YYYY-MM-DD)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step: Preview ─────────────────── */}
                            {importStep === "preview" && importedFile && (
                                <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                                    {/* File info card */}
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                                        <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500">
                                            {selectedFormat === "csv" && <FileSpreadsheet size={24} />}
                                            {selectedFormat === "json" && <FileJson size={24} />}
                                            {selectedFormat === "xlsx" && <FileText size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-neutral-800 truncate">
                                                {importedFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {(importedFile.size / 1024).toFixed(1)} KB · {selectedFormat.toUpperCase()} format
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full text-xs"
                                            onClick={() => {
                                                setImportStep("upload")
                                                setImportedFile(null)
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </div>

                                    {/* Preview table */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                                            Preview
                                        </h3>
                                        <div className="rounded-xl border border-neutral-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50">
                                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">Title</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">Status</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">Priority</th>
                                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500">Due Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100">
                                                    {[
                                                        { title: "Design system audit", status: "To Do", priority: "High", date: "2025-02-15" },
                                                        { title: "API integration tests", status: "In Progress", priority: "Medium", date: "2025-02-18" },
                                                        { title: "User onboarding flow", status: "To Do", priority: "High", date: "2025-02-20" },
                                                        { title: "Performance optimization", status: "Done", priority: "Low", date: "2025-02-10" },
                                                        { title: "Database migration", status: "In Progress", priority: "High", date: "2025-02-22" },
                                                    ].map((row, i) => (
                                                        <tr key={i} className="hover:bg-neutral-50/50">
                                                            <td className="px-4 py-2.5 text-neutral-700">{row.title}</td>
                                                            <td className="px-4 py-2.5">
                                                                <span
                                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                                        row.status === "Done"
                                                                            ? "bg-emerald-50 text-emerald-600"
                                                                            : row.status === "In Progress"
                                                                            ? "bg-amber-50 text-amber-600"
                                                                            : "bg-slate-100 text-slate-600"
                                                                    }`}
                                                                >
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                <span
                                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                                        row.priority === "High"
                                                                            ? "bg-red-50 text-red-600"
                                                                            : row.priority === "Medium"
                                                                            ? "bg-amber-50 text-amber-600"
                                                                            : "bg-blue-50 text-blue-600"
                                                                    }`}
                                                                >
                                                                    {row.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-muted-foreground">{row.date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Showing 5 of estimated rows in file
                                        </p>
                                    </div>

                                    {/* Import action */}
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-neutral-700">5 items</span> will be imported
                                        </p>
                                        <Button
                                            className="gap-2 bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] rounded-full"
                                            onClick={handleImport}
                                        >
                                            <Upload size={16} />
                                            Import Data
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step: Done ────────────────────── */}
                            {importStep === "done" && (
                                <div className="flex flex-col items-center justify-center gap-4 py-16 max-w-sm mx-auto w-full text-center">
                                    <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-800">
                                            Import Successful
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            5 items have been imported successfully into your workspace.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}