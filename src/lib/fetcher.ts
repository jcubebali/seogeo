import * as cheerio from 'cheerio';
// @ts-ignore
import robotsParser from 'robots-parser';
import { ParsedPage } from '../types/audit';

/**
 * Normalizes and validates the target URL.
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    // Default to https
    normalized = 'https://' + normalized;
  }
  try {
    const parsed = new URL(normalized);
    return parsed.toString();
  } catch (err) {
    throw new Error(`Invalid URL format: "${url}". Please provide a valid web address.`);
  }
}

/**
 * Polite fetcher that checks robots.txt and fetches the html content.
 */
export async function fetchAndParse(url: string): Promise<ParsedPage> {
  const normalizedUrl = normalizeUrl(url);
  const targetUrlObj = new URL(normalizedUrl);
  
  // 1. Robots.txt polite check
  let isAllowedToCrawl = true;
  const robotsTxtUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}/robots.txt`;
  
  try {
    const robotsController = new AbortController();
    const robotsTimeout = setTimeout(() => robotsController.abort(), 3000);
    
    const robotsRes = await fetch(robotsTxtUrl, {
      headers: {
        'User-Agent': 'SeoGeoSuiteBot/1.0'
      },
      signal: robotsController.signal
    });
    clearTimeout(robotsTimeout);
    
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text();
      const robots = robotsParser(robotsTxtUrl, robotsText);
      const allowed = robots.isAllowed(normalizedUrl, 'SeoGeoSuiteBot/1.0') || robots.isAllowed(normalizedUrl, '*');
      if (allowed === false) {
        isAllowedToCrawl = false;
      }
    }
  } catch (err) {
    // If robots.txt fetch fails, we default to allowing crawling per standard web convention.
    console.warn(`Could not fetch robots.txt for ${targetUrlObj.host}, proceeding anyway.`, err);
  }
  
  if (!isAllowedToCrawl) {
    throw new Error(`Crawling blocked by robots.txt specifications of ${targetUrlObj.host}.`);
  }

  // 2. Fetch HTML content with 10-second timeout
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), 10000);
  
  const startTime = Date.now();
  let response;
  try {
    response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: ctrl.signal
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 10 seconds. The website at ${targetUrlObj.host} is slow to respond or blocking automated crawlers.`);
    }
    throw new Error(`Failed to establish connection to ${targetUrlObj.host}. Details: ${err.message}`);
  }
  clearTimeout(timeoutId);
  const loadTime = Date.now() - startTime;

  const responseStatus = response.status;
  const contentType = response.headers.get('content-type') || '';

  // Handle common HTTP blocks
  if (responseStatus === 403 || responseStatus === 999) {
    throw new Error(`Access forbidden (HTTP ${responseStatus}) by ${targetUrlObj.host}. The host is likely protected by Cloudflare or another anti-bot solution.`);
  } else if (!response.ok && responseStatus >= 400) {
    throw new Error(`Request returned error status code HTTP ${responseStatus} from ${targetUrlObj.host}.`);
  }

  if (!contentType.toLowerCase().includes('text/html') && !contentType.toLowerCase().includes('application/xhtml+xml')) {
    throw new Error(`Expected HTML content but received content-type "${contentType}". This tool can only audit HTML web pages.`);
  }

  const rawHtml = await response.text();
  
  // 3. Parse with Cheerio
  const $ = cheerio.load(rawHtml);
  
  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                          $('meta[property="og:description"]').attr('content')?.trim() || '';
  const metaKeywords = $('meta[name="keywords"]').attr('content')?.trim() || '';
  
  const h1Tags: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) h1Tags.push(text);
  });
  
  const h2Tags: string[] = [];
  $('h2').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) h2Tags.push(text);
  });
  
  const h3Tags: string[] = [];
  $('h3').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) h3Tags.push(text);
  });

  const images: { src: string; alt: string; hasAlt: boolean }[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt')?.trim() || '';
    if (src) {
      images.push({
        src,
        alt,
        hasAlt: !!alt
      });
    }
  });

  const links: { href: string; text: string; isInternal: boolean }[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim() || '';
    const text = $(el).text().replace(/\s+/g, ' ').trim() || '';
    if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      let isInternal = false;
      try {
        if (href.startsWith('/') || href.startsWith('.') || href.startsWith('#')) {
          isInternal = true;
        } else {
          const checkUrl = new URL(href, normalizedUrl);
          isInternal = checkUrl.host === targetUrlObj.host;
        }
      } catch (e) {
        // Ignored, fallback to false
      }
      links.push({ href, text, isInternal });
    }
  });

  const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || '';
  const robotsMeta = $('meta[name="robots"]').attr('content')?.trim() || '';

  const openGraph = {
    title: $('meta[property="og:title"]').attr('content')?.trim() || '',
    description: $('meta[property="og:description"]').attr('content')?.trim() || '',
    image: $('meta[property="og:image"]').attr('content')?.trim() || '',
    type: $('meta[property="og:type"]').attr('content')?.trim() || ''
  };

  const twitterCard = {
    title: $('meta[name="twitter:title"]').attr('content')?.trim() || 
           $('meta[property="twitter:title"]').attr('content')?.trim() || '',
    description: $('meta[name="twitter:description"]').attr('content')?.trim() || 
                 $('meta[property="twitter:description"]').attr('content')?.trim() || '',
    image: $('meta[name="twitter:image"]').attr('content')?.trim() || 
           $('meta[property="twitter:image"]').attr('content')?.trim() || ''
  };

  const schemaMarkup: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html()?.trim();
    if (content) {
      schemaMarkup.push(content);
    }
  });

  const bodyText = $('body').text() || '';
  const cleanBodyText = bodyText.replace(/\s+/g, ' ').trim();
  const wordCount = cleanBodyText ? cleanBodyText.split(/\s+/).length : 0;

  const paragraphs: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text && paragraphs.length < 20) {
      paragraphs.push(text);
    }
  });

  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasHttps = normalizedUrl.startsWith('https://');

  return {
    rawHtml,
    title,
    metaDescription,
    metaKeywords,
    h1Tags,
    h2Tags,
    h3Tags,
    images,
    links,
    canonicalUrl,
    robotsMeta,
    openGraph,
    twitterCard,
    schemaMarkup,
    wordCount,
    paragraphs,
    hasViewport,
    hasHttps,
    loadTime,
    responseStatus,
    contentType
  };
}
