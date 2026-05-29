import { GoogleGenAI } from "@google/genai";
import { ParsedPage, SeoAnalysis, GeoAnalysis, AiAnalysis } from '../types/audit';

// Initialize the Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export async function runGeminiAnalysis(
  parsed: ParsedPage,
  seoScore: SeoAnalysis,
  geoScore: GeoAnalysis,
  competitorDataList: { url: string; seoScore: any; geoScore: any }[] = []
): Promise<AiAnalysis> {
  const competitorContext = competitorDataList.length > 0 
    ? competitorDataList.map((comp) => {
        return `- Competitor URL: ${comp.url}\n  SEO Score: ${comp.seoScore.totalScore}/100\n  GEO Score: ${comp.geoScore.totalScore}/100`;
      }).join("\n")
    : "No competitors supplied for auditing.";

  const prompt = `
You are an expert SEO and GEO (Generative Engine Optimization) AI auditor specializing in optimizing websites for both traditional search engines (Google, Bing) and AI search agents (ChatGPT, Gemini, Perplexity, Claude).

Perform a deep technical and content optimization audit of the target page based on the detailed extraction below:

[URL DETAILS & CONTENT METRICS]
- Title: "${parsed.title}"
- Meta Description: "${parsed.metaDescription}"
- Total Word Count: ${parsed.wordCount} words
- H1 Tags: ${JSON.stringify(parsed.h1Tags)}
- H2 Tags: ${JSON.stringify(parsed.h2Tags.slice(0, 15))} (truncated to top 15)
- H3 Tags: ${JSON.stringify(parsed.h3Tags.slice(0, 15))} (truncated to top 15)
- Sample Core Paragraphs: ${JSON.stringify(parsed.paragraphs.slice(0, 5))}

[ALGORITHMIC AUDIT SCORE BREAKDOWN]
- SEO Score: ${seoScore.totalScore}/100
- SEO Checklist Failures: ${JSON.stringify(seoScore.failedChecks)}
- GEO (Generative Engine Optimization) Score: ${geoScore.totalScore}/100
- GEO Breakdown Details: ${JSON.stringify(geoScore.breakdown)}

[COMPETITORS AUDIT COMPARISON]
${competitorContext}

Your mission is to return a highly professional, actionable, and structured analysis as a JSON object of the following EXACT format:
{
  "executiveSummary": "2-3 sentence plain-language summary of the site's SEO+GEO health.",
  "topStrengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "criticalIssues": [
    {
      "title": "Clear issue title",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "description": "Detailed explanation of exactly what is wrong and why it severely impacts search crawlers or LLM retrieval.",
      "fix": "Actionable explanation of how to fix it with specific syntax guidelines.",
      "codeExample": "HTML or JSON-LD script snippet demonstrating the implementation (optional, present if relevant)."
    }
  ],
  "geoOpportunities": [
    {
      "title": "Opportunity title",
      "description": "How to make the layout, language, or meta tags more citation-friendly for LLM reference retrievers.",
      "implementation": "Specific step-by-step instructions on implementing this opportunity."
    }
  ],
  "contentGaps": ["Detailed topic, concept, or search query term that this page is missing but competitors or target audience are covering."],
  "suggestedFaqQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"],
  "schemaRecommendation": {
    "type": "FAQPage" | "HowTo" | "Article" | "LocalBusiness" | "Product",
    "reason": "Clear tactical rationale explaining why this schema is ideal for LLMs to ingest this content.",
    "exampleJson": "Strictly compliant JSON-LD script tailored to this specific page (NOT a mock, populate with real content based on title/paragraphs/FAQ)."
  },
  "competitorInsights": "Analysis comparing this page vs the supplied competitors. Identify where this page is winning, where it is losing, and a roadmap to beat them. If no competitors were supplied, return null."
}

Use the target brand/content to write real, high-quality recommendations and schemas. Do not use generic placeholders.
Your response MUST be valid, parseable JSON only. No markdown wrappers or triple backticks.
`;

  try {
    const rawRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const text = rawRes.text || "{}";
    const cleanedText = text.trim();
    const result = JSON.parse(cleanedText) as AiAnalysis;
    return result;
  } catch (err: any) {
    console.error("Gemini API error during generation or parsing:", err);
    
    // In case of any error (rate limit, parse issue, key issue, etc.), we safely fall back to a structured object so the app doesn't crash.
    return {
      executiveSummary: `The page was crawled successfully, but AI-driven deeper analysis encountered an error: ${err.message}. Showing algorithmic score parameters instead.`,
      topStrengths: [
        parsed.title ? "Presence of HTML document title structure" : "HTML document parsed",
        parsed.hasHttps ? "Uses secure HTTPS connection protocols" : "Crawl response received",
        "Target crawled within timeout constraints"
      ],
      criticalIssues: [
        {
          title: "Gemini AI Analysis Temporarily Unavailable",
          severity: "Medium",
          description: `The audit system could not obtain AI recommendations because of a model response latency or credit error.`,
          fix: "Check your GEMINI_API_KEY environment configuration or try again.",
        }
      ],
      geoOpportunities: [],
      contentGaps: ["Could not extract content gaps without LLM generation"],
      suggestedFaqQuestions: [
        "What are the main services listed?",
        "How can we optimize headings for AI search?",
        "Why is structured schema markup useful?"
      ],
      schemaRecommendation: {
        type: "FAQPage",
        reason: "No AI recommendation possible due to API timeout, showing FAQ recommendation fallback.",
        exampleJson: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\"\n}"
      },
      competitorInsights: competitorDataList.length > 0 ? "Competitors were evaluated algorithmically in the chart dashboard above." : null
    };
  }
}
