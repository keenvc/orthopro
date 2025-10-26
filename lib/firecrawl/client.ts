/**
 * Firecrawl Client
 * Web scraping for knowledge base generation
 */

import FirecrawlApp from '@mendable/firecrawl-js';

let firecrawlClient: FirecrawlApp | null = null;

export function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not configured');
    }

    firecrawlClient = new FirecrawlApp({ apiKey });
  }

  return firecrawlClient;
}

export interface ScrapedContent {
  url: string;
  markdown: string;
  html?: string;
  metadata: {
    title: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    statusCode?: number;
  };
  scrapedAt: string;
}

/**
 * Scrape a single URL
 */
export async function scrapeUrl(url: string, options?: {
  waitFor?: number;
  timeout?: number;
}): Promise<ScrapedContent> {
  const client = getFirecrawlClient();

  try {
    console.log(`🔍 Scraping: ${url}`);
    
    const result = await client.scrape(url, {
      formats: ['markdown', 'html'],
      waitFor: options?.waitFor || 3000,
      timeout: options?.timeout || 30000
    });

    return {
      url,
      markdown: result.markdown || '',
      html: result.html,
      metadata: {
        title: result.metadata?.title || '',
        description: result.metadata?.description,
        ogTitle: result.metadata?.ogTitle,
        ogDescription: result.metadata?.ogDescription,
        statusCode: result.metadata?.statusCode
      },
      scrapedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error(`❌ Failed to scrape ${url}:`, error.message);
    throw error;
  }
}

/**
 * Crawl multiple pages from a website
 */
export async function crawlWebsite(baseUrl: string, options?: {
  maxPages?: number;
  waitFor?: number;
}): Promise<ScrapedContent[]> {
  const client = getFirecrawlClient();

  try {
    console.log(`🕷️  Crawling: ${baseUrl}`);
    
    const result = await client.crawl(baseUrl, {
      limit: options?.maxPages || 10,
      scrapeOptions: {
        formats: ['markdown', 'html'],
        waitFor: options?.waitFor || 3000
      }
    });

    if (!result || !(result as any).success) {
      throw new Error('Crawl failed');
    }

    return ((result as any).data || []).map((page: any) => ({
      url: page.url || baseUrl,
      markdown: page.markdown || '',
      html: page.html,
      metadata: {
        title: page.metadata?.title || '',
        description: page.metadata?.description,
        ogTitle: page.metadata?.ogTitle,
        ogDescription: page.metadata?.ogDescription,
        statusCode: page.metadata?.statusCode
      },
      scrapedAt: new Date().toISOString()
    }));
  } catch (error: any) {
    console.error(`❌ Failed to crawl ${baseUrl}:`, error.message);
    throw error;
  }
}
