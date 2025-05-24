# System Patterns

## Architecture Overview
The unloggar application follows a modern containerized microservices architecture with AI-powered log analysis capabilities, integrated with Unraid systems via MCP (Model Context Protocol).

## Key Technical Decisions

### Container Architecture
- **Multi-Service Deployment**: Docker Compose orchestration with service separation
- **Service Isolation**: Independent containers for different concerns
- **Internal Networking**: Container-to-container communication via Docker networks
- **Environment Management**: .env.local based configuration across services

### Service Pattern
```
┌─────────────────────────────────────┐
│             unloggar                │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   Next.js   │  │ Python MCP  │   │
│  │   Web UI    │  │   Server    │   │
│  │  Port 3000  │  │ Port 6970   │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
         ↕ HTTP API calls
┌─────────────────┐
│  unloggarr-mcpo │
│  (MCPO Proxy)  │
│   Port 8000     │
└─────────────────┘
```

### Integration Architecture
- **MCP Protocol**: FastMCP for Python-based tool server
- **OpenAPI Proxy**: MCPO for REST API exposure of MCP tools
- **GraphQL Backend**: Unraid server communication via GraphQL API
- **API Proxy Pattern**: Next.js API routes as proxy to avoid CORS issues

### Data Flow Patterns

1. **Real-Time Log Analysis**:
   ```
   Next.js UI → /api/logs → unloggarr-mcpo:8000 → unloggar:6970 → Unraid GraphQL → Response Chain
   ```

2. **AI Analysis Pipeline**:
   ```
   Logs → Smart Sampling → Claude 3.5 Sonnet → Streaming Response → Token Tracking → UI
   ```

3. **Automated Monitoring**:
   ```
   Cron Schedule → Fetch Logs → AI Analysis → Priority Assessment → Gotify Notification
   ```

### Frontend Architecture
- **Next.js 15.1.8**: App Router with React 19 and server components
- **Tailwind CSS 4**: Modern utility-first styling with alpha features
- **TypeScript**: Full type safety throughout the application
- **Streaming UI**: Real-time AI responses with progressive enhancement

### AI Integration Pattern
- **Anthropic Claude**: Primary AI provider via Vercel AI SDK 5.0.0-alpha.4
- **Streaming Responses**: Real-time analysis with progress indicators
- **Token Usage Tracking**: Cost monitoring and consumption analytics
- **Smart Sampling**: Intelligent log sampling (errors prioritized, 1000 log limit)

### Backend Patterns
- **FastMCP Server**: Python-based MCP server with 16+ Unraid management tools
- **HTTP Proxy**: MCPO bridge from MCP protocol to REST API
- **Environment Variables**: Configuration via Docker env_file pattern
- **Error Handling**: Graceful degradation with fallback responses

### Security Patterns
- **API Key Management**: Secure Unraid API key handling via environment variables
- **SSL Configuration**: Configurable SSL verification for self-signed certificates
- **Container Isolation**: Network segmentation via Docker networks
- **No External Dependencies**: Self-contained deployment (post-migration)

### Monitoring & Observability
- **Health Checks**: Built-in Docker health check endpoints
- **Logging**: Structured logging across all services
- **Token Tracking**: AI API usage monitoring and reporting
- **Status Indicators**: Real-time connection status in UI

### Scheduling Pattern
- **Node.js Cron**: Timezone-aware scheduled analysis
- **Environment Configuration**: UNLOGGAR_SCHEDULE cron expression
- **Smart Notifications**: Priority-based Gotify alerts (High=8, Medium=6, Normal=5)
- **Execution Tracking**: Last run, next run, and status monitoring

### State Management
- **React State**: Local component state for UI interactions
- **Server State**: Next.js API routes for server-side data fetching
- **AI State**: Vercel AI SDK built-in state management
- **Container State**: Docker Compose service orchestration

### Error Handling
- **Graceful Degradation**: Fallback UI states for service failures
- **Connection Monitoring**: Real-time Unraid connection status
- **AI Error Recovery**: Retry logic and error message formatting
- **Container Recovery**: Docker restart policies for resilience

## Development Patterns
- **Container-First**: Development and production use same containerized architecture
- **Environment Parity**: .env.local provides consistent configuration
- **API-First**: Design API endpoints before frontend implementation
- **Progressive Enhancement**: Core functionality works, AI enhances the experience
- **TypeScript First**: All code written in TypeScript with strict type checking

## Deployment Patterns
- **Docker Compose**: Simple multi-service deployment
- **Volume Mounting**: Configuration and code mounting for development
- **Environment Files**: Secure credential management
- **Port Mapping**: Selective service exposure (3000, 6970, 8000)
- **Network Isolation**: Services communicate via internal Docker networks

## Migration Strategy
- **External Dependency Elimination**: Migrating from mcpo.tootie.tv to local services
- **Zero-Downtime Transition**: Dual endpoint support during migration
- **Configuration Compatibility**: Maintaining existing .env.local format
- **Service Independence**: Each service can be updated independently 