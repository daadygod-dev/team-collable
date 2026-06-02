import { Download, Users, Code2, Rocket } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Initialize Your Workspace",
      description: "Connect your local environment or Termux terminal using our single-line initialization command script."
    },
    {
      id: "02",
      icon: <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: "Invite Your Engineering Squad",
      description: "Generate a secure, encrypted workspace link to instantly bring developers and product managers into your sandbox room."
    },
    {
      id: "03",
      icon: <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Build and Pair Synchronously",
      description: "Write code together with multiplayer editing streams, synchronized staging buffers, and real-time cursor tracking."
    },
    {
      id: "04",
      icon: <Rocket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Ship to Global Edge Routers",
      description: "Review test logs together and push builds directly to production edge environments with built-in pipeline hooks."
    }
  ];

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900/40 py-24 sm:py-32 border-t border-border/40" id="HowItWorks">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header Layout Block */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <h2 className="text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Frictionless Integration
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            From setup to shipping in minutes.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We stripped away the configuration clutter so you can focus entirely on your code, assets, and collaboration framework.
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-border transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-md mt-2">
                {step.icon}
              </div>

              {/* Text Layout Stack */}
              <div className="mt-6">
                <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
