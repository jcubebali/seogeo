import React, { useState, useEffect, ReactNode } from "react";
import { 
  BarChart3, 
  Search, 
  History, 
  Settings, 
  LayoutDashboard, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  Globe,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuditForm from "@/components/dashboard/AuditForm";
import AuditResults from "@/components/dashboard/AuditResults";
import { FullAuditResult, AuditFormValues } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleRunAudit = async (data: AuditFormValues) => {
    setIsLoading(true);
    setProgress(5);
    setProgressText("Initializing Crawler...");
    setAuditResult(null);

    const competitorUrls = data.competitors.map(c => c.url).filter(url => url.trim() !== "");

    // Simulate progress
    const steps = [
      { p: 20, t: "Fetching technical SEO data..." },
      { p: 40, t: "Analyzing content & On-Page structure..." },
      { p: 60, t: "Checking GEO Visibility & AI Citation Potential..." },
      { p: 80, t: "Running Competitor Comparison..." },
      { p: 95, t: "Generating Actionable Recommendations..." },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setProgress(step.p);
      setProgressText(step.t);
    }

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, competitors: competitorUrls }),
      });
      const result = await response.json();
      setAuditResult(result);
      setActiveTab("results");
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300`}>
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 240 : 80 }}
          className="relative z-20 flex h-full flex-col border-r bg-card shadow-sm"
        >
          <div className="flex h-16 items-center px-6 border-b border-[#27272a] gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0">A+</div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold tracking-tight text-lg"
              >
                AUDITPRO <span className="text-blue-500">26</span>
              </motion.span>
            )}
          </div>
          
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                label="Dashboard" 
                active={activeTab === "dashboard"} 
                onClick={() => setActiveTab("dashboard")}
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<PlusCircle className="h-5 w-5" />} 
                label="New Audit" 
                active={activeTab === "new-audit"} 
                onClick={() => setActiveTab("new-audit")}
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<BarChart3 className="h-5 w-5" />} 
                label="Competitors" 
                active={activeTab === "results"} 
                onClick={() => { if(auditResult) setActiveTab("results") }}
                disabled={!auditResult}
                collapsed={!isSidebarOpen}
              />
              <SidebarItem 
                icon={<History className="h-5 w-5" />} 
                label="History" 
                active={activeTab === "history"} 
                onClick={() => setActiveTab("history")}
                collapsed={!isSidebarOpen}
              />
              <Separator className="my-4 mx-2" />
              <SidebarItem 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                active={activeTab === "settings"} 
                onClick={() => setActiveTab("settings")}
                collapsed={!isSidebarOpen}
              />
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-[#27272a]">
            {isSidebarOpen && (
              <div className="bg-zinc-800 rounded-lg p-3 mb-4 transition-all">
                <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-widest font-bold">Plan</div>
                <div className="text-sm font-medium">Enterprise Pro v15</div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="w-full justify-start px-2 hover:bg-[#27272a] hover:text-white text-zinc-400">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mt-1 w-full justify-start px-2 hover:bg-[#27272a] hover:text-white text-zinc-400">
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">Collapse</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-auto bg-[#09090b]">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#27272a] bg-[#09090b] px-8 shrink-0">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1 hidden md:block">
                <Input 
                  placeholder="Analyze new URL..." 
                  className="w-full bg-[#18181b] border-[#27272a] h-9 text-sm focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">vs</span>
                 <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">BG</div>
                   <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">PB</div>
                 </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-6">Run Audit</Button>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Last Scan</span>
                <span className="text-xs text-zinc-300 font-medium">2 mins ago</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-[#27272a]">
                <span className="text-xs font-semibold text-white">JD</span>
              </div>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingState progress={progress} text={progressText} />
              ) : activeTab === "dashboard" || activeTab === "new-audit" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AuditForm onSubmit={handleRunAudit} />
                </motion.div>
              ) : activeTab === "results" && auditResult ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AuditResults result={auditResult} />
                </motion.div>
              ) : (
                <div key="empty" className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 opacity-20" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No audits yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Start by entering your URL and competitor URLs on the dashboard to get a full SEO & GEO report.
                  </p>
                  <Button onClick={() => setActiveTab("dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  disabled = false,
  collapsed = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
  disabled?: boolean;
  collapsed?: boolean;
}) {
  const styles = `
    flex h-10 w-full items-center rounded-lg px-3 transition-all duration-200
    ${active ? "bg-[#27272a] text-white shadow-sm" : "text-zinc-400 hover:bg-[#27272a] hover:text-white"}
    ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
    ${collapsed ? "justify-center" : "justify-start"}
  `;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger 
          disabled={disabled}
          onClick={onClick}
          className={styles}
        >
          <div className="shrink-0">{icon}</div>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={styles}
    >
      <div className="shrink-0">{icon}</div>
      <span className="ml-3 text-sm font-medium transition-opacity duration-300">
        {label}
      </span>
      {active && (
        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
      )}
    </button>
  );
}

function LoadingState({ progress, text }: { progress: number; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-12">
        <motion.div 
          className="h-32 w-32 rounded-full border-4 border-muted flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="h-10 w-10 text-primary animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4">Analyzing Your Digital Presence</h3>
      <p className="text-muted-foreground mb-8 animate-pulse font-mono tet-sm">{text}</p>
      <div className="w-full max-w-md space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <StatusCard icon={<Globe className="h-4 w-4" />} label="Technical" active={progress > 20} />
        <StatusCard icon={<Search className="h-4 w-4" />} label="On-Page" active={progress > 40} />
        <StatusCard icon={<Zap className="h-4 w-4" />} label="GEO Audit" active={progress > 60} />
        <StatusCard icon={<ShieldCheck className="h-4 w-4" />} label="Competitors" active={progress > 80} />
      </div>
    </div>
  );
}

function StatusCard({ icon, label, active }: { icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-500 ${active ? "bg-background border-primary/20 shadow-sm" : "opacity-30"}`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${active ? "bg-primary/10 text-primary" : "bg-muted"}`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
