/**
 * GoHighLevel Integration - Central Export
 * Provides both Direct API and AI Agent capabilities
 */

// Core client and configuration
export { getGHLClient, GHL_CONFIG, getLocationId, LOCATIONS } from './client';

// Direct API Services
export { GHLContactService } from './contact-service';

// AI Agent for complex workflows
export { GHLAIAgent } from './ai-agent';

// Voice AI Services
export { VoiceAIService } from './voice-ai-service';
export { CenteredVoiceAgent } from './centered-voice-agent';

// User Management
export { UserManagementService } from './user-service';

// Calendar Management
export { CalendarManagementService } from './calendar-service';

// Export types
export type { PatientData } from './contact-service';
export type { 
  VoiceAgentConfig, 
  CustomAction, 
  VoiceAgent 
} from './voice-ai-service';
export type { UserData, CreatedUser } from './user-service';
