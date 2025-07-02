import { NextResponse } from 'next/server';

// Simple performance tracking for health checks
const healthMetrics = {
  requestCount: 0,
  lastCheck: new Date(),
  averageResponseTime: 0,
  errorCount: 0,
  responseTimes: [] as number[]
};

export async function GET() {
  const startTime = Date.now();
  healthMetrics.requestCount++;
  
  try {
    // Basic health check with performance metrics
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        webui: 'running' as string,
        mcp: 'checking' as string
      },
      performance: {
        requestCount: healthMetrics.requestCount,
        errorCount: healthMetrics.errorCount,
        averageResponseTime: Math.round(healthMetrics.averageResponseTime)
      }
    };

    // Optional: Check if MCP server is responding
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const mcpResponse = await fetch('http://localhost:6970/mcp', {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      health.services.mcp = mcpResponse.ok ? 'running' : 'degraded';
      
      if (!mcpResponse.ok) {
        healthMetrics.errorCount++;
      }
    } catch {
      health.services.mcp = 'unreachable';
      healthMetrics.errorCount++;
    }

    // Track response time
    const responseTime = Date.now() - startTime;
    healthMetrics.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (healthMetrics.responseTimes.length > 100) {
      healthMetrics.responseTimes.shift();
    }
    
    // Calculate average response time
    healthMetrics.averageResponseTime = 
      healthMetrics.responseTimes.reduce((a, b) => a + b, 0) / healthMetrics.responseTimes.length;
    
    healthMetrics.lastCheck = new Date();
    
    // Update performance metrics in response
    health.performance.averageResponseTime = Math.round(healthMetrics.averageResponseTime);
    health.performance.errorCount = healthMetrics.errorCount;

    return NextResponse.json(health);
  } catch (error) {
    healthMetrics.errorCount++;
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        performance: {
          requestCount: healthMetrics.requestCount,
          errorCount: healthMetrics.errorCount,
          averageResponseTime: Math.round(healthMetrics.averageResponseTime)
        }
      },
      { status: 500 }
    );
  }
} 