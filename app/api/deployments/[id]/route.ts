import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Lazy-load Prisma client
function getPrisma() {
  return new PrismaClient();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const deployment = await prisma.deployments.findUnique({
      where: { id: params.id },
      include: {
        deployment_logs: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
        deployment_stats: {
          orderBy: { stat_date: 'desc' },
          take: 30,
        },
      },
    });

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json({ error: 'Failed to fetch deployment' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    
    const deployment = await prisma.deployments.update({
      where: { id: params.id },
      data: body,
    });

    await prisma.deployment_logs.create({
      data: {
        deployment_id: deployment.id,
        log_type: 'updated',
        message: `Deployment ${deployment.display_name} updated`,
        metadata: body,
      },
    });

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error updating deployment:', error);
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    await prisma.deployments.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Deployment deleted successfully' });
  } catch (error) {
    console.error('Error deleting deployment:', error);
    return NextResponse.json({ error: 'Failed to delete deployment' }, { status: 500 });
  }
}
