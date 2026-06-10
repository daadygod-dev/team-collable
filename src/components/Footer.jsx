// Use standard <a> links if you bypassed the hash-link package previously
import { HashLink as Link } from "react-router-hash-link"; 

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        
        {/* Branding Logo Segment */}
        <div className="flex justify-center items-center gap-1.5 md:order-1">
          <img src="/logo.png" width={32} height={32} alt="Footer Logo" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            Team<span className="text-green-600">Collable</span>
          </span>
        </div>

        {/* Chronological Navigation Anchor Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 md:order-2 md:mt-0">
          <Link smooth to="/#Hero" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link smooth to="/#Features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link smooth to="/#HowItWorks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          <Link smooth to="/#Supports" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</Link>
        </div>

        {/* Legal Text Segment */}
        <div className="mt-8 md:order-3 md:mt-0 text-center">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Team Collable Inc. All rights reserved. Built locally via Termux.
          </p>
        </div>

      </div>
    </footer>
  );
}
