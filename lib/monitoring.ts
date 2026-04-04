import prisma from './prisma';
import { SystemMetricType } from '@prisma/client';

export type SystemMetricInput = {
  type: 'API_REQUEST' | 'DB_QUERY' | 'ERROR_LOG' | 'SYSTEM_HEALTH';
  value: number;
  name: string;
  tags?: Record<string, string | number | boolean>;
};

export async function logMetric(metric: SystemMetricInput) {
  try {
    // We intentionally don't await this to avoid blocking the main request flow
    // In a real production system, this might push to a queue (Redis/SQS)
    await prisma.systemMetric.create({
      data: {
        type: metric.type as SystemMetricType,
        value: metric.value,
        name: metric.name,
        tags: metric.tags || {},
      },
    });
  } catch (error) {
    console.error('Failed to log system metric:', error);
    // Fail silently to not impact user experience
  }
}

export async function getMetrics(
  type: SystemMetricType,
  range: '1h' | '24h' | '7d' = '24h'
) {
  const now = new Date();
  let startDate = new Date();

  switch (range) {
    case '1h':
      startDate.setHours(now.getHours() - 1);
      break;
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
  }

  return prisma.systemMetric.findMany({
    where: {
      type,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

// Helper to log API duration
export function measureApiDuration(startTime: number) {
  const duration = Date.now() - startTime;
  return duration;
}
