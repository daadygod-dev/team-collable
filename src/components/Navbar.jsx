import { useState } from "react";
// FIX 1: Added ArrowRight to the icon package import destructuring layout
import { Menu, X, ArrowRight } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { HashLink } from "react-router-hash-link"; 
import { Link as RouterLink } from "react-router-dom"; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/#Hero" },
    { name: "Features", href: "/#Features" },
    { name: "HowItWorks", href: "/#HowItWorks" },
    { name: "Support", href: "/#Supports" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1">
          
          {/* Logo Section */}
          <div className="hrink-0 flex items-center gap-0.5">
            <img src="/logo.png" width={40} height={40} alt="Logo" className="object-contain my-auto" />
            <span className="text-md font-extrabold tracking-tight text-foreground">
              Team<span className="text-blue-600">Collable</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {links.map((link) => (
              <HashLink
                smooth
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors dark:text-zinc-400 dark:hover:text-white"
              >
                {link.name}
              </HashLink>
            ))}
          </div>

          {/* Desktop Call to Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <RouterLink to="/signin" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="cursor-pointer">Sign In</Button>
            </RouterLink>
            <RouterLink to="/signup" onClick={() => setIsOpen(false)}>
            <Button size="sm" className="bg-linear-to-r from-blue-600 cursor-pointer via-indigo-500 to-purple-600 text-white ">Get Started</Button>
            </RouterLink>
            
          </div>

          {/* Mobile Hamburguer Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-600 hover:text-zinc-900 focus:outline-none dark:text-zinc-400 dark:hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel Panel */}
      {isOpen && (
        <div className="md:hidden   bg-white/80 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-3 shadow-lg dark:bg-zinc-950 rounded-b-lg">
          <div className="space-y-1">
            {links.map((link) => (
              <HashLink
                smooth
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)} 
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                {link.name}
              </HashLink>
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-2">
              <RouterLink to="/signin" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full justify-center">Sign In</Button>
            </RouterLink>
            
            {/* Safe standard client router routing redirect block */}
            <RouterLink to="/signup" onClick={() => setIsOpen(false)}>
              <Button size="lg" className="h-12 w-full px-6 text-sm font-medium gap-2 bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 text-white border-0">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RouterLink>
          </div>
        </div>
      )}
    </nav>
  );
}
