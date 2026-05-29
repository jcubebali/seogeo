import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Share2,
  Copy,
  Check,
  Code,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Shield,
  Layers,
  Award
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FullAuditResult, ScoreCategoryBreakdown } from "../../types";
import { useLanguage } from "@/contexts/LanguageContext";

const translateAiText = (text: string, lang: string) => {
  if (lang !== "id") return text;
  if (!text) return text;
  
  const trimmed = text.trim();

  // 1. Check exact match dictionaries first
  const dict: Record<string, string> = {
    // Executive summary and main fallbacks
    "The page was crawled successfully. Advanced AI engine is currently highly requested and busy. Using optimized baseline parameters to formulate key score elements.":
      "Halaman berhasil dirayapi. Mesin kecerdasan buatan tingkat lanjut saat ini sangat padat dan sibuk. Menggunakan rincian parameter dasar yang dioptimalkan untuk memformulasikan elemen nilai utama.",
    "Advanced gaps analysis requires a quiet API channel":
      "Analisis celah lanjutan membutuhkan saluran API yang tenang",
    "Competitors were evaluated algorithmically in the chart dashboard above.":
      "Kompetitor dievaluasi secara algoritmik dalam bagan dasbor di atas.",

    // Strengths
    "Presence of HTML document title structure":
      "Keberadaan struktur judul dokumen HTML",
    "Uses secure HTTPS connection protocols":
      "Menggunakan protokol enkripsi koneksi HTTPS yang aman",
    "Target crawled within timeout constraints":
      "Target dirayapi dalam batas waktu yang ditentukan",
    "HTML document parsed":
      "Dokumen HTML berhasil diurai",
    "Crawl response received":
      "Respons perayapan halaman diterima",

    // Offline AI fallbacks
    "Generative Recommendation Agent Busy":
      "Agen Rekomendasi Generatif Sedang Sibuk",
    "The audit system completed physical validation but generative content suggests high API congestion right now.":
      "Sistem audit berhasil melakukan validasi fisik tetapi konten generatif mendeteksi kemacetan API yang tinggi saat ini.",
    "This is a temporary third-party API limit. Please submit another audit in a few moments.":
      "Ini adalah batasan sementara API pihak ketiga. Harap ajukan audit baru dalam beberapa saat.",
    "Analisis celah lanjutan membutuhkan saluran API yang tenang":
      "Analisis celah lanjutan membutuhkan saluran API yang tenang",

    // FAQs fallback
    "What are the main services listed?":
      "Apa saja layanan utama yang terdaftar?",
    "How can we optimize headings for AI search?":
      "Bagaimana kita bisa mengoptimalkan judul untuk pencarian AI?",
    "Why are schema markup structures useful?":
      "Mengapa struktur markup skema itu berguna?",
    "Why is structured schema markup useful?":
      "Mengapa markup skema terstruktur itu berguna?",

    // Schema
    "Generic schema recommendation produced via offline algorithmic framework.":
      "Rekomendasi skema generik yang dihasilkan melalui kerangka kerja algoritmik offline.",
    "FAQPage": "FAQPage",

    // Metric badges
    "Optimized": "Dioptimalkan",
    "Attention Needed": "Butuh Perhatian",
    "Healthy": "Sehat",
    "Failed Verification": "Verifikasi Gagal",

    // Traditional SEO Categories
    "Title Tag": "Tag Judul",
    "Meta Description": "Deskripsi Meta",
    "Heading Structure": "Struktur Judul (Heading)",
    "Image Alt Text": "Teks Alternatif (Alt) Gambar",
    "Internal Links": "Tautan Internal",
    "Schema Markup": "Markup Skema",
    "Open Graph Protocols": "Protokol Open Graph",
    "HTTPS Secure Connection": "Koneksi Aman HTTPS",
    "Canonical Tag": "Tag Kanonikal",
    "Robots Directives": "Petunjuk Robots",

    // GEO Categories
    "Q&A Structure": "Struktur Tanya-Jawab",
    "Direct Answer Potential": "Potensi Jawaban Langsung",
    "Authority & Expertise Signals": "Sinyal Otoritas & Keahlian",
    "Structured Data Richness": "Kekayaan Data Terstruktur",
    "Citation-Friendly Layout": "Tata Letak Ramah Kutipan",
    "Information Freshness": "Kekinian Informasi",

    // Technical SEO Categories
    "HTTPS Secure Encryption": "Enkripsi Aman HTTPS",
    "Connection Status Response": "Respons Status Koneksi",
    "Page Load Velocity": "Kecepatan Muat Halaman",
    "Viewport Mobile Support": "Dukungan Viewport Seluler",
    "Canonical Integrity": "Integritas Kanonikal",
    "Robots Crawler Policy": "Kebijakan Perayap Robots",
    "OG Thumbnail Visuals": "Visual Gambar Mini OG",

    // General messages
    "Title tag is missing.": "Tag judul tidak ditemukan atau kosong.",
    "Meta description is missing.": "Deskripsi meta tidak ditemukan atau kosong.",
    "Missing H1 heading. Every page should have exactly one main H1 tag.": "Tag H1 tidak ditemukan. Setiap halaman harus memiliki tepat satu tag H1 utama.",
    "H1 is present but no H2 sub-headlines were found. It is highly recommended to structure your content using H2 or H3 titles.":
      "Tag H1 ditemukan tetapi tidak ada sub-judul H2 yang ditemukan. Sangat disarankan untuk mendistribusikan konten Anda menggunakan judul H2 atau H3.",
    "No images present, perfect scoring given": "Tidak ada gambar di halaman ini, poin penuh diberikan.",
    "No internal links found on this page. Adding internal links helps distribute ranking authority and aids user site navigation.":
      "Tidak ada tautan internal di halaman ini. Menambahkan tautan internal membantu mendistribusikan otoritas peringkat dan memandu pengguna dalam menjelajah.",
    "No schema structured data (JSON-LD) detected. Structured data is vital for rich search results.":
      "Tidak ada skema data terstruktur (JSON-LD) terdeteksi. Data terstruktur sangat berguna untuk memunculkan hasil mading kaya di mesin pencari.",
    "The website does not use secure HTTPS protocol. Search engines prioritize secure URLs.":
      "Situs web tidak menggunakan protokol HTTPS yang aman. Mesin pencari memprioritaskan alamat web yang terlindungi SSL.",
    "Canonical tag rel=\"canonical\" is missing. This causes duplication issue vulnerability.":
      "Tag kanonikal rel=\"canonical\" tidak dideklarasikan. Hal ini menyebabkan risiko kerentanan isu konten duplikat.",
    "Target contains robots config 'noindex'. This commands crawlers NOT to list this site in search indexes.":
      "Target mengandung konfigurasi robots 'noindex'. Ini menginstruksikan perayap untuk TIDAK mengindeks halaman ini.",
    "No question-and-answer structural signals detected (no question headings or FAQ schemas). AI search engines rely heavily on Q&A formatting to source answers.":
      "Tidak ada sinyal struktural tanya-jawab terdeteksi. Mesin pencari AI sangat bergantung pada format tanya-jawab untuk dijadikan sebagai kutipan jawaban langsung.",
    "No concise direct-answer paragraph formats found in the first 20 paragraphs. AI models look for clear definition pairs (e.g., 'X is Y' or 'To construct X...') to extract quick definitions.":
      "Tidak ada format paragraf jawaban langsung yang ringkas ditemukan dalam 20 paragraf pertama. Model AI mencari definisi yang jelas (misalnya 'X adalah Y') untuk jawaban cepat.",
    "No explicit author byline or Person schema markup. Credibility signals are crucial for search evaluation.":
      "Tidak ada informasi penulis atau markup skema Person secara jelas. Sinyal kredibilitas ditekankan untuk penilaian keandalan konten.",
    "No schema types detected. Structured catalogs are critical for direct model ingestion.":
      "Tidak ada tipe skema yang terdeteksi. Katalog terstruktur diprioritaskan oleh model AI.",
    "No numbered list `<ol>` tags detected. Numbered step indicators are frequently cited by engines for instruct sets.":
      "Tidak ada tag daftar bernomor `<ol>` terdeteksi. Instruksi langkah berurutan sering dikutip oleh mesin generatif.",
    "Low semantic highlighting (no bold words, dt lists, etc.). Highlighting key terminology boosts structural parsing.":
      "Penyorotan semantik rendah (tidak ada cetak tebal dll.). Menampilkan istilah penting akan meningkatkan parsing struktural.",
    "No clear TL;DR or summary headline found (H1/H2 with 'Summary', 'Conclusion', 'TLDR'). AI models highly value upfront synthetics.":
      "Tidak ditemukan ringkasan TL;DR atau sub-judul ringkasan (H1/H2 dengan kata 'Summary/Ringkasan/Kesimpulan'). Model AI sangat mengapresiasi ringkasan di awal.",
    "No published/modified metadata dates detected in OG tags or schema context. Engines prioritize clear freshness timestamps.":
      "Tidak ada tanggal pembaruan terdeteksi di tag OG atau skema. Mesin pencari memprioritaskan konten dengan stempel waktu terbaru.",
    "Secure connection (HTTPS) is not detected. Search engines and browsers restrict non-encrypted sites.":
      "Koneksi aman HTTPS tidak terdeteksi. Mesin pencari dan peramban membatasi akses ke situs yang tidak terenkripsi.",
    "No responsive viewport meta tag detected. This content is not ready for mobile optimization index frameworks.":
      "Tidak ada tag meta viewport yang responsif. Konten tidak siap untuk pengindeksan seluler.",
    "No canonical link meta declared on this page. Duplicated URLs risk dilution of organic index value.":
      "Tidak ada metadata tautan kanonikal di halaman ini. Halaman duplikat dapat menurunkan kredibilitas organik halaman asli.",
    "No canonical link meta declared on this page. Declared URLs protect against organic duplication issues.":
      "Tidak ada metadata tautan kanonikal di halaman ini. Menyertakan URL asli melindungi Anda dari sanksi konten duplikat.",
    "The page has 'noindex' specified in crawler meta instructions, completely blocking search results distribution.":
      "Halaman ini memasang aturan 'noindex' di instruksi crawler, sepenuhnya mematikan indeks jangkauan di mesin pencari.",
    "No Open Graph metadata image defined. Social previews will render without associated thumbnail previews.":
      "Gambar metadata Open Graph tidak disetel. Tampilan media sosial akan muncul tanpa pratinjau gambar miniatur."
  };

  if (dict[trimmed]) {
    return dict[trimmed];
  }

  // 2. Regex checks for dynamic patterns containing variable numbers, links, names
  
  // Title tag length
  let match = trimmed.match(/^Title tag is too short \((?<len>\d+) characters\)\. Recommended: 30-60 characters\./i);
  if (match) {
    return `Tag judul terlalu pendek (${match.groups?.len} karakter). Direkomendasikan: 30-60 karakter.`;
  }
  match = trimmed.match(/^Title tag is too long \((?<len>\d+) characters\)\. Recommended: 30-60 characters\./i);
  if (match) {
    return `Tag judul terlalu panjang (${match.groups?.len} karakter). Direkomendasikan: 30-60 karakter.`;
  }

  // Meta Description length
  match = trimmed.match(/^Meta description is too short \((?<len>\d+) characters\)\. Recommended: 120-160 characters\./i);
  if (match) {
    return `Deskripsi meta terlalu pendek (${match.groups?.len} karakter). Direkomendasikan: 120-160 karakter.`;
  }
  match = trimmed.match(/^Meta description is too long \((?<len>\d+) characters\)\. Recommended: 120-160 characters\./i);
  if (match) {
    return `Deskripsi meta terlalu panjang (${match.groups?.len} karakter). Direkomendasikan: 120-160 karakter.`;
  }

  // Multiple H1s
  match = trimmed.match(/^Multiple H1 headings detected \((?<count>\d+) found\)\. Recommended: exactly one H1 tag\./i);
  if (match) {
    return `Beberapa judul H1 terdeteksi (${match.groups?.count} ditemukan). Direkomendasikan: cukup satu tag H1 saja.`;
  }

  // Images and alt text missing counts
  match = trimmed.match(/^(?<missing>\d+) of (?<total>\d+) images are missing alternative 'alt' tags\./i);
  if (match) {
    return `${match.groups?.missing} dari ${match.groups?.total} gambar tidak memiliki tag alternatif 'alt'.`;
  }
  match = trimmed.match(/^Missing Alt \[(?<idx>\d+)\]:\s*(?<src>.+)/i);
  if (match) {
    return `Alt Hilang [${match.groups?.idx}]: ${match.groups?.src}`;
  }

  // Internal link low count
  match = trimmed.match(/^Low internal linking count \((?<count>\d+) found\)\. It is recommended to have at least 5 links for better navigation depth\./i);
  if (match) {
    return `Jumlah tautan internal minim (${match.groups?.count} ditemukan). Direkomendasikan setidaknya memiliki 5 tautan internal untuk navigasi yang memadai.`;
  }

  // Standard schemas types list
  match = trimmed.match(/^Standard schema markup type\(s\) discovered:\s*\((?<types>.*)\)\. Consider reinforcing with specialized models like FAQPage or Article for rich result optimization\./i);
  if (match) {
    return `Jenis skema dasar ditemukan: (${match.groups?.types}). Coba tingkatkan dengan tipe handal seperti FAQPage atau Article untuk merangsang hasil kaya.`;
  }

  // Missing OG list
  match = trimmed.match(/^Missing Open Graph tags:\s*(?<tags>.+)\. These are critical for social sharing optics\./i);
  if (match) {
    return `Tag Open Graph tidak lengkap: ${match.groups?.tags}. Penting untuk menunjang tampilan saat dibagikan.`;
  }

  // Question subheadings count
  match = trimmed.match(/^Found (?<count>\d+) question-like headlines in H2\/H3 tags\. Add an FAQPage JSON-LD schema to upgrade this category to maximum points\./i);
  if (match) {
    return `Ditemukan ${match.groups?.count} sub-judul bermuatan tanya di H2/H3. Tambahkan skema JSON-LD FAQPage untuk meningkatkan subskor kategori ini ke puncak.`;
  }

  // Direct definitions definitions
  match = trimmed.match(/^Discovered (?<count>\d+) direct definitions or micro-paragraphs \(<150 words\/chars\)\. Add more direct, high-impact answers near key questions to maximize GEO visibility\./i);
  if (match) {
    return `Menemukan ${match.groups?.count} paragraf definisi langsung (<150 kata/karakter). Tambahkan lebih banyak ringkasan tajam dekat pertanyaan pokok untuk visibilitas GEO optimal.`;
  }

  // Authority word counts
  match = trimmed.match(/^Low overall text density \((?<count>\d+) words\)\. Comprehensive guides over 1500 words generally achieve far better citation indexes\./i);
  if (match) {
    return `Otoritas membaca rendah (${match.groups?.count} kata). Teks rujukan komprehensif di atas 1500 kata lebih bersahabat dengan model bahasa raksasa.`;
  }

  // GEO Publisher schemas
  match = trimmed.match(/^No specialized publisher schemas \((?<schemas>.*)\) identified\. These schemas explicitly instruct LLMs about content types\./i);
  if (match) {
    return `Tidak ada kerangka skema spesifik (${match.groups?.schemas}) terdeteksi. Skema ini melatih model bahasa AI memahami bobot konten Anda secara akurat.`;
  }

  // Freshness temporal reference missing in title
  match = trimmed.match(/^No target year reference \((?<year>\d+)\) detected in URL or main title, representing potential loss of current-intent relevance signals\./i);
  if (match) {
    return `Referensi tahun target (${match.groups?.year}) tidak ditemukan di judul utama, yang dapat mengurangi indeks kesegaran untuk pencarian saat ini.`;
  }

  // HTTP status
  match = trimmed.match(/^Site returned HTTP Status (?<status>\d+)\. A healthy indexing requires HTTP status 200\./i);
  if (match) {
    return `Situs memberikan respons saksama HTTP ${match.groups?.status}. Sistem penjelajah menghendaki status 200 OK untuk optimalisasi jangkauan.`;
  }

  // Load time moderate
  match = trimmed.match(/^Page loaded in (?<time>\d+)ms\. This is moderate, but optimizing server response time under 1000ms is beneficial\./i);
  if (match) {
    return `Halaman tuntas dimuat dalam ${match.groups?.time}ms. Kecepatan ini tergolong normal, tetapi menguranginya ke bawah 1000ms akan menjadi kelebihan besar.`;
  }

  // Load time slow
  match = trimmed.match(/^Slow execution load time \((?<time>\d+)ms\)\. High TTFB latency can impair Core Web Vitals\./i);
  if (match) {
    return `Waktu muat lambat terdeteksi (${match.groups?.time}ms). Latensi TTFB yang lamban mengurangi Core Web Vitals.`;
  }

  // Load time exceptionally slow
  match = trimmed.match(/^Excessively slow load time detected \((?<time>\d+)ms\)\. High page weight is a bounce-rate hazard\./i);
  if (match) {
    return `Proses pemuatan halaman terindikasi teramat lambat (${match.groups?.time}ms). File terlalu besar berpotensi memperburuk rasio pentalan.`;
  }

  return text;
};

export default function AuditResults({ result }: { result: FullAuditResult }) {
  const { language, t } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
          padding: '24px'
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
      
      pdf.save(`seo-geo-audit-${new URL(result.main.url).hostname}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF properly. Please try again.");
    }
  };

  const handleCopyText = (text: string, isSchema: boolean, index: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (isSchema) {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } else if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Recharts Radar graph setup
  const radarData = [
    { subject: t("mainSeoScore"), main: result.main.seoScore.totalScore, fullMark: 100 },
    { subject: t("geoCitationScore"), main: result.main.geoScore.totalScore, fullMark: 100 },
    { subject: t("technicalHealth"), main: result.main.technicalScore.totalScore, fullMark: 100 }
  ];

  // Add competitor scores to radar chart
  result.competitors.forEach((comp, idx) => {
    radarData[0][`comp${idx}`] = comp.seoScore.totalScore;
    radarData[1][`comp${idx}`] = comp.geoScore.totalScore;
    radarData[2][`comp${idx}`] = comp.technicalScore.totalScore;
  });

  // Recharts Bar graph setup
  const barData = [
    { 
      name: t("yourWebsite"), 
      seo: result.main.seoScore.totalScore, 
      geo: result.main.geoScore.totalScore, 
      tech: result.main.technicalScore.totalScore 
    },
    ...result.competitors.map((comp, idx) => ({
      name: `${t("competitorsTab")} ${idx + 1}`,
      seo: comp.seoScore.totalScore,
      geo: comp.geoScore.totalScore,
      tech: comp.technicalScore.totalScore
    }))
  ];

  // Sorting issues by critical severity first
  const severityRank = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
  const sortedIssues = [...result.aiAnalysis.criticalIssues].sort((a, b) => {
    return (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
  });

  const getSeverityBadge = (severity: "Critical" | "High" | "Medium" | "Low") => {
    switch (severity) {
      case "Critical":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20 font-bold uppercase tracking-wider text-[10px]">{t("critical")}</Badge>;
      case "High":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">{t("high")}</Badge>;
      case "Medium":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 border-blue-500/20 font-bold uppercase tracking-wider text-[10px]">{t("medium")}</Badge>;
      case "Low":
        return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/10 border-zinc-500/20 font-bold uppercase tracking-wider text-[10px]">{t("low")}</Badge>;
    }
  };

  return (
    <div ref={reportRef} className="space-y-10 animate-in fade-in duration-700 bg-[#09090b] text-zinc-100 p-1">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div className="space-y-2 max-w-full">
          <Badge className="px-3 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/10 border-blue-500/20 font-bold uppercase tracking-wider text-[10px]">
            {t("auditComplete")} - {new Date(result.timestamp).toLocaleDateString()}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight break-all sm:break-words">{t("resultsFor")} {new URL(result.main.url).hostname}</h2>
          <p className="text-zinc-400 flex items-center gap-2 font-mono text-sm break-all">
            <Globe className="h-4 w-4 text-blue-500 animate-pulse shrink-0" /> {result.main.url}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0" data-pdf-ignore>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800" onClick={() => handleCopyText(result.main.url, false, 999)}>
            <Share2 className="mr-2 h-4 w-4 shrink-0" /> {t("shareUrl")}
          </Button>
          <Button variant="default" size="sm" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4 shrink-0" /> {t("exportPdf")}
          </Button>
        </div>
      </div>

      {/* AI Prominent Executive Summary Panel */}
      <Card className="border-blue-500/30 bg-[#121215] shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-24 w-24 text-blue-500" />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400 fill-blue-400/20 animate-bounce" />
            {t("executiveSummary")}
          </CardTitle>
          <CardDescription className="text-zinc-500 font-mono text-xs">
            {t("synthesizedSummary")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-zinc-200 leading-relaxed font-medium font-sans">
            {translateAiText(result.aiAnalysis.executiveSummary, language)}
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("keyPositives")}
              </h4>
              <ul className="space-y-2">
                {result.aiAnalysis.topStrengths.slice(0, 3).map((strength, i) => (
                  <li key={i} className="text-sm font-medium text-zinc-300 flex items-start gap-2">
                    <span className="text-emerald-500 text-xs font-mono font-bold mt-0.5">·</span> {translateAiText(strength, language)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" /> {t("statusOnPageGaps")}
              </h4>
              <ul className="space-y-2">
                {result.aiAnalysis.contentGaps.slice(0, 3).map((gap, i) => (
                  <li key={i} className="text-sm font-medium text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-500 text-xs font-mono font-bold mt-0.5">·</span> {translateAiText(gap, language)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 p-1 bg-zinc-900 border border-zinc-800 h-12 w-full flex-row overflow-x-auto overflow-y-hidden flex-nowrap justify-start whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" data-pdf-ignore>
          <TabsTrigger value="overview" className="shrink-0 flex-1 md:flex-initial h-full px-4 sm:px-6 data-[state=active]:bg-zinc-850 data-[state=active]:text-white data-[state=active]:shadow text-zinc-400 font-bold transition-all">
            {t("overviewScores")}
          </TabsTrigger>
          <TabsTrigger value="issues" className="shrink-0 flex-1 md:flex-initial h-full px-4 sm:px-6 data-[state=active]:bg-zinc-850 data-[state=active]:text-white data-[state=active]:shadow text-zinc-400 font-bold transition-all relative">
            {t("issuesList")}
            {sortedIssues.length > 0 && (
              <Badge className="ml-2 bg-red-600 hover:bg-red-600 text-white border-none text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full">
                {sortedIssues.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="geo" className="shrink-0 flex-1 md:flex-initial h-full px-4 sm:px-6 data-[state=active]:bg-zinc-850 data-[state=active]:text-white data-[state=active]:shadow text-zinc-400 font-bold transition-all">
            {t("geoOptimization")}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="shrink-0 flex-1 md:flex-initial h-full px-4 sm:px-6 data-[state=active]:bg-zinc-850 data-[state=active]:text-white data-[state=active]:shadow text-zinc-400 font-bold transition-all">
            {t("scoreBreakdown")}
          </TabsTrigger>
          <TabsTrigger value="comparison" className="shrink-0 flex-1 md:flex-initial h-full px-4 sm:px-6 data-[state=active]:bg-zinc-850 data-[state=active]:text-white data-[state=active]:shadow text-zinc-400 font-bold transition-all">
            {t("competitiveEdge")}
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          {/* Three Score Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CircularProgress value={result.main.seoScore.totalScore} label={t("mainSeoScore")} subtitle={t("crawlerMeta")} />
            <CircularProgress value={result.main.geoScore.totalScore} label={t("geoCitationScore")} subtitle={t("llmFit")} />
            <CircularProgress value={result.main.technicalScore.totalScore} label={t("technicalHealth")} subtitle={t("loadSecurity")} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Radar */}
            <div className="lg:col-span-2 bg-[#18181b] border border-zinc-800 rounded-xl flex flex-col overflow-hidden min-w-0 w-full">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 animate-pulse" /> {t("performanceIndex")}
                </h3>
              </div>
              <div className="p-4 sm:p-6 flex flex-col items-center justify-center w-full">
                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#27272a" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                      <Radar
                        name={t("targetWebsite")}
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
                          stroke={["#8b5cf6", "#f97316", "#10b981"][i]}
                          fill={["#8b5cf6", "#f97316", "#10b981"][i]}
                          fillOpacity={0.05}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          isAnimationActive={false}
                        />
                      ))}
                      <ReTooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span>{t("yourWebsite")}</span>
                  </div>
                  {result.competitors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${["bg-purple-500", "bg-orange-500", "bg-emerald-500"][i]}`} />
                      <span>{new URL(c.url).hostname}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Web Vitals Panel */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#71717a]">{t("liveAuditedMetrics")}</h3>
                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{t("executionVelocity")}</p>
                      <p className="text-2xl font-bold tracking-tight text-white font-mono">{result.main.technicalScore.metrics.loadTime} <span className="text-sm text-zinc-500">ms</span></p>
                    </div>
                    <Badge variant="outline" className={result.main.technicalScore.metrics.loadTime < 1500 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}>
                      {result.main.technicalScore.metrics.loadTime < 1500 ? t("fast") : t("moderate")}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{t("secureHttpsKey")}</p>
                      <p className="text-sm font-semibold tracking-tight text-zinc-200 flex items-center gap-1.5">
                        <Lock className="h-4 w-4 text-emerald-500" />
                        {result.main.technicalScore.metrics.hasHttps ? t("sslVerified") : t("sslInsecure")}
                      </p>
                    </div>
                    <Badge variant="outline" className={result.main.technicalScore.metrics.hasHttps ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                      {result.main.technicalScore.metrics.hasHttps ? t("secured") : t("insecure")}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{t("mobileViewportConfig")}</p>
                      <p className="text-sm font-semibold tracking-tight text-zinc-200 flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-blue-400" />
                        {result.main.technicalScore.metrics.hasViewport ? t("mobileViewportDeclared") : t("mobileViewportMissing")}
                      </p>
                    </div>
                    <Badge variant="outline" className={result.main.technicalScore.metrics.hasViewport ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                      {result.main.technicalScore.metrics.hasViewport ? t("responsive") : t("nonOptimized")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t("agentCitationOutlook")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border border-zinc-800 rounded bg-[#09090b] group transition-all duration-300 hover:border-zinc-750">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">{t("llmIndexing")}</div>
                    <div className="text-xs font-bold text-blue-400">{t("excellent")}</div>
                  </div>
                  <div className="text-center p-3 border border-zinc-800 rounded bg-[#09090b] group transition-all duration-300 hover:border-zinc-750">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1">{t("ragRetrieval")}</div>
                    <div className="text-xs font-bold text-emerald-400">{t("highScore")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 2. ISSUES LIST TAB */}
        <TabsContent value="issues" className="space-y-4 outline-none">
          <div className="flex items-center gap-4 mb-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="h-10 w-10 bg-red-650/20 border border-red-500/10 rounded-xl flex items-center justify-center text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#71717a] mb-1">{t("severityRankedCorrections")}</h3>
              <p className="text-lg font-bold">{t("fixesRequiredDesc")}</p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {sortedIssues.map((issue, idx) => (
              <AccordionItem key={idx} value={`issue-${idx}`} className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden transition-all hover:border-zinc-700">
                <AccordionTrigger className="hover:no-underline px-6 py-5">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="shrink-0 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {issue.severity === "Critical" || issue.severity === "High" ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-base text-zinc-100 tracking-tight">{translateAiText(issue.title, language)}</span>
                        {getSeverityBadge(issue.severity)}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 border-t border-zinc-900 bg-[#0c0c0e] min-w-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 min-w-0">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                          {t("descriptionLabel")}
                        </label>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                          {translateAiText(issue.description, language)}
                        </p>
                      </div>
 
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                          {t("howToFix")}
                        </label>
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/25 text-emerald-400 font-semibold text-sm leading-relaxed">
                          {translateAiText(issue.fix, language)}
                        </div>
                      </div>
                    </div>

                    {issue.codeExample && (
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Code className="h-3 w-3" /> {t("recommendedCodeSolution")}
                          </label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-bold font-mono tracking-widest text-zinc-500"
                            onClick={() => handleCopyText(issue.codeExample || "", false, idx)}
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                                {t("copiedLabel")}
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                {t("copyCodeLabel")}
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-[#040405] border border-zinc-800 rounded-xl relative overflow-hidden p-5 max-w-full">
                          <pre className="overflow-x-auto text-xs font-mono leading-relaxed text-blue-300 max-w-full scrollbar-thin">
                            <code>{issue.codeExample}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>        {/* 3. GEO OPTIMIZATION TAB */}
        <TabsContent value="geo" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Opportunities list */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 fill-blue-500/10" /> {t("geoOpportunitiesTitle")}
                </h3>
                <div className="space-y-6">
                  {result.aiAnalysis.geoOpportunities.map((opp, i) => (
                    <div key={i} className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 relative group">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-base text-zinc-200">{translateAiText(opp.title, language)}</h4>
                          <p className="text-sm text-zinc-400 leading-relaxed">{translateAiText(opp.description, language)}</p>
                          <div className="mt-3 pt-3 border-t border-zinc-900">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{t("implementationStrategy")}</p>
                            <p className="text-xs font-semibold text-zinc-300 mt-1 leading-relaxed bg-zinc-900 p-3 rounded-lg border border-zinc-850">
                              {translateAiText(opp.implementation, language)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* suggested faq */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-blue-400" /> {t("suggestedFaqList")}
                </h3>
                <div className="space-y-3">
                  {result.aiAnalysis.suggestedFaqQuestions.map((q, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 bg-zinc-950 border border-zinc-900 rounded-lg">
                      <div className="h-5 w-5 bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                        Q
                      </div>
                      <span className="text-sm font-semibold text-zinc-300">{translateAiText(q, language)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schema markup recom */}
            <div className="space-y-6">
              <Card className="border-blue-500/30 bg-zinc-950 shadow-2xl relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Code className="h-4 w-4" /> {t("jsonLdStructuredSchema")}
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    {t("tailoredJsonDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 min-w-0">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono">{t("recommendedSchemaType")}</div>
                    <Badge className="bg-blue-600 font-bold px-3 py-1 text-white">{result.aiAnalysis.schemaRecommendation?.type || "FAQPage"}</Badge>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2 font-medium">
                      {translateAiText(result.aiAnalysis.schemaRecommendation?.reason, language)}
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-2 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest gap-2">
                      <span>{t("schemaPayload")}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[11px] font-mono text-zinc-500 tracking-wider hover:bg-zinc-900"
                        onClick={() => handleCopyText(result.aiAnalysis.schemaRecommendation?.exampleJson || "", true)}
                      >
                        {copiedSchema ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                            {t("copiedLabel")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            {t("copyJsonLabel")}
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-[#040405] border border-zinc-900 rounded-xl p-4 overflow-x-auto max-w-full">
                      <pre className="text-[10px] font-mono leading-relaxed text-emerald-400 whitespace-pre scrollbar-thin">
                        <code>{result.aiAnalysis.schemaRecommendation?.exampleJson || "{}"}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 4. BREAKDOWNS TAB */}
        <TabsContent value="breakdown" className="space-y-6 outline-none">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl max-w-4xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#71717a] mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" /> {t("detailedScoringParameters")}
            </h3>
            
            <Accordion type="multiple" defaultValue={["seo-break"]} className="w-full space-y-4">
              {/* Traditional SEO breakdown */}
              <AccordionItem value="seo-break" className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
                <AccordionTrigger className="hover:no-underline px-6 py-4 bg-zinc-900/30">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-bold text-zinc-200">{t("traditionalSeoMatrix")}</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">
                      {t("scoreText")}: {result.main.seoScore.totalScore}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-4 space-y-4">
                  {result.main.seoScore.breakdown.map((row, i) => (
                    <div key={i} className="py-3 border-b border-zinc-900 last:border-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1 md:max-w-2xl">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-zinc-300">{translateAiText(row.category, language)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${row.score === row.maxScore ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {row.score === row.maxScore ? t("optimized") : t("attentionNeeded")}
                          </span>
                        </div>
                        {row.issues.map((iss, j) => (
                          <p key={j} className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                            <span className="text-zinc-500 font-bold">•</span> {translateAiText(iss, language)}
                          </p>
                        ))}
                      </div>
                      <span className="text-sm font-bold font-mono text-zinc-400 text-right shrink-0">
                        {row.score} <span className="text-zinc-600 text-xs font-normal">/ {row.maxScore}</span>
                      </span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* GEO Breakdown */}
              <AccordionItem value="geo-break" className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
                <AccordionTrigger className="hover:no-underline px-6 py-4 bg-zinc-900/30">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-bold text-zinc-200">{t("geoSearchMatrix")}</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono">
                      {t("scoreText")}: {result.main.geoScore.totalScore}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-4 space-y-4">
                  {result.main.geoScore.breakdown.map((row, i) => (
                    <div key={i} className="py-3 border-b border-zinc-900 last:border-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1 md:max-w-2xl">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-zinc-300">{translateAiText(row.category, language)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${row.score === row.maxScore ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                            {row.score === row.maxScore ? t("optimized") : t("attentionNeeded")}
                          </span>
                        </div>
                        {row.issues.map((iss, j) => (
                          <p key={j} className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                            <span className="text-zinc-500 font-bold">•</span> {translateAiText(iss, language)}
                          </p>
                        ))}
                      </div>
                      <span className="text-sm font-bold font-mono text-zinc-400 text-right shrink-0">
                        {row.score} <span className="text-zinc-650 text-xs font-normal">/ {row.maxScore}</span>
                      </span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* Technical Breakdown */}
              <AccordionItem value="tech-break" className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
                <AccordionTrigger className="hover:no-underline px-6 py-4 bg-zinc-900/30">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-bold text-zinc-200">{t("technicalSeoMatrix")}</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">
                      {t("scoreText")}: {result.main.technicalScore.totalScore}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-4 space-y-4">
                  {result.main.technicalScore.breakdown.map((row, i) => (
                    <div key={i} className="py-3 border-b border-zinc-900 last:border-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1 md:max-w-2xl">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-zinc-300">{translateAiText(row.category, language)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${row.score === row.maxScore ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                            {row.score === row.maxScore ? t("healthy") : t("failedVerification")}
                          </span>
                        </div>
                        {row.issues.map((iss, j) => (
                          <p key={j} className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                            <span className="text-zinc-500 font-bold">•</span> {translateAiText(iss, language)}
                          </p>
                        ))}
                      </div>
                      <span className="text-sm font-bold font-mono text-zinc-400 text-right shrink-0">
                        {row.score} <span className="text-zinc-600 text-xs font-normal">/ {row.maxScore}</span>
                      </span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        {/* 5. COMPETITIVE EDGE TAB */}
        <TabsContent value="comparison" className="space-y-8 outline-none">
          {/* Competitors Score Barchart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950 min-w-0 w-full">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t("competitivePerformanceComparison")}</CardTitle>
                <CardDescription className="text-zinc-500 text-xs">{t("comparingSeoGeoTech")}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 w-full overflow-hidden">
                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.3} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} stroke="#27272a" />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} stroke="#27272a" />
                      <ReTooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', fontStyle: 'normal' }} />
                      <Bar dataKey="seo" name={t("mainSeoScore")} fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="geo" name={t("geoCitationScore")} fill="#d97706" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="tech" name={t("technicalHealth")} fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-[#18181b] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5 text-blue-400">
                  <Award className="h-5 w-5" /> {t("geminiCompetitiveInsight")}
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">{t("advancedTacticalPlaybook")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-zinc-300 font-medium font-sans">
                {result.aiAnalysis.competitorInsights ? (
                  <p className="whitespace-pre-line leading-relaxed">{result.aiAnalysis.competitorInsights}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Shield className="h-10 w-10 text-zinc-500 opacity-20" />
                    <p className="text-xs text-zinc-500 uppercase tracking-tight font-bold">{t("noCompetitorAudited")}</p>
                    <p className="text-xs text-zinc-400">{t("addCompetitorsDesc")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CircularProgress({ value, label, subtitle }: { value: number; label: string; subtitle: string }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = (v: number) => {
    if (v >= 70) return "stroke-emerald-500 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]";
    if (v >= 40) return "stroke-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]";
    return "stroke-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  };

  return (
    <div className={`p-6 bg-[#18181b] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center group transition-all duration-300 hover:border-zinc-700`}>
      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            className={getColor(value)}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-3xl font-extrabold tracking-tight font-mono">
          {value}<span className="text-sm font-normal text-zinc-500">%</span>
        </span>
      </div>
      <h3 className="font-bold text-sm text-zinc-200">{label}</h3>
      <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider mt-1">{subtitle}</p>
    </div>
  );
}
