import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔍 Returning curated list of available Unraid log files...');

    // Based on the actual MCP response, here are the useful log files available on the Unraid server
    // Filtered to exclude empty files, compressed files, and binary logs
    const availableLogFiles = [
      '/var/log/syslog',        // Current system log (664KB)
      '/var/log/syslog.1',      // Previous system log (1.1MB) 
      '/var/log/syslog.2',      // Older system log (1MB)
      '/var/log/dmesg',         // Kernel messages (87KB)
      '/var/log/docker.log',    // Docker daemon log (42KB)
      '/var/log/graphql-api.log', // GraphQL API log (565KB)
      '/var/log/tailscale.log', // Tailscale VPN log (720KB)
      '/var/log/tailscale-utils.log', // Tailscale utilities log (11KB)
      '/var/log/vfio-pci',      // VFIO PCI device log (1.5KB)
      '/var/log/vfio-pci-errors', // VFIO PCI errors (195B)
      '/var/log/gitflash',      // Git flash log (5KB)
      '/var/log/gitflash1',     // Git flash extended log (100KB)
      '/var/log/gitcount'       // Git count log (77B)
    ].sort(); // Sort alphabetically for better UX

    console.log(`✅ Returning ${availableLogFiles.length} available log files:`, availableLogFiles);

    return NextResponse.json({
      success: true,
      available_logs: availableLogFiles
    });
  } catch (error) {
    console.error('💥 Error in available-logs API route:', error);
    // Minimal fallback if something goes wrong
    return NextResponse.json({
      success: true,
      available_logs: ['/var/log/syslog']
    });
  }
} 