import { ParsedPage, GeoAnalysis, ScoreCategoryBreakdown } from '../types/audit';

export function calculateGeoScore(parsed: ParsedPage): GeoAnalysis {
  const breakdown: ScoreCategoryBreakdown[] = [];
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  // Parse schema types
  const schemaTypes = new Set<string>();
  let hasFaqSchema = false;
  let hasAuthorSchema = false;
  let hasSpecializedGeoSchema = false; // Article, HowTo, Review
  let hasDatesInSchema = false;

  parsed.schemaMarkup.forEach(markup => {
    try {
      const obj = JSON.parse(markup);
      const walk = (node: any) => {
        if (!node) return;
        if (typeof node === 'object') {
          if (node['@type']) {
            const typeStr = String(node['@type']);
            schemaTypes.add(typeStr);
            if (typeStr === "FAQPage") hasFaqSchema = true;
            if (typeStr === "Author" || typeStr === "Person" || node.author) hasAuthorSchema = true;
            if (["HowTo", "Article", "Review", "NewsArticle", "BlogPosting", "Recipe"].includes(typeStr)) {
              hasSpecializedGeoSchema = true;
            }
          }
          if (node.datePublished || node.dateModified || node.dateCreated) {
            hasDatesInSchema = true;
          }
          Object.values(node).forEach(walk);
        } else if (Array.isArray(node)) {
          node.forEach(walk);
        }
      };
      walk(obj);
    } catch (e) {
      // ignore
    }
  });

  // 1. FAQ / Q&A Structure (max 20 points)
  let faqScore = 0;
  const faqIssues: string[] = [];
  
  // Count headings that look like questions
  const questionWords = ["who", "what", "how", "why", "when", "where", "which", "is", "can", "should", "does", "do"];
  let questionHeadingCount = 0;
  [...parsed.h2Tags, ...parsed.h3Tags].forEach(heading => {
    const textLower = heading.toLowerCase().trim();
    const hasQuestionMark = textLower.includes("?");
    const startsWithQWord = questionWords.some(word => textLower.startsWith(word + " ") || textLower.startsWith(word + "'"));
    if (hasQuestionMark || startsWithQWord) {
      questionHeadingCount++;
    }
  });

  if (hasFaqSchema) {
    faqScore = 20;
    passedChecks.push("FAQ Schema Structured Data Installed");
  } else {
    faqScore = Math.min(questionHeadingCount * 2, 15);
    if (questionHeadingCount > 0) {
      faqIssues.push(`Found ${questionHeadingCount} question-like headlines in H2/H3 tags. Add an FAQPage JSON-LD schema to upgrade this category to maximum points.`);
      passedChecks.push("Q&A Formatted Subheadings");
      failedChecks.push("FAQ Schema Structured Data Installed");
    } else {
      faqScore = 0;
      faqIssues.push("No question-and-answer structural signals detected (no question headings or FAQ schemas). AI search engines rely heavily on Q&A formatting to source answers.");
      failedChecks.push("FAQ Schema Structured Data Installed");
      failedChecks.push("Q&A Formatted Subheadings");
    }
  }
  breakdown.push({
    category: "Q&A Structure",
    score: faqScore,
    maxScore: 20,
    issues: faqIssues
  });

  // 2. Direct Answer Potential (max 20 points)
  let answerScore = 0;
  const answerIssues: string[] = [];
  let qualifyingParagraphCount = 0;
  
  // Check paragraphs that read like direct definitions or instructions
  const directPatterns = [
    /\bis\b/i,           // "X is..."
    /\brefers to\b/i,    // "X refers to..."
    /\bmeans\b/i,        // "X means..."
    /^to\s+[a-z]+/i,     // "To [verb]..."
    /\bdefined as\b/i    // "X defined as..."
  ];

  parsed.paragraphs.forEach(p => {
    if (p.length > 10 && p.length < 150) {
      const matchesDirect = directPatterns.some(pattern => pattern.test(p));
      if (matchesDirect) {
        qualifyingParagraphCount++;
      }
    }
  });

  answerScore = Math.min(qualifyingParagraphCount * 4, 20);
  if (qualifyingParagraphCount > 0) {
    passedChecks.push("Direct Definition Paragraphs");
    if (answerScore < 20) {
      answerIssues.push(`Discovered ${qualifyingParagraphCount} direct definitions or micro-paragraphs (<150 words/chars). Add more direct, high-impact answers near key questions to maximize GEO visibility.`);
    }
  } else {
    answerIssues.push("No concise direct-answer paragraph formats found in the first 20 paragraphs. AI models look for clear definition pairs (e.g., 'X is Y' or 'To construct X...') to extract quick definitions.");
    failedChecks.push("Direct Definition Paragraphs");
  }
  breakdown.push({
    category: "Direct Answer Potential",
    score: answerScore,
    maxScore: 20,
    issues: answerIssues
  });

  // 3. Authority Signals (max 15 points)
  let authScore = 0;
  const authIssues: string[] = [];
  
  // Word count signals
  let wordCountBonus = 0;
  if (parsed.wordCount > 1500) {
    wordCountBonus = 5;
    passedChecks.push("Longform Authority Text (>1500 words)");
  }
  if (parsed.wordCount > 3000) {
    wordCountBonus = 10;
    passedChecks.push("Comprehensive In-Depth Research (>3000 words)");
  }
  
  authScore += wordCountBonus;
  
  // Author signals
  const authorInHtml = parsed.rawHtml.toLowerCase().includes('class="author"') || 
                       parsed.rawHtml.toLowerCase().includes('id="author"') ||
                       /\bby\s+[A-Z][a-z]+/i.test(parsed.rawHtml);

  if (hasAuthorSchema || authorInHtml) {
    authScore += 5;
    passedChecks.push("Author Attribution or Byline");
  } else {
    authIssues.push("No explicit author byline or Person schema markup. Credibility signals are crucial for search evaluation.");
    failedChecks.push("Author Attribution or Byline");
  }

  if (parsed.wordCount <= 1500) {
    authIssues.push(`Low overall text density (${parsed.wordCount} words). Comprehensive guides over 1500 words generally achieve far better citation indexes.`);
    failedChecks.push("Longform Authority Text (>1500 words)");
  }

  breakdown.push({
    category: "Authority & Expertise Signals",
    score: authScore,
    maxScore: 15,
    issues: authIssues
  });

  // 4. Structured Data Richness (max 15 points)
  let densityScore = 0;
  const densityIssues: string[] = [];

  // unique types count
  const uniqueTypesCount = schemaTypes.size;
  let typePoints = uniqueTypesCount * 3;
  
  if (hasSpecializedGeoSchema) {
    typePoints += 5;
    passedChecks.push("HowTo, Article, or Review Schema");
  } else if (uniqueTypesCount > 0) {
    densityIssues.push("No specialized publisher schemas (Article, HowTo, Review, BlogPosting) identified. These schemas explicitly instruct LLMs about content types.");
    failedChecks.push("HowTo, Article, or Review Schema");
  }

  densityScore = Math.min(15, typePoints);
  if (uniqueTypesCount > 0) {
    passedChecks.push("JSON-LD Structured Data Schema Types");
  } else {
    densityIssues.push("No schema types detected. Structured catalogs are critical for direct model ingestion.");
    failedChecks.push("JSON-LD Structured Data Schema Types");
  }
  breakdown.push({
    category: "Structured Data Richness",
    score: densityScore,
    maxScore: 15,
    issues: densityIssues
  });

  // 5. Citation-Friendly Formatting (max 15 points)
  let citeScore = 0;
  const citeIssues: string[] = [];

  const hasOrderedList = parsed.rawHtml.includes("<ol") || parsed.rawHtml.includes("</ol>");
  const hasDefinitions = parsed.rawHtml.includes("<dt") || parsed.rawHtml.includes("<strong>") || parsed.rawHtml.includes("<b>");
  
  let hasSummaryHeading = false;
  const summaryKeywords = ["summary", "conclusion", "tldr", "tl;dr"];
  [...parsed.h1Tags, ...parsed.h2Tags, ...parsed.h3Tags].forEach(h => {
    const textLower = h.toLowerCase();
    if (summaryKeywords.some(keyword => textLower.includes(keyword))) {
      hasSummaryHeading = true;
    }
  });

  if (hasOrderedList) {
    citeScore += 5;
    passedChecks.push("Step-by-Step Numbered Lists (<ol>)");
  } else {
    citeIssues.push("No numbered list `<ol>` tags detected. Numbered step indicators are frequently cited by engines for instruct sets.");
    failedChecks.push("Step-by-Step Numbered Lists (<ol>)");
  }

  if (hasDefinitions) {
    citeScore += 5;
    passedChecks.push("Strong/Bold Text Highlight Structures");
  } else {
    citeIssues.push("Low semantic highlighting (no bold words, dt lists, etc.). Highlighting key terminology boosts structural parsing.");
    failedChecks.push("Strong/Bold Text Highlight Structures");
  }

  if (hasSummaryHeading) {
    citeScore += 5;
    passedChecks.push("Concise Content Summary or TL;DR Section");
  } else {
    citeIssues.push("No clear TL;DR or summary headline found (H1/H2 with 'Summary', 'Conclusion', 'TLDR'). AI models highly value upfront synthetics.");
    failedChecks.push("Concise Content Summary or TL;DR Section");
  }

  breakdown.push({
    category: "Citation-Friendly Layout",
    score: citeScore,
    maxScore: 15,
    issues: citeIssues
  });

  // 6. Freshness Signals (max 15 points)
  let freshScore = 0;
  const freshIssues: string[] = [];

  const hasOgTime = parsed.rawHtml.toLowerCase().includes('property="article:published_time"') ||
                    parsed.rawHtml.toLowerCase().includes('property="article:modified_time"');

  if (hasDatesInSchema || hasOgTime) {
    freshScore += 10;
    passedChecks.push("Timestamp Metatags present (modified/published)");
  } else {
    freshIssues.push("No published/modified metadata dates detected in OG tags or schema context. Engines prioritize clear freshness timestamps.");
    failedChecks.push("Timestamp Metatags present (modified/published)");
  }

  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`\\b(202\\d|${currentYear})\\b`);
  const yearInTitle = yearPattern.test(parsed.title);
  const yearInUrl = yearPattern.test(parsed.canonicalUrl || parsed.rawHtml);

  if (yearInTitle || yearInUrl) {
    freshScore += 5;
    passedChecks.push("Temporal Reference (Year) in Title/URL");
  } else {
    freshIssues.push(`No target year reference (${currentYear}) detected in URL or main title, representing potential loss of current-intent relevance signals.`);
    failedChecks.push("Temporal Reference (Year) in Title/URL");
  }

  breakdown.push({
    category: "Information Freshness",
    score: freshScore,
    maxScore: 15,
    issues: freshIssues
  });

  // Calculate total GEO Score
  const totalScore = breakdown.reduce((acc, curr) => acc + curr.score, 0);

  return {
    totalScore: Math.min(100, Math.max(0, Math.round(totalScore))),
    breakdown,
    passedChecks,
    failedChecks
  };
}
