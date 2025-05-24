import { NextRequest, NextResponse } from 'next/server';
import { getMcpoEndpoint, MCPO_HEADERS } from '@/lib/mcpo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { log_file_path, tail_lines = 100 } = body;

    console.log(`🔍 Fetching logs using MCP Unraid function: ${log_file_path} (${tail_lines} lines)`);

    // Note: Using direct API for now, could integrate MCP tools later if available in runtime
    const response = await fetch(getMcpoEndpoint('get_logs'), {
      method: 'POST',
      headers: MCPO_HEADERS,
      body: JSON.stringify({
        log_file_path,
        tail_lines
      })
    });

    const data = await response.json();
    console.log(`📄 Full Unraid response:`, JSON.stringify(data, null, 2));
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Data type: ${typeof data}`);
    console.log(`📊 Data keys: ${Object.keys(data)}`);
    
    // Handle different response formats and convert to expected frontend format
    let logLines: string[] = [];
    
    if (typeof data === 'string') {
      console.log('📄 Response is a string, splitting into lines');
      logLines = data.split('\n').filter((line: string) => line.trim());
    } else if (data && typeof data === 'object') {
      console.log(`📊 Response is object with keys: ${Object.keys(data)}`);
      
      if (data.content && typeof data.content === 'string') {
        // MCP Unraid format with content field
        console.log('📄 Found content field, splitting into lines');
        logLines = data.content.split('\n').filter((line: string) => line.trim());
      } else if (data.logs && Array.isArray(data.logs)) {
        // Already in logs array format
        console.log('📄 Found logs array');
        logLines = data.logs;
      } else if (data.result && typeof data.result === 'string') {
        // Sometimes wrapped in result field
        console.log('📄 Found result field, splitting into lines');
        logLines = data.result.split('\n').filter((line: string) => line.trim());
      }
    }
    
    console.log(`📊 Processed ${logLines.length} log lines`);
    
    // Return standardized format for frontend
    return NextResponse.json({ 
      success: true, 
      logs: logLines, 
      total_lines: logLines.length,
      source_data: data  // Keep original data for debugging
    });
  } catch (error) {
    console.error('💥 Error in logs API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
} 