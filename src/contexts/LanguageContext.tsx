import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id";

const translations = {
  en: {
    // Sidebar
    dashboard: "Dashboard",
    newAudit: "New Audit",
    competitorsTab: "Competitors",
    history: "History",
    settings: "Settings",
    activePlan: "Plan",
    enterprisePlan: "Enterprise Pro v15",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    collapse: "Collapse",
    lastScan: "Last Scan",
    minsAgo: "2 mins ago",

    // Dashboard Form Header & Sidebar
    runAudit: "Run Audit",
    analyzeNewUrl: "Analyze new URL...",
    heroTitle_1: "SEO & GEO",
    heroTitle_2: "Visibility",
    heroSubtitle: "Audit your website for traditional search engines and the new age of Generative Engines (ChatGPT, Perplexity, Gemini).",
    startAnalysis: "Start Your Analysis",
    enterUrlAndComp: "Enter your target page URL and up to 4 competitors to compare.",
    targetUrlLabel: "Target Website URL",
    targetUrlPlaceholder: "https://yourwebsite.com/page-to-audit",
    competitorsLabel: "Competitors (Optional)",
    addCompetitor: "Add Competitor",
    competitorPlaceholder: "Competitor URL",
    runFullAudit: "Run Full Audit",
    engineAudit: "2026 Ready Engine Audit",
    geoEngine: "2026 GEO Engine",
    geoEngineDesc: "Traditional SEO is base-layer. GEO (Generative Engine Optimization) is how you win ChatGPT, Perplexity, and Gemini mentions.",
    eeatSignals: "EEAT Signals Analysis",
    citationPotential: "Citation Potential Scoring",
    contentStructure: "Content Structure Audit",
    localSeoTitle: "Local SEO Audit",
    localSeoDesc: "Optimized for high-intent local queries in major markets.",

    // Alerts and Error states
    errorBlocked: "Analysis Scanning Blocked",
    dismiss: "Dismiss",
    backToDashboard: "Back to Dashboard",
    noAuditsTitle: "No audits yet",
    noAuditsDesc: "Start by entering your URL and competitor URLs on the dashboard to get a full SEO & GEO report.",

    // Loading State
    loadingTitle: "Analyzing Your Digital Presence",
    overallProgress: "Overall Progress",
    statusTechnical: "Technical",
    statusOnPage: "On-Page",
    statusGeoAudit: "GEO Audit",
    statusCompetitors: "Competitors",

    // Results Page Overview
    auditComplete: "Audit Complete",
    resultsFor: "Audit Report for",
    shareUrl: "Share URL",
    exportPdf: "Export PDF",
    overviewScores: "Overview Scores",
    issuesList: "Issues List",
    geoOptimization: "GEO Optimization",
    scoreBreakdown: "Score Breakdowns",
    competitiveEdge: "Competitive Edge",
    performanceIndex: "Algorithmic Performance Index",
    perfIndexDesc: "A multi-weighted index simulating how modern crawlers and RAG systems perceive your authority.",
    executiveSummary: "Executive Summary",
    keyPositives: "Core Strengths",

    // Results Page - Tabs Content
    impact: "Impact",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    priority: "Priority",
    explanation: "Detailed Analysis",
    recommendation: "Actionable Fix",
    copyCode: "Copy",
    copied: "Copied!",
    implementationCode: "Recommended Code Solution",
    implementation: "Implementation",
    schemaTitle: "Generative Engine Schema Optimization",
    schemaDesc: "Add structured schema markups to feed LLM Agents and RAG platforms directly.",
    recommendedSchemaType: "Recommended Type",
    schemaPayload: "Structured Payload",

    // Settings Page (custom or simulated settings)
    settingsTitle: "Configuration & Access",
    settingsDesc: "Configure crawling rate limits, user agents, user profile credentials, and integration features.",
    crawlerAgent: "Crawler User-Agent",
    rateLimit: "Crawl Delay Rate-Limit (per sec)",
    alertTrigger: "Failure Notification Alert Email",
    saveSettings: "Save Configuration",
    settingsSaved: "Configuration Saved",
  },
  id: {
    // Sidebar
    dashboard: "Dasbor",
    newAudit: "Audit Baru",
    competitorsTab: "Kompetitor",
    history: "Riwayat",
    settings: "Pengaturan",
    activePlan: "Paket",
    enterprisePlan: "Enterprise Pro v15",
    lightMode: "Mode Terang",
    darkMode: "Mode Gelap",
    collapse: "Sembunyikan",
    lastScan: "Pemindaian Terakhir",
    minsAgo: "2 mnt yang lalu",

    // Dashboard Form Header & Sidebar
    runAudit: "Jalankan Audit",
    analyzeNewUrl: "Analisis URL baru...",
    heroTitle_1: "Visibilitas",
    heroTitle_2: "SEO & GEO",
    heroSubtitle: "Audit situs web Anda untuk mesin pencari tradisional dan era baru Mesin Generatif (ChatGPT, Perplexity, Gemini).",
    startAnalysis: "Mulai Analisis Anda",
    enterUrlAndComp: "Masukkan URL halaman target Anda dan hingga 4 kompetitor untuk dibandingkan.",
    targetUrlLabel: "URL Situs Web Target",
    targetUrlPlaceholder: "https://situsanda.com/halaman-untuk-diaudit",
    competitorsLabel: "Kompetitor (Opsional)",
    addCompetitor: "Tambah Kompetitor",
    competitorPlaceholder: "URL Kompetitor",
    runFullAudit: "Jalankan Audit Lengkap",
    engineAudit: "Audit Mesin Siap 2026",
    geoEngine: "Mesin GEO 2026",
    geoEngineDesc: "SEO tradisional adalah lapisan dasar. GEO (Generative Engine Optimization) adalah cara Anda memenangkan sebutan di ChatGPT, Perplexity, dan Gemini.",
    eeatSignals: "Analisis Sinyal EEAT",
    citationPotential: "Penilaian Potensi Kutipan",
    contentStructure: "Audit Struktur Konten",
    localSeoTitle: "Audit SEO Lokal",
    localSeoDesc: "Dioptimalkan untuk kueri lokal dengan intensitas tinggi di pasar utama.",

    // Alerts and Error states
    errorBlocked: "Pemindaian Analisis Terblokir",
    dismiss: "Tutup",
    backToDashboard: "Kembali ke Dasbor",
    noAuditsTitle: "Belum ada audit",
    noAuditsDesc: "Mulai dengan memasukkan URL Anda dan URL kompetitor di dasbor untuk mendapatkan laporan SEO & GEO lengkap.",

    // Loading State
    loadingTitle: "Menganalisis Kehadiran Digital Anda",
    overallProgress: "Kemajuan Keseluruhan",
    statusTechnical: "Teknis",
    statusOnPage: "On-Page",
    statusGeoAudit: "Audit GEO",
    statusCompetitors: "Kompetitor",

    // Results Page Overview
    auditComplete: "Audit Selesai",
    resultsFor: "Laporan Audit untuk",
    shareUrl: "Bagikan URL",
    exportPdf: "Ekspor PDF",
    overviewScores: "Ringkasan Skor",
    issuesList: "Daftar Masalah",
    geoOptimization: "Optimalisasi GEO",
    scoreBreakdown: "Rincian Skor",
    competitiveEdge: "Keunggulan Kompetitif",
    performanceIndex: "Indeks Kinerja Algoritma",
    perfIndexDesc: "Indeks multi-bobot yang mensimulasikan bagaimana peramban modern dan sistem RAG memahami otoritas Anda.",
    executiveSummary: "Ringkasan Eksekutif",
    keyPositives: "Kekuatan Utama",

    // Results Page - Tabs Content
    impact: "Dampak",
    critical: "Kritis",
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah",
    priority: "Prioritas",
    explanation: "Analisis Mendalam",
    recommendation: "Perbaikan yang Disarankan",
    copyCode: "Salin",
    copied: "Tersalin!",
    implementationCode: "Solusi Kode yang Direkomendasikan",
    implementation: "Implementasi",
    schemaTitle: "Optimalisasi Skema Mesin Generatif",
    schemaDesc: "Tambahkan markup skema terstruktur untuk memberi makan Agen LLM dan platform RAG secara langsung secara optimal.",
    recommendedSchemaType: "Tipe yang Direkomendasikan",
    schemaPayload: "Payload Terstruktur",

    // Settings Page (custom or simulated settings)
    settingsTitle: "Konfigurasi & Akses",
    settingsDesc: "Konfigurasikan batas kecepatan crawling, user agent, kredensial profil pengguna, dan fitur integrasi.",
    crawlerAgent: "User-Agent Crawler",
    rateLimit: "Batas Kecepatan Delay Crawl (per detik)",
    alertTrigger: "Email Notifikasi Kegagalan Berfungsi",
    saveSettings: "Simpan Konfigurasi",
    settingsSaved: "Konfigurasi Berhasil Disimpan",
  }
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_lang");
    return (saved === "id" ? "id" : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
