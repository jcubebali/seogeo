import { ParsedPage, TechnicalAnalysis, ScoreCategoryBreakdown } from '../types/audit';

export function calculateTechnicalScore(parsed: ParsedPage): TechnicalAnalysis {
  const breakdown: ScoreCategoryBreakdown[] = [];

  // 1. HTTPS Protocol (max 20 points)
  let httpsScore = 0;
  const httpsIssues: string[] = [];
  if (parsed.hasHttps) {
    httpsScore = 20;
  } else {
    httpsIssues.push("Secure connection (HTTPS) is not detected. Search engines and browsers restrict non-encrypted sites.");
  }
  breakdown.push({
    category: "HTTPS Secure Encryption",
    score: httpsScore,
    maxScore: 20,
    issues: httpsIssues
  });

  // 2. HTTP Status Code (max 15 points)
  let statusScore = 0;
  const statusIssues: string[] = [];
  if (parsed.responseStatus === 200) {
    statusScore = 15;
  } else {
    statusIssues.push(`Site returned HTTP Status ${parsed.responseStatus}. A healthy indexing requires HTTP status 200.`);
  }
  breakdown.push({
    category: "Connection Status Response",
    score: statusScore,
    maxScore: 15,
    issues: statusIssues
  });

  // 3. Execution Load Time (max 20 points)
  let loadScore = 0;
  const loadIssues: string[] = [];
  if (parsed.loadTime < 1000) {
    loadScore = 20;
  } else if (parsed.loadTime < 2000) {
    loadScore = 10;
    loadIssues.push(`Page loaded in ${parsed.loadTime}ms. This is moderate, but optimizing server response time under 1000ms is beneficial.`);
  } else if (parsed.loadTime < 3000) {
    loadScore = 5;
    loadIssues.push(`Slow execution load time (${parsed.loadTime}ms). High TTFB latency can impair Core Web Vitals.`);
  } else {
    loadScore = 0;
    loadIssues.push(`Excessively slow load time detected (${parsed.loadTime}ms). High page weight is a bounce-rate hazard.`);
  }
  breakdown.push({
    category: "Page Load Velocity",
    score: loadScore,
    maxScore: 20,
    issues: loadIssues
  });

  // 4. Mobile Responsiveness / Viewport (max 15 points)
  let viewScore = 0;
  const viewIssues: string[] = [];
  if (parsed.hasViewport) {
    viewScore = 15;
  } else {
    viewIssues.push("No responsive viewport meta tag detected. This content is not ready for mobile optimization index frameworks.");
  }
  breakdown.push({
    category: "Viewport Mobile Support",
    score: viewScore,
    maxScore: 15,
    issues: viewIssues
  });

  // 5. Canonical Indexing (max 10 points)
  let canonicalScore = 0;
  const canonicalIssues: string[] = [];
  if (parsed.canonicalUrl) {
    canonicalScore = 10;
  } else {
    canonicalIssues.push("No canonical link meta declared on this page. Duplicated URLs risk dilution of organic index value.");
  }
  breakdown.push({
    category: "Canonical Integrity",
    score: canonicalScore,
    maxScore: 10,
    issues: canonicalIssues
  });

  // 6. Robots Crawl Restrictions (max 10 points)
  let robotsScore = 0;
  const robotsIssues: string[] = [];
  const parsedRobotsLower = parsed.robotsMeta.toLowerCase();
  
  if (!parsedRobotsLower.includes("noindex")) {
    robotsScore = 10;
  } else {
    robotsIssues.push("The page has 'noindex' specified in crawler meta instructions, completely blocking search results distribution.");
  }
  breakdown.push({
    category: "Robots Crawler Policy",
    score: robotsScore,
    maxScore: 10,
    issues: robotsIssues
  });

  // 7. Visual OG Thumbnails (max 10 points)
  let ogImgScore = 0;
  const ogImgIssues: string[] = [];
  if (parsed.openGraph.image) {
    ogImgScore = 10;
  } else {
    ogImgIssues.push("No Open Graph metadata image defined. Social previews will render without associated thumbnail previews.");
  }
  breakdown.push({
    category: "OG Thumbnail Visuals",
    score: ogImgScore,
    maxScore: 10,
    issues: ogImgIssues
  });

  const totalScore = breakdown.reduce((acc, curr) => acc + curr.score, 0);

  return {
    totalScore: Math.min(100, Math.max(0, Math.round(totalScore))),
    breakdown,
    metrics: {
      loadTime: parsed.loadTime,
      status: parsed.responseStatus,
      hasViewport: parsed.hasViewport,
      hasHttps: parsed.hasHttps
    }
  };
}
