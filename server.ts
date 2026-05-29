import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAndParse } from "./src/lib/fetcher";
import { calculateSeoScore } from "./src/lib/seo-scorer";
import { calculateGeoScore } from "./src/lib/geo-scorer";
import { calculateTechnicalScore } from "./src/lib/technical-scorer";
import { runGeminiAnalysis } from "./src/lib/gemini-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Real SEO and GEO Audit Pipeline API
  app.post("/api/audit", async (req, res) => {
    try {
      const { url, competitors = [], lang = "en" } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Limit competitors to 3
      const limitedCompetitors = Array.isArray(competitors)
        ? competitors.map((c: any) => typeof c === 'string' ? c : c.url).filter(Boolean).slice(0, 3)
        : [];

      // 1. Run main page crawling and analysis
      const parsed = await fetchAndParse(url);
      const [seoScore, geoScore, technicalScore] = await Promise.all([
        calculateSeoScore(parsed),
        calculateGeoScore(parsed),
        calculateTechnicalScore(parsed)
      ]);

      // 2. Run competitor analysis in parallel
      const competitorResults = await Promise.all(
        limitedCompetitors.map(async (cUrl: string) => {
          try {
            const cParsed = await fetchAndParse(cUrl);
            const [cSeo, cGeo, cTech] = await Promise.all([
              calculateSeoScore(cParsed),
              calculateGeoScore(cParsed),
              calculateTechnicalScore(cParsed)
            ]);
            return {
              url: cUrl,
              seoScore: cSeo,
              geoScore: cGeo,
              technicalScore: cTech
            };
          } catch (cErr: any) {
            console.error(`Competitor crawling failed for "${cUrl}":`, cErr.message);
            // On failure, construct a safe mock/disabled model score so user chart doesn't break
            return {
              url: cUrl,
              seoScore: { totalScore: 0, breakdown: [], passedChecks: [], failedChecks: ["Crawling Failed"] },
              geoScore: { totalScore: 0, breakdown: [], passedChecks: [], failedChecks: ["Crawling Failed"] },
              technicalScore: { totalScore: 0, breakdown: [], metrics: { loadTime: 0, status: 0, hasViewport: false, hasHttps: false } }
            };
          }
        })
      );

      // 3. Run Gemini AI analysis
      const aiAnalysis = await runGeminiAnalysis(parsed, seoScore, geoScore, competitorResults, lang);

      res.json({
        timestamp: new Date().toISOString(),
        main: {
          url,
          parsed,
          seoScore,
          geoScore,
          technicalScore
        },
        competitors: competitorResults,
        aiAnalysis
      });
    } catch (err: any) {
      console.error("Audit API Error:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred during raw analysis." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
