/**
 * Centered Mental Health Clinic - Website Scraper
 * Extracts business information for Voice AI knowledge base
 */

import { scrapeUrl } from './client';
import { saveKnowledge, loadKnowledge, KnowledgeData } from './knowledge-store';

const CENTERED_LOCATION_ID = 'tjZJ0hbW7tD1I21hCS41';

export interface CenteredBusinessInfo {
  name: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  website: string;
  services: Array<{
    name: string;
    description: string;
    pricing?: string;
  }>;
  hours?: {
    [key: string]: string;
  };
  staff?: Array<{
    name: string;
    title: string;
    specialty?: string;
  }>;
  policies: {
    nonDiscrimination?: string;
    safeSpace?: string;
  };
  scrapedAt: string;
  rawMarkdown: string;
}

/**
 * Scrape Centered website and extract structured business information
 */
export async function scrapeCenteredWebsite(): Promise<CenteredBusinessInfo> {
  const url = 'https://centered.one';
  
  console.log('🏥 Scraping Centered website...');
  
  const scraped = await scrapeUrl(url, {
    waitFor: 5000,
    timeout: 60000
  });

  // Parse the markdown to extract structured information
  const businessInfo = parseBusinessInfo(scraped.markdown, scraped.metadata);

  // Save to database
  await saveKnowledgeBase(businessInfo);

  console.log('✅ Centered knowledge base updated');
  
  return businessInfo;
}

/**
 * Parse scraped markdown into structured business info
 */
function parseBusinessInfo(markdown: string, metadata: any): CenteredBusinessInfo {
  // Extract services from the content
  const services = [];
  
  if (markdown.includes('Traditional Therapy')) {
    services.push({
      name: 'Traditional Therapy',
      description: 'Evidence-based psychotherapy approaches for mental health support'
    });
  }
  
  if (markdown.includes('Advanced Psychiatric Care')) {
    services.push({
      name: 'Advanced Psychiatric Care',
      description: 'Comprehensive psychiatric evaluation and medication management'
    });
  }
  
  if (markdown.includes('Ketamine Assisted Therapy') || markdown.includes('Ketamine-Assisted Therapy')) {
    services.push({
      name: 'Ketamine-Assisted Therapy',
      description: 'Innovative ketamine therapy for treatment-resistant depression and other conditions'
    });
  }

  // Extract non-discrimination policy
  let nonDiscriminationPolicy = '';
  const policyMatch = markdown.match(/NON-DISCRIMINATION.*?POLICY(.*?)(?=##|\n\n)/s);
  if (policyMatch) {
    nonDiscriminationPolicy = policyMatch[1].trim();
  }

  const businessInfo: CenteredBusinessInfo = {
    name: 'Centered',
    description: metadata.description || 
      'A pioneering mental health center offering affordable, multidisciplinary care. From traditional therapy to advanced psychiatric care and ketamine-assisted therapy, we provide a full spectrum of services.',
    website: 'https://centered.one',
    services,
    policies: {
      nonDiscrimination: nonDiscriminationPolicy || 
        'Centered does not discriminate on the basis of race, color, national origin, sex, gender identity or expression, affectional or sexual orientation, age, disability, religion or belief, marital status, veteran status, English language proficiency, or HIV status.',
      safeSpace: 'We are committed to providing an affirming, safe, and welcoming space for all staff members, patients, clients, visitors, volunteers, subcontractors, and vendors.'
    },
    scrapedAt: new Date().toISOString(),
    rawMarkdown: markdown
  };

  return businessInfo;
}

/**
 * Save knowledge base to file
 */
async function saveKnowledgeBase(info: CenteredBusinessInfo): Promise<void> {
  try {
    const knowledgeData: KnowledgeData = {
      name: info.name,
      description: info.description,
      website: info.website,
      address: info.address,
      phone: info.phone,
      email: info.email,
      services: info.services,
      hours: info.hours,
      staff: info.staff,
      policies: info.policies,
      scrapedAt: info.scrapedAt,
      rawMarkdown: info.rawMarkdown
    };
    
    saveKnowledge(CENTERED_LOCATION_ID, knowledgeData);
    console.log('✅ Knowledge base saved successfully');
  } catch (error: any) {
    console.error('❌ Failed to save knowledge base:', error.message);
  }
}

/**
 * Get business info from knowledge base
 */
export async function getCenteredBusinessInfo(): Promise<CenteredBusinessInfo | null> {
  try {
    const data = loadKnowledge(CENTERED_LOCATION_ID);
    
    if (!data) {
      return null;
    }

    return {
      name: data.name,
      description: data.description,
      website: data.website,
      address: data.address,
      phone: data.phone,
      email: data.email,
      services: data.services,
      hours: data.hours,
      staff: data.staff,
      policies: data.policies,
      scrapedAt: data.scrapedAt,
      rawMarkdown: data.rawMarkdown
    };
  } catch (error) {
    return null;
  }
}

/**
 * Query knowledge base with natural language
 */
export async function queryKnowledgeBase(query: string): Promise<string> {
  const info = await getCenteredBusinessInfo();
  
  if (!info) {
    return 'I apologize, but I don\'t have access to our business information at the moment. Please call back later or visit our website at centered.one.';
  }

  const lowerQuery = query.toLowerCase();

  // Address/Location
  if (lowerQuery.includes('address') || lowerQuery.includes('location') || lowerQuery.includes('where')) {
    return info.address || 
      'Our clinic information is available on our website at centered.one. We are a mental health center serving our community.';
  }

  // Services
  if (lowerQuery.includes('service') || lowerQuery.includes('offer') || lowerQuery.includes('what do you')) {
    const servicesList = info.services.map(s => `${s.name}: ${s.description}`).join('\n\n');
    return `We offer the following services:\n\n${servicesList}`;
  }

  // Pricing
  if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('how much')) {
    const pricedServices = info.services.filter(s => s.pricing);
    if (pricedServices.length > 0) {
      return pricedServices.map(s => `${s.name}: ${s.pricing}`).join('\n');
    }
    return 'For pricing information, please contact our office directly or visit our website at centered.one.';
  }

  // Hours
  if (lowerQuery.includes('hours') || lowerQuery.includes('open') || lowerQuery.includes('when')) {
    if (info.hours) {
      return Object.entries(info.hours)
        .map(([day, hours]) => `${day}: ${hours}`)
        .join('\n');
    }
    return 'Please visit our website at centered.one or call our office for our current hours of operation.';
  }

  // Non-discrimination/Safe space
  if (lowerQuery.includes('discrimination') || lowerQuery.includes('lgbtq') || lowerQuery.includes('safe')) {
    return info.policies.safeSpace || 
      'We are committed to providing an affirming, safe, and welcoming space for all.';
  }

  // General info
  return info.description;
}
