/**
 * Bulk User Creation API
 * Create multiple staff users at once
 */

import { NextResponse } from 'next/server';
import { UserManagementService, UserData } from '../../../../../lib/ghl/user-service';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST - Create multiple users
 * Body: { users: UserData[] }
 */
export async function POST(request: Request) {
  try {
    const userService = new UserManagementService();
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request. Expected array of users.'
      }, { status: 400 });
    }

    console.log(`📋 Creating ${users.length} users...`);

    const result = await userService.bulkCreateUsers(users);

    return NextResponse.json({
      success: true,
      created: result.successful.length,
      failed: result.failed.length,
      successful: result.successful,
      failures: result.failed,
      message: `Created ${result.successful.length} users. ${result.failed.length} failed.`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
