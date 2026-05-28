import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Audit API
  app.post("/api/audit", async (req, res) => {
    const { url, competitors } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "Main URL is required" });
    }

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulation logic for scores
    const generateScore = (seed: string) => Math.floor(Math.random() * 40) + 60;
    
    const results = {
      timestamp: new Date().toISOString(),
      main: {
        url,
        scores: {
          seo: generateScore(url),
          geo: generateScore(url + "geo"),
          technical: generateScore(url + "tech"),
          content: generateScore(url + "content"),
        },
        metrics: {
          lcp: (Math.random() * 2 + 1).toFixed(2) + "s",
          inp: Math.floor(Math.random() * 150 + 50) + "ms",
          cls: (Math.random() * 0.1).toFixed(3),
          mobileFriendly: true,
          https: true,
        }
      },
      competitors: competitors.map((cUrl: string) => ({
        url: cUrl,
        scores: {
          seo: generateScore(cUrl),
          geo: generateScore(cUrl + "geo"),
          technical: generateScore(cUrl + "tech"),
          content: generateScore(cUrl + "content"),
        },
        metrics: {
          lcp: (Math.random() * 2 + 1).toFixed(2) + "s",
          inp: Math.floor(Math.random() * 150 + 50) + "ms",
          cls: (Math.random() * 0.1).toFixed(3),
        }
      })),
      recommendations: [
        {
          priority: "Critical",
          title: "Optimize Image LCP",
          description: "Images on landing pages are not optimized. Use WebP and lazy loading.",
          action: "Compress existing images and add loading='lazy' attribute.",
          code: "<img src='hero.webp' loading='lazy' alt='Service Showcase' />"
        },
        {
          priority: "High",
          title: "Improve GEO Citation Potential",
          description: "Content is missing FAQ structure. AI Engines prioritize structured data for citation.",
          action: "Add an FAQ section using Schema.org to answer common user intents.",
          code: "{\"@context\": \"https://schema.org\", \"@type\": \"FAQPage\", \"mainEntity\": [...]}"
        }
      ]
    };

    res.json(results);
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
