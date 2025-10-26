/**
 * Simple file-based knowledge store
 * Stores scraped data in JSON file for immediate use
 */

import fs from 'fs';
import path from 'path';

const KNOWLEDGE_FILE = path.join(process.cwd(), '.knowledge-base.json');

export interface KnowledgeData {
  name: string;
  description: string;
  website: string;
  services: Array<{
    name: string;
    description: string;
    pricing?: string;
  }>;
  policies: {
    nonDiscrimination?: string;
    safeSpace?: string;
  };
  scrapedAt: string;
  rawMarkdown: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: {
    [key: string]: string;
  };
  staff?: Array<{
    name: string;
    title: string;
    specialty?: string;
  }>;
}

/**
 * Save knowledge data to file
 */
export function saveKnowledge(locationId: string, data: KnowledgeData): void {
  try {
    let store: Record<string, KnowledgeData> = {};
    
    // Read existing data
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      const content = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
      store = JSON.parse(content);
    }
    
    // Update with new data
    store[locationId] = data;
    
    // Write back to file
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(store, null, 2));
    
    console.log(`✅ Knowledge saved to file for location: ${locationId}`);
  } catch (error: any) {
    console.error('❌ Failed to save knowledge:', error.message);
  }
}

/**
 * Load knowledge data from file
 */
export function loadKnowledge(locationId: string): KnowledgeData | null {
  try {
    if (!fs.existsSync(KNOWLEDGE_FILE)) {
      return null;
    }
    
    const content = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    const store: Record<string, KnowledgeData> = JSON.parse(content);
    
    return store[locationId] || null;
  } catch (error: any) {
    console.error('❌ Failed to load knowledge:', error.message);
    return null;
  }
}

/**
 * Check if knowledge exists
 */
export function hasKnowledge(locationId: string): boolean {
  return loadKnowledge(locationId) !== null;
}
