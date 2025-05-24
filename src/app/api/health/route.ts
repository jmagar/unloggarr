import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - could add more comprehensive checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        webui: 'running' as string,
        mcp: 'checking' as string
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
    } catch {
      health.services.mcp = 'unreachable';
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 