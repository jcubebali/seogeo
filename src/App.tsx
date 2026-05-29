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
  X,
  AlertCircle
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
import { useLanguage } from "./contexts/LanguageContext";

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [auditResult, setAuditResult] = useState<FullAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAudit = async (data: AuditFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setProgress(5);
    setProgressText(t("fetchingPage"));
    setAuditResult(null);

    const competitorUrls = data.competitors?.map(c => c.url).filter(url => url && url.trim() !== "") || [];

    // Step-by-step progress indicator
    let currentStep = 0;
    const progressSteps = [
      { p: 15, t: t("fetchingPage") },
      { p: 35, t: t("analyzingSeo") },
      { p: 55, t: t("analyzingGeo") },
      { p: 75, t: t("runningAi") },
      { p: 92, t: t("comparingCompetitors") }
    ];

    const timer = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep].p);
        setProgressText(progressSteps[currentStep].t);
        currentStep++;
      }
    }, 1800);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, competitors: competitorUrls, lang: language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server returned a crawl block or internal error.");
      }
      
      const result = await response.json();
      clearInterval(timer);
      setProgress(100);
      setAuditResult(result);
      setActiveTab("results");
    } catch (error: any) {
      clearInterval(timer);
      console.error("Audit failed", error);
      setErrorMsg(error.message || "An unexpected network or crawler timeout occurred. Some websites block external requests.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300`}>
        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isMobile ? (isSidebarOpen ? 240 : 0) : (isSidebarOpen ? 240 : 80),
            paddingLeft: isMobile && !isSidebarOpen ? 0 : 12,
            paddingRight: isMobile && !isSidebarOpen ? 0 : 12,
          }}
          className={`fixed md:relative inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-card shadow-sm overflow-hidden ${
            isMobile && !isSidebarOpen ? "pointer-events-none border-r-0" : "px-3"
          }`}
        >
          <div className="flex h-16 items-center px-3 border-b border-[#27272a] gap-3 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0">A+</div>
            {(isSidebarOpen || (isMobile && isSidebarOpen)) && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold tracking-tight text-lg"
              >
                AUDITPRO <span className="text-blue-500">26</span>
              </motion.span>
            )}
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1">
              <SidebarItem 
                icon={<LayoutDashboard className="h-5 w-5" />} 
                label={t("dashboard")} 
                active={activeTab === "dashboard"} 
                onClick={() => { setActiveTab("dashboard"); if (isMobile) setIsSidebarOpen(false); }}
                collapsed={!isSidebarOpen && !isMobile}
              />
              <SidebarItem 
                icon={<PlusCircle className="h-5 w-5" />} 
                label={t("newAudit")} 
                active={activeTab === "new-audit"} 
                onClick={() => { setActiveTab("new-audit"); if (isMobile) setIsSidebarOpen(false); }}
                collapsed={!isSidebarOpen && !isMobile}
              />
              <SidebarItem 
                icon={<BarChart3 className="h-5 w-5" />} 
                label={t("competitorsTab")} 
                active={activeTab === "results"} 
                onClick={() => { if(auditResult) { setActiveTab("results"); if (isMobile) setIsSidebarOpen(false); } }}
                disabled={!auditResult}
                collapsed={!isSidebarOpen && !isMobile}
              />
              <SidebarItem 
                icon={<History className="h-5 w-5" />} 
                label={t("history")} 
                active={activeTab === "history"} 
                onClick={() => { setActiveTab("history"); if (isMobile) setIsSidebarOpen(false); }}
                collapsed={!isSidebarOpen && !isMobile}
              />
              <Separator className="my-4 mx-2" />
              <SidebarItem 
                icon={<Settings className="h-5 w-5" />} 
                label={t("settings")} 
                active={activeTab === "settings"} 
                onClick={() => { setActiveTab("settings"); if (isMobile) setIsSidebarOpen(false); }}
                collapsed={!isSidebarOpen && !isMobile}
              />
            </nav>
          </ScrollArea>

          <div className="py-4 border-t border-[#27272a] shrink-0">
            {isSidebarOpen && (
              <div className="bg-zinc-800 rounded-lg p-3 mb-4 transition-all">
                <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-widest font-bold">{t("activePlan")}</div>
                <div className="text-sm font-medium">{t("enterprisePlan")}</div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="w-full justify-start px-2 hover:bg-[#27272a] hover:text-white text-zinc-400">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">{isDarkMode ? t("lightMode") : t("darkMode")}</span>}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mt-1 w-full justify-start px-2 hover:bg-[#27272a] hover:text-white text-zinc-400">
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">{t("collapse")}</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-auto bg-[#09090b]">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#27272a] bg-[#09090b] px-4 md:px-8 shrink-0">
            <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-2xl">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="text-zinc-400 hover:text-white mr-1 h-9 w-9 shrink-0 flex items-center justify-center border border-zinc-800 bg-zinc-900"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div className="relative flex-1 hidden md:block">
                <Input 
                  placeholder={t("analyzeNewUrl")} 
                  className="w-full bg-[#18181b] border-[#27272a] h-9 text-sm focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                 <span className="text-xs text-zinc-500 uppercase font-bold tracking-tighter hidden sm:inline">vs</span>
                 <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">BG</div>
                   <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">PB</div>
                 </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 text-xs sm:text-sm font-semibold h-9 shrink-0">{t("runAudit")}</Button>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Language Toggle: EN vs ID */}
              <div className="flex bg-zinc-900 border border-zinc-805 rounded-xl p-0.5 shrink-0" id="lang-switcher">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    language === "en" 
                      ? "bg-blue-600 text-white shadow-md font-black" 
                      : "text-zinc-500 hover:text-zinc-300 bg-transparent"
                  }`}
                  id="lang-en"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("id")}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    language === "id" 
                      ? "bg-blue-600 text-white shadow-md font-black" 
                      : "text-zinc-500 hover:text-zinc-300 bg-transparent"
                  }`}
                  id="lang-id"
                >
                  ID
                </button>
              </div>

              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{t("lastScan")}</span>
                <span className="text-xs text-zinc-300 font-medium">{t("minsAgo")}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-[#27272a]">
                <span className="text-xs font-semibold text-white">JD</span>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-950/45 border border-red-500/25 rounded-2xl max-w-2xl flex items-start gap-4"
              >
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-red-400">{t("errorBlocked")}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {errorMsg}
                  </p>
                  <div className="pt-2 flex gap-3">
                    <Button size="sm" variant="outline" className="border-red-500/20 bg-red-500/5 text-red-405 hover:bg-red-500/10 text-xs font-bold" onClick={() => setErrorMsg(null)}>
                      {t("dismiss")}
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold" onClick={() => { setErrorMsg(null); setActiveTab("dashboard"); }}>
                      {t("backToDashboard")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
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
                  <h3 className="text-2xl font-bold mb-2">{t("noAuditsTitle")}</h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    {t("noAuditsDesc")}
                  </p>
                  <Button onClick={() => setActiveTab("dashboard")}>
                    {t("backToDashboard")}
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
