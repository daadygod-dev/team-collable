import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Support from "@/components/Support";
import Footer from "@/components/Footer";

function App() {
  return (
    
      
      
    
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 gap-10">
      <Navbar />
      <main>
        <Hero />
        <Features />)
        <HowItWorks />
        <Support />
      </main>

      {/* Structural Base Base */}
      <Footer />
      
    </div>
  );
}

export default App;
