export interface AuditScores {
  seo: number;
  geo: number;
  technical: number;
  content: number;
}

export interface MetricData {
  lcp: string;
  inp: string;
  cls: string;
  mobileFriendly?: boolean;
  https?: boolean;
}

export interface AuditEntity {
  url: string;
  scores: AuditScores;
  metrics: MetricData;
}

export interface Recommendation {
  priority: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  action: string;
  code?: string;
}

export interface FullAuditResult {
  timestamp: string;
  main: AuditEntity;
  competitors: AuditEntity[];
  recommendations: Recommendation[];
}

export interface AuditFormValues {
  url: string;
  competitors: { url: string }[];
}
