import { PlusCircle, UserPlus, FileEdit, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Create Your Workspace",
      description: "Set up your central team hub in seconds. No complex configuration or messy installations required."
    },
    {
      id: "02",
      icon: <UserPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: "Invite Your Team",
      description: "Send a secure link to bring your teammates, managers, and external partners into your shared workspace instantly."
    },
    {
      id: "03",
      icon: <FileEdit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Collaborate Together",
      description: "Work on files, plan your weekly tasks, and share updates side-by-side with your team in real time."
    },
    {
      id: "04",
      icon: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Finish Your Projects",
      description: "Review your final work together, track key outcomes, and complete your team goals on time."
    }
  ];

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900/40 py-24 sm:py-32 border-t border-border/40" id="HowItWorks">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header Layout Block */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <h2 className="text-base font-semibold uppercase tracking-wider text-green-600 dark:text-blue-400">
            Simple Setup
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Get started in just four steps.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We removed the confusing options so you and your team can focus entirely on everyday work and collaboration.
          </p>
        </div>

        {/* Step Timeline Layout */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
          
          {/* Subtle connecting path line for desktop screens */}
          <div className="hidden lg:block absolute top-[2.25rem] left-[10%] right-[10%] h-[1px] bg-border -z-10" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              
              {/* Top Step Number Label Badge */}
              <div className="absolute -top-4 bg-background border border-border text-[10px] font-bold tracking-widest text-muted-foreground px-2 py-0.5 rounded-full shadow-sm">
                STEP {step.id}
              </div>

              {/* Icon Container Sphere */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-border transition-all duration-300 group-hover:border-green-500 group-hover:shadow-md mt-2">
                {step.icon}
              </div>

              {/* Text Layout Stack */}
              <div className="mt-6">
                <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
