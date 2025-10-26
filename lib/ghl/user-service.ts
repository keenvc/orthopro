/**
 * GoHighLevel User Management Service
 * Create and manage staff users for locations
 */

import { getGHLClient, GHL_CONFIG } from './client';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  permissions?: {
    campaignsEnabled?: boolean;
    campaignsReadOnly?: boolean;
    contactsEnabled?: boolean;
    workflowsEnabled?: boolean;
    workflowsReadOnly?: boolean;
    triggersEnabled?: boolean;
    funnelsEnabled?: boolean;
    websitesEnabled?: boolean;
    opportunitiesEnabled?: boolean;
    dashboardStatsEnabled?: boolean;
    bulkRequestsEnabled?: boolean;
    appointmentsEnabled?: boolean;
    reviewsEnabled?: boolean;
    onlineListingsEnabled?: boolean;
    phoneCallEnabled?: boolean;
    conversationsEnabled?: boolean;
    assignedDataOnly?: boolean;
    adwordsReportingEnabled?: boolean;
    membershipEnabled?: boolean;
    facebookAdsReportingEnabled?: boolean;
    attributionsReportingEnabled?: boolean;
    settingsEnabled?: boolean;
    tagsEnabled?: boolean;
    leadValueEnabled?: boolean;
    marketingEnabled?: boolean;
    agentReportingEnabled?: boolean;
    botService?: boolean;
    socialPlanner?: boolean;
    bloggingEnabled?: boolean;
    invoiceEnabled?: boolean;
    affiliateManagerEnabled?: boolean;
    contentAiEnabled?: boolean;
    refundsEnabled?: boolean;
    recordPaymentEnabled?: boolean;
    cancelSubscriptionEnabled?: boolean;
    paymentsEnabled?: boolean;
    communitiesEnabled?: boolean;
    exportPaymentsEnabled?: boolean;
  };
}

export interface CreatedUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  extension?: string;
  role: string;
  locationIds: string[];
}

const CENTERED_LOCATION_ID = 'tjZJ0hbW7tD1I21hCS41';

export class UserManagementService {
  private baseUrl = 'https://services.leadconnectorhq.com';

  /**
   * Create a new user in the Centered subaccount
   */
  async createUser(userData: UserData): Promise<CreatedUser> {
    try {
      console.log(`👤 Creating user: ${userData.firstName} ${userData.lastName}`);

      const requestBody = {
        companyId: GHL_CONFIG.companyId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        type: 'account',
        role: userData.role,
        locationIds: [CENTERED_LOCATION_ID],
        permissions: userData.permissions || this.getDefaultPermissions(userData.role)
      };

      const token = process.env.GHL_API_TOKEN_CENTERED || process.env.GHL_API_TOKEN;
      
      const response = await fetch(`${this.baseUrl}/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log(`✅ User created: ${result.id}`);

      return {
        id: result.id,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        locationIds: [CENTERED_LOCATION_ID]
      };
    } catch (error: any) {
      console.error('❌ Failed to create user:', error.message);
      throw error;
    }
  }

  /**
   * Get all users for Centered location
   */
  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/location/${CENTERED_LOCATION_ID}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
            'Version': '2021-07-28'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get users: ${response.status}`);
      }

      const result = await response.json();
      return result.users || [];
    } catch (error: any) {
      console.error('❌ Failed to get users:', error.message);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
          'Version': '2021-07-28'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ Failed to get user:', error.message);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<UserData>): Promise<any> {
    try {
      console.log(`🔄 Updating user: ${userId}`);

      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ User updated`);
      return result;
    } catch (error: any) {
      console.error('❌ Failed to update user:', error.message);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log(`🗑️  Deleting user: ${userId}`);

      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_TOKEN}`,
          'Version': '2021-07-28'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      console.log(`✅ User deleted`);
    } catch (error: any) {
      console.error('❌ Failed to delete user:', error.message);
      throw error;
    }
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: 'admin' | 'user'): any {
    if (role === 'admin') {
      // Admin gets full access
      return {
        campaignsEnabled: true,
        campaignsReadOnly: false,
        contactsEnabled: true,
        workflowsEnabled: true,
        workflowsReadOnly: false,
        triggersEnabled: true,
        funnelsEnabled: true,
        websitesEnabled: true,
        opportunitiesEnabled: true,
        dashboardStatsEnabled: true,
        bulkRequestsEnabled: true,
        appointmentsEnabled: true,
        reviewsEnabled: true,
        onlineListingsEnabled: true,
        phoneCallEnabled: true,
        conversationsEnabled: true,
        assignedDataOnly: false,
        adwordsReportingEnabled: true,
        membershipEnabled: true,
        facebookAdsReportingEnabled: true,
        attributionsReportingEnabled: true,
        settingsEnabled: true,
        tagsEnabled: true,
        leadValueEnabled: true,
        marketingEnabled: true,
        agentReportingEnabled: true,
        botService: true,
        socialPlanner: true,
        bloggingEnabled: true,
        invoiceEnabled: true,
        affiliateManagerEnabled: true,
        contentAiEnabled: true,
        refundsEnabled: true,
        recordPaymentEnabled: true,
        cancelSubscriptionEnabled: true,
        paymentsEnabled: true,
        communitiesEnabled: true,
        exportPaymentsEnabled: true
      };
    } else {
      // Regular user - restricted access
      return {
        campaignsEnabled: false,
        campaignsReadOnly: true,
        contactsEnabled: true,
        workflowsEnabled: false,
        workflowsReadOnly: true,
        triggersEnabled: false,
        funnelsEnabled: false,
        websitesEnabled: false,
        opportunitiesEnabled: true,
        dashboardStatsEnabled: true,
        bulkRequestsEnabled: false,
        appointmentsEnabled: true,
        reviewsEnabled: true,
        onlineListingsEnabled: false,
        phoneCallEnabled: true,
        conversationsEnabled: true,
        assignedDataOnly: true, // Only see assigned contacts
        adwordsReportingEnabled: false,
        membershipEnabled: false,
        facebookAdsReportingEnabled: false,
        attributionsReportingEnabled: false,
        settingsEnabled: false,
        tagsEnabled: true,
        leadValueEnabled: false,
        marketingEnabled: false,
        agentReportingEnabled: false,
        botService: false,
        socialPlanner: false,
        bloggingEnabled: false,
        invoiceEnabled: true,
        affiliateManagerEnabled: false,
        contentAiEnabled: false,
        refundsEnabled: false,
        recordPaymentEnabled: true,
        cancelSubscriptionEnabled: false,
        paymentsEnabled: true,
        communitiesEnabled: false,
        exportPaymentsEnabled: false
      };
    }
  }

  /**
   * Bulk create users from array
   */
  async bulkCreateUsers(users: UserData[]): Promise<{ 
    successful: CreatedUser[]; 
    failed: Array<{ user: UserData; error: string }>; 
  }> {
    const successful: CreatedUser[] = [];
    const failed: Array<{ user: UserData; error: string }> = [];

    for (const user of users) {
      try {
        const created = await this.createUser(user);
        successful.push(created);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        failed.push({
          user,
          error: error.message
        });
      }
    }

    return { successful, failed };
  }
}
