/**
 * Individual User Management API
 * Get, update, or delete a specific user
 */

import { NextResponse } from 'next/server';
import { UserManagementService, UserData } from '../../../../../lib/ghl/user-service';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Get user by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userService = new UserManagementService();
    const user = await userService.getUser(params.id);

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * PUT - Update user
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userService = new UserManagementService();
    const updates: Partial<UserData> = await request.json();
    const user = await userService.updateUser(params.id, updates);

    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * DELETE - Delete user
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userService = new UserManagementService();
    await userService.deleteUser(params.id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
