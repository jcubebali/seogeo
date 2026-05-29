import { ParsedPage, SeoAnalysis, ScoreCategoryBreakdown } from '../types/audit';

export function calculateSeoScore(parsed: ParsedPage): SeoAnalysis {
  const breakdown: ScoreCategoryBreakdown[] = [];
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  // 1. Title Tag (max 15 points)
  let titleScore = 0;
  const titleIssues: string[] = [];
  const titleLen = parsed.title.length;

  if (titleLen === 0) {
    titleScore = 0;
    titleIssues.push("Title tag is missing.");
    failedChecks.push("Title Tag Present");
  } else if (titleLen < 30) {
    titleScore = 8;
    titleIssues.push(`Title tag is too short (${titleLen} characters). Recommended: 30-60 characters.`);
    failedChecks.push("Optimal Title Length");
    passedChecks.push("Title Tag Present");
  } else if (titleLen > 60) {
    titleScore = 10;
    titleIssues.push(`Title tag is too long (${titleLen} characters). Recommended: 30-60 characters.`);
    failedChecks.push("Optimal Title Length");
    passedChecks.push("Title Tag Present");
  } else {
    titleScore = 15;
    passedChecks.push("Title Tag Present");
    passedChecks.push("Optimal Title Length");
  }
  breakdown.push({
    category: "Title Tag",
    score: titleScore,
    maxScore:15,
    issues: titleIssues
  });

  // 2. Meta Description (max 15 points)
  let descScore = 0;
  const descIssues: string[] = [];
  const descLen = parsed.metaDescription.length;

  if (descLen === 0) {
    descScore = 0;
    descIssues.push("Meta description is missing.");
    failedChecks.push("Meta Description Present");
  } else if (descLen < 120) {
    descScore = 8;
    descIssues.push(`Meta description is too short (${descLen} characters). Recommended: 120-160 characters.`);
    failedChecks.push("Optimal Meta Description Length");
    passedChecks.push("Meta Description Present");
  } else if (descLen > 160) {
    descScore = 10;
    descIssues.push(`Meta description is too long (${descLen} characters). Recommended: 120-160 characters.`);
    failedChecks.push("Optimal Meta Description Length");
    passedChecks.push("Meta Description Present");
  } else {
    descScore = 15;
    passedChecks.push("Meta Description Present");
    passedChecks.push("Optimal Meta Description Length");
  }
  breakdown.push({
    category: "Meta Description",
    score: descScore,
    maxScore: 15,
    issues: descIssues
  });

  // 3. Heading Structure (max 10 points)
  let headingScore = 0;
  const headingIssues: string[] = [];
  const h1Count = parsed.h1Tags.length;
  const h2Count = parsed.h2Tags.length;

  if (h1Count === 0) {
    headingScore = 0;
    headingIssues.push("Missing H1 heading. Every page should have exactly one main H1 tag.");
    failedChecks.push("H1 Heading Present");
  } else if (h1Count > 1) {
    headingScore = 5;
    headingIssues.push(`Multiple H1 headings detected (${h1Count} found). Recommended: exactly one H1 tag.`);
    failedChecks.push("Single H1 Heading Restriction");
    passedChecks.push("H1 Heading Present");
  } else {
    headingScore = 5;
    passedChecks.push("H1 Heading Present");
    passedChecks.push("Single H1 Heading Restriction");
    
    if (h2Count > 0) {
      headingScore = 10;
      passedChecks.push("Structural H2 Headings Present");
    } else {
      headingIssues.push("H1 is present but no H2 sub-headlines were found. It is highly recommended to structure your content using H2 or H3 titles.");
      failedChecks.push("Structural H2 Headings Present");
    }
  }
  breakdown.push({
    category: "Heading Structure",
    score: headingScore,
    maxScore: 10,
    issues: headingIssues
  });

  // 4. Image Alt Text (max 10 points)
  let imgScore = 10;
  const imgIssues: string[] = [];
  const totalImgs = parsed.images.length;
  const imgsMissingAlt = parsed.images.filter(img => !img.hasAlt);

  if (totalImgs > 0) {
    const rawImgScore = ((totalImgs - imgsMissingAlt.length) / totalImgs) * 10;
    imgScore = Math.round(rawImgScore * 10) / 10;
    if (imgsMissingAlt.length > 0) {
      imgIssues.push(`${imgsMissingAlt.length} of ${totalImgs} images are missing alternative 'alt' tags.`);
      imgsMissingAlt.slice(0, 5).forEach((img, idx) => {
        imgIssues.push(`Missing Alt [${idx + 1}]: ${img.src}`);
      });
      failedChecks.push("All Images Have Alt Attributes");
    } else {
      passedChecks.push("All Images Have Alt Attributes");
    }
  } else {
    imgScore = 10;
    passedChecks.push("No images present, perfect scoring given");
  }
  breakdown.push({
    category: "Image Alt Text",
    score: imgScore,
    maxScore: 10,
    issues: imgIssues
  });

  // 5. Internal Links (max 10 points)
  let linkScore = 0;
  const linkIssues: string[] = [];
  const internalLinks = parsed.links.filter(l => l.isInternal);

  if (internalLinks.length === 0) {
    linkScore = 0;
    linkIssues.push("No internal links found on this page. Adding internal links helps distribute ranking authority and aids user site navigation.");
    failedChecks.push("Has Internal Linking");
  } else if (internalLinks.length < 5) {
    linkScore = 6;
    linkIssues.push(`Low internal linking count (${internalLinks.length} found). It is recommended to have at least 5 links for better navigation depth.`);
    passedChecks.push("Has Internal Linking");
    failedChecks.push("Healthy Internal Link Count");
  } else {
    linkScore = 10;
    passedChecks.push("Has Internal Linking");
    passedChecks.push("Healthy Internal Link Count");
  }
  breakdown.push({
    category: "Internal Links",
    score: linkScore,
    maxScore: 10,
    issues: linkIssues
  });

  // 6. Schema Markup (max 10 points)
  let schemaScore = 0;
  const schemaIssues: string[] = [];
  const typeSet = new Set<string>();

  parsed.schemaMarkup.forEach(markup => {
    try {
      const obj = JSON.parse(markup);
      const grabTypes = (item: any) => {
        if (!item) return;
        if (typeof item === 'object') {
          if (item['@type']) typeSet.add(item['@type']);
          Object.values(item).forEach(grabTypes);
        } else if (Array.isArray(item)) {
          item.forEach(grabTypes);
        }
      };
      grabTypes(obj);
    } catch (e) {
      // Ignore JSON parse error, invalid schema is handled gracefully
    }
  });

  if (parsed.schemaMarkup.length === 0) {
    schemaScore = 0;
    schemaIssues.push("No schema structured data (JSON-LD) detected. Structured data is vital for rich search results.");
    failedChecks.push("Structured Schema Installed");
  } else {
    const hasRichSchema = typeSet.has("FAQPage") || typeSet.has("HowTo") || typeSet.has("Article") || typeSet.has("NewsArticle") || typeSet.has("BlogPosting") || typeSet.has("Schema");
    if (hasRichSchema) {
      schemaScore = 10;
      passedChecks.push("Structured Schema Installed");
      passedChecks.push("Highly Specialized Rich Schema Present");
    } else {
      schemaScore = 6;
      schemaIssues.push(`Standard schema markup type(s) discovered: (${Array.from(typeSet).join(", ")}). Consider reinforcing with specialized models like FAQPage or Article for rich result optimization.`);
      passedChecks.push("Structured Schema Installed");
      failedChecks.push("Highly Specialized Rich Schema Present");
    }
  }
  breakdown.push({
    category: "Schema Markup",
    score: schemaScore,
    maxScore: 10,
    issues: schemaIssues
  });

  // 7. Open Graph (max 10 points)
  let ogScore = 0;
  const ogIssues: string[] = [];
  const ogTagsChecked = [
    { name: "og:title", value: parsed.openGraph.title },
    { name: "og:description", value: parsed.openGraph.description },
    { name: "og:image", value: parsed.openGraph.image },
    { name: "og:type", value: parsed.openGraph.type }
  ];

  const presentOg = ogTagsChecked.filter(t => t.value !== "");
  ogScore = Math.round((presentOg.length / 4) * 10);

  if (presentOg.length < 4) {
    const missingOg = ogTagsChecked.filter(t => t.value === "").map(t => t.name);
    ogIssues.push(`Missing Open Graph tags: ${missingOg.join(", ")}. These are critical for social sharing optics.`);
    failedChecks.push("Complete social OG tags setup");
  } else {
    passedChecks.push("Complete social OG tags setup");
  }
  breakdown.push({
    category: "Open Graph Protocols",
    score: ogScore,
    maxScore: 10,
    issues: ogIssues
  });

  // 8. HTTPS (max 10 points)
  let httpsScore = 0;
  const httpsIssues: string[] = [];
  if (parsed.hasHttps) {
    httpsScore = 10;
    passedChecks.push("Secure HTTPS Protocol");
  } else {
    httpsScore = 0;
    httpsIssues.push("The website does not use secure HTTPS protocol. Search engines prioritize secure URLs.");
    failedChecks.push("Secure HTTPS Protocol");
  }
  breakdown.push({
    category: "HTTPS Secure Connection",
    score: httpsScore,
    maxScore: 10,
    issues: httpsIssues
  });

  // 9. Canonical Tag (max 5 points)
  let canonicalScore = 0;
  const canonicalIssues: string[] = [];
  if (parsed.canonicalUrl) {
    canonicalScore = 5;
    passedChecks.push("Presence of Canonical URL");
  } else {
    canonicalScore = 0;
    canonicalIssues.push("Canonical tag rel=\"canonical\" is missing. This causes duplication issue vulnerability.");
    failedChecks.push("Presence of Canonical URL");
  }
  breakdown.push({
    category: "Canonical Tag",
    score: canonicalScore,
    maxScore: 5,
    issues: canonicalIssues
  });

  // 10. Robots Meta (max 5 points)
  let robotsScore = 5;
  const robotsIssues: string[] = [];
  const parsedRobotsLower = parsed.robotsMeta.toLowerCase();
  
  if (parsedRobotsLower.includes("noindex")) {
    robotsScore = 0;
    robotsIssues.push("Target contains robots config 'noindex'. This commands crawlers NOT to list this site in search indexes.");
    failedChecks.push("Open Robots indexing directives");
  } else {
    passedChecks.push("Open Robots indexing directives");
  }
  breakdown.push({
    category: "Robots Directives",
    score: robotsScore,
    maxScore: 5,
    issues: robotsIssues
  });

  // Compile totalScore
  const totalScore = breakdown.reduce((acc, curr) => acc + curr.score, 0);

  return {
    totalScore: Math.min(100, Math.max(0, Math.round(totalScore))),
    breakdown,
    passedChecks,
    failedChecks
  };
}
