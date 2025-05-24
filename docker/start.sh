#!/bin/bash
set -e

echo "🚀 Starting unloggarr container..."

# Function to handle shutdown gracefully
cleanup() {
    echo "📢 Shutting down services..."
    if [ ! -z "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null || true
        wait $MCP_PID 2>/dev/null || true
        echo "🔌 MCP server stopped"
    fi
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
        wait $WEB_PID 2>/dev/null || true
        echo "🌐 Web server stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Validate required environment variables
if [ -z "$UNRAID_API_URL" ] || [ -z "$UNRAID_API_KEY" ]; then
    echo "❌ ERROR: UNRAID_API_URL and UNRAID_API_KEY must be set"
    exit 1
fi

echo "📡 Starting Python MCP server..."
cd /app/unraid-mcp
source .venv/bin/activate
python unraid-mcp-server.py &
MCP_PID=$!

# Wait a moment for MCP server to start
sleep 3

# Check if MCP server is running
if ! kill -0 $MCP_PID 2>/dev/null; then
    echo "❌ ERROR: MCP server failed to start"
    exit 1
fi

echo "✅ MCP server started (PID: $MCP_PID)"

echo "🌐 Starting Next.js web server..."
cd /app
pnpm start &
WEB_PID=$!

# Wait a moment for web server to start
sleep 3

# Check if web server is running
if ! kill -0 $WEB_PID 2>/dev/null; then
    echo "❌ ERROR: Web server failed to start"
    cleanup
    exit 1
fi

echo "✅ Web server started (PID: $WEB_PID)"

# Auto-start scheduler if configured
if [ ! -z "$unloggarr_SCHEDULE" ]; then
    echo "⏰ Starting scheduler with cron: $unloggarr_SCHEDULE"
    sleep 2  # Give web server time to fully start
    curl -s -X POST -H "Content-Type: application/json" \
         -d '{"action": "start"}' \
         http://localhost:3000/api/schedule > /dev/null 2>&1 || \
         echo "⚠️  Warning: Could not auto-start scheduler (will be available manually)"
    echo "✅ Scheduler auto-start completed"
fi

echo "🎉 unloggarr is ready!"
echo "📊 Web UI: http://localhost:3000"
echo "🔧 MCP Server: http://localhost:6970/mcp"
echo "🌉 MCPO Proxy: http://localhost:8000 (separate container)"

# Wait for either process to exit
wait $MCP_PID $WEB_PID 