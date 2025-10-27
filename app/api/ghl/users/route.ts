/**
 * GHL User Management API
 * Create and manage staff users for Centered subaccount
 */

import { NextResponse } from 'next/server';
import { UserManagementService, UserData } from '../../../../lib/ghl/user-service';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - List all users in Centered subaccount
 */
export async function GET(request: Request) {
  try {
    const userService = new UserManagementService();
    const users = await userService.getUsers();

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST - Create a new user
 * Body: { firstName, lastName, email, phone?, role }
 */
export async function POST(request: Request) {
  try {
    const userService = new UserManagementService();
    const userData: UserData = await request.json();

    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email'
      }, { status: 400 });
    }

    // Validate role
    if (userData.role && !['admin', 'user'].includes(userData.role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Must be "admin" or "user"'
      }, { status: 400 });
    }

    // Set default role if not provided
    if (!userData.role) {
      userData.role = 'user';
    }

    const createdUser = await userService.createUser(userData);

    return NextResponse.json({
      success: true,
      user: createdUser,
      message: `User ${createdUser.name} created successfully!`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
