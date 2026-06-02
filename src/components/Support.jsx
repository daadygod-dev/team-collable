import { LifeBuoy, MessageSquare, ArrowUpRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Support() {
  const faqs = [
    {
      q: "Does Team Collable synchronize with local mobile code workspaces?",
      a: "Yes. Using our secure initialization scripts, you can hook active Termux terminal compilation flags or Acode workspace loops directly into your team's live review dashboard streams."
    },
    {
      q: "How safe is our project's data storage?",
      a: "We utilize sandboxed workspace configurations along with isolated database routing mechanisms to ensure your files, components, and environment configs remain strictly secure."
    }
  ];

  return (
    <section id="Supports" className="bg-background py-24 sm:py-32 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Help Desk & Knowledge Base
          </h2>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            We are here to support your pipeline.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Quick Contact Cards */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <LifeBuoy className="h-6 w-6 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground">24/7 Developer Support</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Stuck on a configuration, build script, or git merge branch? Chat with an integration engineer instantly.
              </p>
              <Button className="mt-4 w-full gap-2 text-xs" variant="outline">
                Open Support Ticket <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <MessageSquare className="h-6 w-6 text-purple-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground">Community Chat</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Join other mobile developers and remote engineering leads configuring workspaces directly out of portable stacks.
              </p>
            </div>
          </div>

          {/* Clean FAQ Block */}
          <div className="lg:col-span-2 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-border bg-muted/30 p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-base font-bold text-foreground">{faq.q}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
