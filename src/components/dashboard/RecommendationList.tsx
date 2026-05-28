import { 
  AlertCircle, 
  ArrowRight, 
  ChevronDown, 
  Code2, 
  Copy, 
  ExternalLink, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Recommendation } from "@/types";

export default function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "Critical": return <span className="px-1.5 py-0.5 bg-red-500 text-[9px] font-bold rounded uppercase text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]">CRITICAL</span>;
      case "High": return <span className="px-1.5 py-0.5 bg-amber-500 text-[9px] font-bold rounded uppercase text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]">HIGH</span>;
      case "Medium": return <span className="px-1.5 py-0.5 bg-blue-500 text-[9px] font-bold rounded uppercase text-white">MEDIUM</span>;
      default: return <span className="px-1.5 py-0.5 bg-zinc-600 text-[9px] font-bold rounded uppercase text-white">FIX</span>;
    }
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case "Critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "High": return <Zap className="h-4 w-4 text-amber-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBg = (p: string) => {
    switch (p) {
      case "Critical": return "bg-red-500/5 border-red-500/20";
      case "High": return "bg-amber-500/5 border-amber-500/20";
      case "Medium": return "bg-blue-500/5 border-blue-500/20";
      default: return "bg-zinc-500/5 border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-8 bg-[#18181b] p-6 rounded-2xl border border-[#27272a]">
        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-1">Optimization Roadmap</h3>
          <p className="text-xl font-bold tracking-tight">Fixes to Dominate Generative Search</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {recommendations.map((rec, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className={`border rounded-xl overflow-hidden transition-all duration-300 ${getPriorityBg(rec.priority)}`}>
            <AccordionTrigger className="hover:no-underline px-6 py-5">
              <div className="flex items-center gap-4 text-left w-full">
                <div className="shrink-0 p-2 rounded-lg bg-[#09090b]/50 border border-white/5">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-base tracking-tight">{rec.title}</span>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium line-clamp-1 truncate uppercase tracking-tighter">Impact: Competition Gap Mitigation</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                      <ArrowRight className="h-3 w-3" /> The Issue
                    </h5>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                      {rec.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-blue-500">
                      <CheckCircle2 className="h-3 w-3" /> Targeted Action
                    </h5>
                    <p className="font-semibold text-sm leading-relaxed p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 text-blue-400">
                      {rec.action}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="h-9 border-[#27272a] bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase tracking-tight">
                      <ExternalLink className="h-3 w-3 mr-2" /> Docs
                    </Button>
                    <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-xs font-bold uppercase tracking-tight shadow-lg shadow-blue-900/20">
                      Mark as Fixed
                    </Button>
                  </div>
                </div>

                {rec.code && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                        <Code2 className="h-3 w-3" /> Implementation
                      </h5>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] gap-1.5 font-bold uppercase tracking-widest hover:bg-white/5 text-zinc-500">
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                    <Card className="bg-[#09090b] border border-[#27272a] shadow-2xl relative overflow-hidden group">
                      <CardContent className="p-0">
                        <pre className="p-5 overflow-x-auto text-[11px] font-mono leading-relaxed text-blue-300">
                          <code>{rec.code}</code>
                        </pre>
                      </CardContent>
                    </Card>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-2">
                      Injected via System Prompts & Knowledge Graphs
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
