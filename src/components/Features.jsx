import { 
  Terminal, 
  GitBranch, 
  FileCode, 
  Users, 
  Activity, 
  Flame 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function Features() {
  const featuresList = [
    {
      icon: <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Embedded Terminal Sync",
      description: "Link local Termux environments directly into your shared cloud terminal frames. Run test scripts and share compiler outputs natively."
    },
    {
      icon: <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: "Visual Git Streams",
      description: "Track branches, resolve merge conflicts, and review code requests visually across your engineering squad without swapping windows."
    },
    {
      icon: <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Real-Time Pair Coding",
      description: "Write code simultaneously with multiplayer syntax highlighting, cursor tracks, and shared workspace configurations built directly into the grid."
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Unified Standups",
      description: "Ditch tracking notes over separate chats. Drag-and-drop code blocks directly into shared text channels during sprint planning."
    },
    {
      icon: <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      title: "Edge Deployment Pipelines",
      description: "Trigger production builds and monitors directly out of shared staging branches. Track compilation logs synchronously as a team."
    },
    {
      icon: <Flame className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      title: "Asset Workspace Storage",
      description: "Keep project graphics, architectural maps, and static images structured alongside your core codebase files with strict storage safety."
    }
  ];

  return (
    <section className="bg-background py-24 sm:py-32 border-t border-border/40" id="Features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header Content Block */}
        <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
          <h2 className="text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            A Unified Core For Engineering Teams
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Built for how developers build.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stop losing structural focus by jumping between isolated dashboards. Team Collable bridges your local code scripts, media assets, and team alignment.
          </p>
        </div>

        {/* Responsive Features Cards Grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresList.map((item, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md rounded-2xl"
            >
              {/* Top subtle lighting indicator on card focus */}
              <div className="absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
              
              <CardHeader className="space-y-4 pt-6 px-6 pb-2">
                {/* Icon Wrapper Frame */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border transition-colors duration-300 group-hover:bg-background">
                  {item.icon}
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                  {item.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
