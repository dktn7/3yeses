import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";
import os from "os";

export async function GET(req: NextRequest) {
  try {
    // 1. Robust Admin Authorization
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get("range") || "24h"; // 1h, 24h, 7d
    
    // Calculate start date based on range
    const now = new Date();
    const startDate = new Date();
    let interval = "hour"; // default for 24h
    
    if (range === "1h") {
      startDate.setHours(now.getHours() - 1);
      interval = "minute";
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
      interval = "day";
    } else {
      startDate.setHours(now.getHours() - 24);
      interval = "hour";
    }

    // 2. Database Health Check (Real-time)
    const dbStart = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      console.error("DB Health Check Failed", e);
    }
    const dbLatency = Math.round(performance.now() - dbStart);
    const dbStatus = dbLatency < 100 ? "Healthy" : dbLatency < 500 ? "Degraded" : "Critical";

    // 3. System Info (Real-time from Node/OS)
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const uptimeSeconds = process.uptime();

    // Calculate CPU usage percentage from load average
    const cpuCount = cpus.length;
    const cpuLoadPercent = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100));

    // Memory info
    const memoryUsedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    // 4. Aggregated Metrics (Graphs)
    const trafficData: { time: Date; count: bigint }[] = await prisma.$queryRaw`
      SELECT date_trunc(${interval}, "createdAt") as time, count(*) as count
      FROM "SystemMetric"
      WHERE "type" = 'API_REQUEST' AND "createdAt" >= ${startDate}
      GROUP BY time
      ORDER BY time ASC
    `;

    const latencyData: { time: Date; value: number }[] = await prisma.$queryRaw`
      SELECT date_trunc(${interval}, "createdAt") as time, AVG("value") as value
      FROM "SystemMetric"
      WHERE "type" = 'API_REQUEST' AND "createdAt" >= ${startDate}
      GROUP BY time
      ORDER BY time ASC
    `;

    const errorData: { time: Date; count: bigint }[] = await prisma.$queryRaw`
      SELECT date_trunc(${interval}, "createdAt") as time, count(*) as count
      FROM "SystemMetric"
      WHERE "type" = 'ERROR_LOG' AND "createdAt" >= ${startDate}
      GROUP BY time
      ORDER BY time ASC
    `;

    // 5. Summary Stats
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const activeSessionsCount = await prisma.userSession.count({
      where: {
        lastActiveAt: { gte: fifteenMinutesAgo }
      }
    });

    const totalRequests = await prisma.systemMetric.count({
      where: {
        type: "API_REQUEST",
        createdAt: { gte: startDate }
      }
    });
    
    const totalErrors = await prisma.systemMetric.count({
      where: {
        type: "ERROR_LOG",
        createdAt: { gte: startDate }
      }
    });

    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const successRate = 100 - errorRate;

    // 6. Database stats
    const totalUsers = await prisma.user.count();
    const totalProfiles = await prisma.talentProfile.count();

    // Helper to format date for chart
    const formatTime = (date: Date) => {
      if (range === '1h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (range === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatChartData = (data: { time: Date; [key: string]: unknown }[], valueKey: string = 'count') => {
      return data.map(item => ({
        time: formatTime(new Date(item.time)),
        value: Number(item[valueKey] || 0)
      }));
    };

    return NextResponse.json({
      summary: {
        uptime: parseFloat(successRate.toFixed(2)),
        avgLatency: latencyData.length > 0 ? Math.round(Number(latencyData[latencyData.length - 1]?.value) || 0) : 0,
        activeUsers: activeSessionsCount,
        dbStatus,
        dbLatency,
        totalRequests,
        totalErrors,
        errorRate: parseFloat(errorRate.toFixed(2)),
      },
      system: {
        nodeVersion: process.version,
        platform: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        hostname: os.hostname(),
        cpuModel: cpus[0]?.model || 'Unknown',
        cpuCount,
        cpuLoadPercent,
        loadAverage: loadAvg.map(l => parseFloat(l.toFixed(2))),
        memoryUsedPercent,
        totalMemoryGB: parseFloat((totalMem / 1024 / 1024 / 1024).toFixed(2)),
        freeMemoryGB: parseFloat((freeMem / 1024 / 1024 / 1024).toFixed(2)),
        heapUsedMB,
        heapTotalMB,
        rssMB,
        processUptime: Math.round(uptimeSeconds),
        osUptime: Math.round(os.uptime()),
      },
      database: {
        totalUsers,
        totalProfiles,
        status: dbStatus,
        latency: dbLatency,
      },
      charts: {
        traffic: formatChartData(trafficData, 'count'),
        latency: formatChartData(latencyData, 'value'),
        errors: formatChartData(errorData, 'count'),
      }
    });

  } catch (error) {
    console.error("Error fetching system metrics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
