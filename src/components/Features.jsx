import { 
  LayoutGrid, 
  Calendar, 
  FileText, 
  Users, 
  HelpCircle, 
  HardDrive 
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
      icon: <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Shared Dashboards",
      description: "Keep all your daily apps, links, and updates inside one clean view. No more digging through browser history to find your work."
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: "Visual Timelines",
      description: "See what your team is working on, track project deadlines, and update progress bars without scheduling extra meetings."
    },
    {
      icon: <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Live Document Editing",
      description: "Write notes, plan projects, and build team guides together in real time with simple text formatting that anyone can use."
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Central Team Chats",
      description: "Drop files and notes directly into your project channels. Keep your team aligned and on the same page from day one."
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      title: "Quick Status Updates",
      description: "Share daily progress reports and tag teammates instantly. See what needs attention next without sending constant emails."
    },
    {
      icon: <HardDrive className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      title: "Secure File Storage",
      description: "Keep images, documents, and presentation slides safely stored right alongside your projects for quick access anytime."
    }
  ];

  return (
    <section className="bg-background py-24 sm:py-32 border-t border-border/40" id="Features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header Content Block */}
        <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
          <h2 className="text-base font-semibold uppercase tracking-wider text-green-600 dark:text-blue-400">
            A Better Way To Work
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Built for how you get things done.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stop wasting time jumping between messy screens and disconnected tools. Bring your team’s files, daily tasks, and company communication into one clean workspace.
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
              <div className="absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] transition-all duration-300 group-hover:w-full" />
              
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
