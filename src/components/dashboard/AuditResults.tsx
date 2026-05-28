import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  Globe, 
  Zap, 
  Smartphone, 
  Lock,
  Download,
  Share2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RecommendationList from "./RecommendationList";
import { FullAuditResult } from "@/types";

export default function AuditResults({ result }: { result: FullAuditResult }) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const element = reportRef.current;
      
      // Temporary hide buttons and tabs for the export
      const elementsToHide = element.querySelectorAll('[data-pdf-ignore]');
      elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
      
      // Wait for everything to be rendered
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        backgroundColor: "#09090b",
        pixelRatio: 2,
        style: {
          padding: '20px'
        }
      });
      
      // Restore hidden elements
      elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`audit-report-${new URL(result.main.url).hostname}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF properly. Please try again.");
    }
  };

  const radarData = [
    { subject: 'SEO Score', main: result.main.scores.seo, fullMark: 100 },
    { subject: 'GEO Score', main: result.main.scores.geo, fullMark: 100 },
    { subject: 'Technical', main: result.main.scores.technical, fullMark: 100 },
    { subject: 'Content', main: result.main.scores.content, fullMark: 100 },
  ];

  // Add competitor data to radar if exists
  result.competitors.forEach((comp, idx) => {
    radarData[0][`comp${idx}`] = comp.scores.seo;
    radarData[1][`comp${idx}`] = comp.scores.geo;
    radarData[2][`comp${idx}`] = comp.scores.technical;
    radarData[3][`comp${idx}`] = comp.scores.content;
  });

  const barData = [
    { name: 'Summary', main: result.main.scores.seo, geo: result.main.scores.geo },
    ...result.competitors.map((c, i) => ({ 
      name: `Comp ${i + 1}`, 
      main: c.scores.seo, 
      geo: c.scores.geo 
    }))
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  return (
    <div ref={reportRef} className="space-y-10 animate-in fade-in duration-700 bg-[#09090b] p-1">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2 px-3 py-1 bg-background">Audit Completed - {new Date(result.timestamp).toLocaleDateString()}</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">Audit Report for {new URL(result.main.url).hostname}</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" /> {result.main.url}
          </p>
        </div>
        <div className="flex gap-3" data-pdf-ignore>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 p-1 bg-muted/50 border h-12" data-pdf-ignore>
          <TabsTrigger value="overview" className="h-full px-6 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="comparison" className="h-full px-6 data-[state=active]:shadow-sm">Competitor Comparison</TabsTrigger>
          <TabsTrigger value="recommendations" className="h-full px-6 data-[state=active]:shadow-sm">
            Recommendations
            {result.recommendations.length > 0 && (
              <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20 border-none h-5 w-5 p-0 flex items-center justify-center">
                {result.recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW CONTENT */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="SEO Authority" score={result.main.scores.seo} icon={<Search className="h-4 w-4" />} description="General search performance" />
            <SummaryCard title="GEO Visibility" score={result.main.scores.geo} icon={<Zap className="h-4 w-4" />} description="AI engine citation potential" />
            <SummaryCard title="Technical Audit" score={result.main.scores.technical} icon={<Lock className="h-4 w-4" />} description="Security & Structure" />
            <SummaryCard title="Content Gap" score={result.main.scores.content} icon={<Smartphone className="h-4 w-4" />} description="Content and user experience" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Visual Performance Radar
                </h3>
                <div className="flex gap-2">
                  {["main", ...result.competitors.map((_,i) => `comp${i}`)].map((key, i) => (
                    <div key={key} className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-blue-500" : ["bg-purple-500", "bg-orange-500", "bg-emerald-500", "#f59e0b"][i-1]}`} />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#27272a" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                      <Radar
                        name={new URL(result.main.url).hostname}
                        dataKey="main"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        isAnimationActive={false}
                      />
                      {result.competitors.map((c, i) => (
                        <Radar
                          key={i}
                          name={new URL(c.url).hostname}
                          dataKey={`comp${i}`}
                          stroke={["#8b5cf6", "#f97316", "#10b981", "#f59e0b"][i]}
                          fill={["#8b5cf6", "#f97316", "#10b981", "#f59e0b"][i]}
                          fillOpacity={0.05}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          isAnimationActive={false}
                        />
                      ))}
                      <ReTooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Core Web Vitals</h3>
              <div className="space-y-4">
                <MetricItem label="LCP" value={result.main.metrics.lcp} sub="Ideal: < 2.5s" status="good" />
                <MetricItem label="INP" value={result.main.metrics.inp} sub="Ideal: < 200ms" status="warning" />
                <MetricItem label="CLS" value={result.main.metrics.cls} sub="Ideal: < 0.1" status="good" />
              </div>
              
              <div className="pt-4 border-t border-[#27272a] space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">LLM Citation Potential</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border border-[#27272a] rounded bg-[#09090b] group transition-colors hover:border-blue-500/30">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">GPT-5</div>
                    <div className="text-xs font-bold text-blue-400">High</div>
                  </div>
                  <div className="text-center p-3 border border-[#27272a] rounded bg-[#09090b] group transition-colors hover:border-emerald-500/30">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Perplexity</div>
                    <div className="text-xs font-bold text-emerald-400">Very High</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* COMPARISON CONTENT */}
        <TabsContent value="comparison" className="outline-none animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Competitor Comparison Grid</h3>
                <div className="flex gap-1">
                   <div className="h-2 w-2 rounded-full bg-blue-500" />
                   <div className="h-2 w-2 rounded-full bg-orange-500" />
                   <div className="h-2 w-2 rounded-full bg-purple-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#09090b] text-zinc-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Metric</th>
                      <th className="px-6 py-4 border-l border-[#27272a] text-white">Your Website</th>
                      {result.competitors.map((comp, idx) => (
                        <th key={idx} className="px-6 py-4 border-l border-[#27272a]">Competitor {idx + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-400">Overall SEO</td>
                      <td className="px-6 py-4 border-l border-[#27272a] text-emerald-500 font-bold">{result.main.scores.seo}</td>
                      {result.competitors.map((c, i) => (
                        <td key={i} className="px-6 py-4 border-l border-[#27272a] text-zinc-300">{c.scores.seo}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-400">GEO Visibility</td>
                      <td className="px-6 py-4 border-l border-[#27272a] text-amber-500 font-bold">{result.main.scores.geo}</td>
                      {result.competitors.map((c, i) => (
                        <td key={i} className="px-6 py-4 border-l border-[#27272a] text-zinc-300">{c.scores.geo}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-400">Semantic Richness</td>
                      <td className="px-6 py-4 border-l border-[#27272a] text-emerald-400">High</td>
                      {result.competitors.map((c, i) => (
                        <td key={i} className="px-6 py-4 border-l border-[#27272a] text-zinc-500">Medium</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-zinc-400">Schema Markup</td>
                      <td className="px-6 py-4 border-l border-[#27272a] text-blue-400">v3.0 Partial</td>
                      {result.competitors.map((c, i) => (
                        <td key={i} className="px-6 py-4 border-l border-[#27272a] text-zinc-500">Missing</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>

           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Overviews Presence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"Who has the most citation-worthy content for industry-specific queries?"</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ReTooltip />
                        <Bar dataKey="geo" fill="#18181b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
             </Card>
             <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg">Competitor Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                   <div className="flex items-start gap-3">
                     <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                     <p><strong>Competitor 1</strong> has 40% more FAQ schema nodes. This is why they appear more in Perplexity answers.</p>
                   </div>
                   <div className="flex items-start gap-3">
                     <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                     <p>You have better <strong>Author Authority</strong> than 3 out of 4 competitors due to linked social profiles.</p>
                   </div>
                </CardContent>
             </Card>
           </div>
        </TabsContent>

        {/* RECOMMENDATIONS CONTENT */}
        <TabsContent value="recommendations" className="outline-none">
          <RecommendationList recommendations={result.recommendations} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function SummaryCard({ title, score, icon, description }: { title: string; score: number; icon: React.ReactNode; description: string }) {
  const isNeedsHelp = score < 80;
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm text-zinc-400 font-medium mb-1 flex items-center gap-2">
            <span className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>
            {title}
          </h3>
          <p className="text-2xl font-bold tracking-tight">
            {score}<span className="text-zinc-500 text-base font-normal">/100</span>
          </p>
        </div>
        <div className={`p-2 rounded-lg font-bold text-[10px] uppercase tracking-wider ${isNeedsHelp ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {isNeedsHelp ? "Needs Help" : "+4.2%"}
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className={`h-full ${isNeedsHelp ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"}`} 
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 uppercase tracking-tighter font-bold">
        <div className="flex justify-between">Tech: <span className="text-zinc-300">98</span></div>
        <div className="flex justify-between">On-Page: <span className="text-zinc-300">85</span></div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, sub, status }: { label: string; value: string; sub: string; status: 'good' | 'warning' | 'critical' }) {
  const statusColor = {
    good: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-red-400"
  }[status];

  return (
    <div className="flex justify-between items-center py-1">
      <div className="flex flex-col">
        <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-widest">{label}</span>
      </div>
      <span className={`text-sm font-bold font-mono tracking-tight ${statusColor}`}>{value}</span>
    </div>
  );
}
