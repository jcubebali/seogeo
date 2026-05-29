export interface ParsedPage {
  rawHtml: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  images: { src: string; alt: string; hasAlt: boolean }[];
  links: { href: string; text: string; isInternal: boolean }[];
  canonicalUrl: string;
  robotsMeta: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  twitterCard: {
    title: string;
    description: string;
    image: string;
  };
  schemaMarkup: string[];
  wordCount: number;
  paragraphs: string[];
  hasViewport: boolean;
  hasHttps: boolean;
  loadTime: number; // ms
  responseStatus: number;
  contentType: string;
}

export interface ScoreCategoryBreakdown {
  category: string;
  score: number;
  maxScore: number;
  issues: string[];
}

export interface SeoAnalysis {
  totalScore: number;
  breakdown: ScoreCategoryBreakdown[];
  passedChecks: string[];
  failedChecks: string[];
}

export interface GeoAnalysis {
  totalScore: number;
  breakdown: ScoreCategoryBreakdown[];
  passedChecks: string[];
  failedChecks: string[];
}

export interface DetailedTechnicalMetrics {
  loadTime: number;
  status: number;
  hasViewport: boolean;
  hasHttps: boolean;
}

export interface TechnicalAnalysis {
  totalScore: number;
  breakdown: ScoreCategoryBreakdown[];
  metrics: DetailedTechnicalMetrics;
}

export interface AiIssue {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  fix: string;
  codeExample?: string;
}

export interface AiOpportunity {
  title: string;
  description: string;
  implementation: string;
}

export interface SchemaRecommendation {
  type: "FAQPage" | "HowTo" | "Article" | "LocalBusiness" | "Product";
  reason: string;
  exampleJson: string;
}

export interface AiAnalysis {
  executiveSummary: string;
  topStrengths: string[];
  criticalIssues: AiIssue[];
  geoOpportunities: AiOpportunity[];
  contentGaps: string[];
  suggestedFaqQuestions: string[];
  schemaRecommendation: SchemaRecommendation;
  competitorInsights: string | null;
}

export interface AuditEntity {
  url: string;
  parsed: ParsedPage;
  seoScore: SeoAnalysis;
  geoScore: GeoAnalysis;
  technicalScore: TechnicalAnalysis;
}

export interface CompetitorComparison {
  url: string;
  seoScore: SeoAnalysis;
  geoScore: GeoAnalysis;
  technicalScore: TechnicalAnalysis;
}

export interface FullAuditResult {
  timestamp: string;
  main: AuditEntity;
  competitors: CompetitorComparison[];
  aiAnalysis: AiAnalysis;
}

export interface AuditFormValues {
  url: string;
  competitors: { url: string }[];
}
