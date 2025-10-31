import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Lazy-load Prisma client
function getPrisma() {
  return new PrismaClient();
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const deployment = await prisma.deployments.findUnique({
      where: { id: params.id },
    });

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    const healthCheckUrl = deployment.health_check_url || deployment.url;
    const startTime = Date.now();
    
    let healthStatus = 'unknown';
    let responseTimeMs = 0;
    let errorMessage = null;

    try {
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      });
      
      responseTimeMs = Date.now() - startTime;
      healthStatus = response.ok ? 'healthy' : 'unhealthy';
      
      if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error: any) {
      responseTimeMs = Date.now() - startTime;
      healthStatus = 'unhealthy';
      errorMessage = error.message || 'Health check failed';
    }

    await prisma.deployments.update({
      where: { id: params.id },
      data: {
        health_status: healthStatus,
        last_health_check: new Date(),
      },
    });

    await prisma.deployment_logs.create({
      data: {
        deployment_id: deployment.id,
        log_type: 'health_check',
        message: errorMessage || `Health check completed: ${healthStatus}`,
        metadata: {
          status: healthStatus,
          response_time_ms: responseTimeMs,
          error: errorMessage,
        },
      },
    });

    const today = new Date().toISOString().split('T')[0];
    const existingStats = await prisma.deployment_stats.findUnique({
      where: {
        deployment_id_stat_date: {
          deployment_id: deployment.id,
          stat_date: new Date(today),
        },
      },
    });

    if (existingStats) {
      const totalRequests = existingStats.total_requests + 1;
      const successCount = healthStatus === 'healthy' ? existingStats.success_count + 1 : existingStats.success_count;
      const errorCount = healthStatus === 'unhealthy' ? existingStats.error_count + 1 : existingStats.error_count;

      await prisma.deployment_stats.update({
        where: { id: existingStats.id },
        data: {
          total_requests: totalRequests,
          success_count: successCount,
          error_count: errorCount,
          uptime_percentage: (successCount / totalRequests) * 100,
          response_time_ms: responseTimeMs,
        },
      });
    } else {
      await prisma.deployment_stats.create({
        data: {
          deployment_id: deployment.id,
          stat_date: new Date(today),
          total_requests: 1,
          success_count: healthStatus === 'healthy' ? 1 : 0,
          error_count: healthStatus === 'unhealthy' ? 1 : 0,
          uptime_percentage: healthStatus === 'healthy' ? 100 : 0,
          response_time_ms: responseTimeMs,
        },
      });
    }

    return NextResponse.json({
      deployment_id: deployment.id,
      health_status: healthStatus,
      response_time_ms: responseTimeMs,
      error: errorMessage,
      checked_at: new Date(),
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    return NextResponse.json({ error: 'Failed to perform health check' }, { status: 500 });
  }
}
