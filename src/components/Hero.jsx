import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HashLink as Link } from "react-router-hash-link";


export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-24 sm:pt-40 sm:pb-32" id="Hero">
      {/* Premium Ambient Background Glows */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 blur-[120px] dark:opacity-20">
        <div className="aspect-square w-[500px] rounded-full bg-gradient-to-tr from-blue-600 to-purple-500" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
        {/* Animated Badge Feature */}
        <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-green-600/50 bg-muted/60 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            New Revolution of Collaboration
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.15]">
          Stop wasting time <br />
          <span className="bg-linear-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] bg-clip-text text-transparent">
            hunting for information.
          </span>
        </h1>

        {/* Clear, High-Value Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
          Quit jumping between dozens of tabs just to get your daily work done. Bring your
          team’s tasks, company docs, and project files into one clean, central workspace.
        </p>



        {/* Responsive Dual Action Call To Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className=""
          >
            <Button size="lg" className="h-12  px-6 text-sm font-medium sm:w-auto gap-2 bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#14532D] cursor-pointer rounded-full">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="h-12 w-full px-6 text-sm font-medium sm:w-auto cursor-pointer rounded-full">
            <Link
              to="#HowItWorks"
              smooth
            >
              See how it works
            </Link>

          </Button>
        </div>

        {/* Subtle Bottom Trust Metadata */}
        <div className="mt-16 border-t border-border/60 pt-8">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
            Trusted by modern product developers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
