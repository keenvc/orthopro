import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const deployments = await prisma.deployments.findMany({
      include: {
        deployment_logs: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        deployment_stats: {
          orderBy: { stat_date: 'desc' },
          take: 7,
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const deployment = await prisma.deployments.create({
      data: {
        name: body.name,
        display_name: body.display_name,
        url: body.url,
        health_check_url: body.health_check_url,
        platform: body.platform || 'render',
        repository_url: body.repository_url,
        branch: body.branch || 'main',
        environment: body.environment || 'production',
        notes: body.notes,
        metadata: body.metadata || {},
      },
    });

    await prisma.deployment_logs.create({
      data: {
        deployment_id: deployment.id,
        log_type: 'created',
        message: `Deployment ${deployment.display_name} created`,
      },
    });

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 });
  }
}
