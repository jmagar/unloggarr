# Tech Context

## Technologies Used

### Frontend Stack
- **Next.js 15.1.8**: React framework with App Router
- **React 19**: Latest React version with concurrent features
- **TypeScript**: Full type safety throughout application
- **Tailwind CSS 4**: Modern utility-first CSS framework (alpha features)
- **Vercel AI SDK 5.0.0-alpha.4**: AI integration with streaming capabilities
- **Lucide React**: Modern icon library
- **Date-fns**: Date manipulation and formatting

### Backend Stack
- **Python 3.11**: MCP server runtime
- **FastMCP**: Model Context Protocol server implementation
- **FastAPI**: High-performance async web framework
- **Uvicorn**: ASGI server for Python applications
- **httpx**: Modern HTTP client for Python
- **python-dotenv**: Environment variable management

### AI & API Integration
- **Anthropic Claude 3.5 Sonnet**: Primary AI model for log analysis
- **OpenAI-compatible API**: Via Anthropic's API interface
- **Streaming Responses**: Real-time AI analysis delivery
- **Token Usage Tracking**: Cost monitoring and optimization

### Infrastructure & Deployment
- **Docker**: Containerization platform
- **Docker Compose**: Multi-service orchestration
- **MCPO (Model Context Protocol OpenAPI)**: REST API proxy for MCP
- **Multi-stage Builds**: Optimized container images
- **uv**: Fast Python package installer and manager

### Database & Storage
- **No Database Required**: Stateless application design
- **Environment Variables**: Configuration management
- **Volume Mounting**: Development file synchronization
- **Temporary Storage**: In-memory log processing

### Communication Protocols
- **MCP (Model Context Protocol)**: Server-Sent Events for real-time communication
- **GraphQL**: Unraid server API integration
- **REST API**: HTTP endpoints for all operations
- **Server-Sent Events**: Real-time streaming communication

### Monitoring & Notifications
- **Gotify**: Push notification system
- **Node.js Cron**: Scheduled task execution
- **Health Checks**: Container and service monitoring
- **Connection Status**: Real-time connectivity monitoring

## Development Setup

### Prerequisites
- **Docker Desktop**: For containerized development
- **WSL2**: Linux environment on Windows (if applicable)
- **pnpm**: Package manager (faster than npm/yarn)
- **Node.js 20+**: JavaScript runtime
- **Python 3.11+**: For MCP server development

### Environment Configuration
```bash
# Required environment variables in .env.local
UNRAID_API_URL=https://your-unraid-server/graphql
UNRAID_API_KEY=your-unraid-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOTIFY_URL=https://your-gotify-server
GOTIFY_TOKEN=your-gotify-app-token
MCPO_BASE_URL=http://unloggarr-mcpo:8000/unraid-mcp
unloggarr_SCHEDULE="0 */1 * * *"  # Hourly cron
```

### Development Commands
```bash
# Container development
docker compose up -d              # Start all services
docker compose logs -f unloggar   # View logs
docker compose down              # Stop services

# Local development (frontend only)
pnpm dev                        # Start Next.js dev server
pnpm build                      # Production build
pnpm type-check                 # TypeScript checking
```

### Port Configuration
- **3000**: Next.js web interface
- **6970**: Python MCP server (SSE)
- **8000**: MCPO OpenAPI proxy
- **Internal networking**: Container-to-container communication

## Technical Constraints

### Platform Requirements
- **Docker Environment**: Required for full functionality
- **Network Access**: Unraid server must be accessible
- **SSL Configuration**: Self-signed certificate support
- **Resource Usage**: Moderate CPU/memory for AI analysis

### API Limitations
- **Anthropic Rate Limits**: API usage within plan limits
- **Token Costs**: AI analysis costs per API call
- **Unraid API**: GraphQL endpoint availability required
- **Gotify Server**: Push notification service dependency

### Architecture Constraints
- **Single Tenant**: One Unraid server per deployment
- **Stateless Design**: No persistent data storage
- **Container Dependencies**: Services must start in correct order
- **Environment Variables**: Secure credential management required

### Security Considerations
- **API Key Management**: Secure environment variable handling
- **Network Isolation**: Container network segmentation
- **SSL Verification**: Configurable for self-signed certificates
- **No External Dependencies**: Self-contained deployment (post-migration)

### Performance Constraints
- **Log Sampling**: 1000 log entry limit for AI analysis
- **Memory Usage**: In-memory log processing
- **Concurrent Requests**: Single-threaded MCP server
- **Container Resources**: Docker resource allocation

### Development Constraints
- **WSL2 Compatibility**: File mounting and permissions
- **Hot Reload**: Volume mounting for development
- **Type Safety**: Full TypeScript coverage required
- **Container First**: Development matches production environment

## Deployment Architecture

### Container Services
```yaml
unloggar:
  - Next.js frontend (port 3000)
  - Python MCP server (port 6970)
  - Multi-stage Dockerfile
  - Environment file mounting

unloggarr-mcpo:
  - MCPO OpenAPI proxy (port 8000)
  - MCP protocol to REST API bridge
  - SSE to HTTP conversion
```

### Network Configuration
- **Internal Docker Network**: Service-to-service communication
- **Port Exposure**: Only necessary ports exposed
- **Environment Variables**: Secure credential injection
- **Health Checks**: Container health monitoring

### Migration Strategy
- **External Dependency Removal**: Eliminating mcpo.tootie.tv
- **Local Service Replacement**: Self-hosted MCPO proxy
- **Zero Downtime**: Dual endpoint support during transition
- **Configuration Compatibility**: Existing .env.local support

## Technology Decisions

### Why These Technologies?
- **Next.js 15.1.8**: Latest React features with excellent TypeScript support
- **Tailwind CSS 4**: Modern utility-first approach with alpha features
- **FastMCP**: Official MCP implementation for Python
- **Claude 3.5 Sonnet**: Superior log analysis capabilities
- **Docker Compose**: Simple multi-service deployment
- **TypeScript**: Type safety and developer experience

### Alternative Considerations
- **Other AI Models**: GPT-4 considered but Claude preferred for technical analysis
- **Database Options**: Evaluated but stateless design chosen for simplicity
- **Frontend Frameworks**: Next.js chosen for excellent API integration
- **Container Orchestration**: Kubernetes considered but Docker Compose sufficient

## API Configuration Management

### Base URL Configuration
- **Environment Variable**: `MCPO_BASE_URL` for flexible endpoint configuration
- **Utility Functions**: `getMcpoEndpoint()` and `MCPO_HEADERS` for consistent API calls
- **Multiple Environments**: Support for development, container, and external endpoints

### API Endpoints Used
- **get_logs**: Primary log fetching endpoint
- **get_notifications_overview**: Notification summary data
- **list_notifications**: Detailed notification listings
- **Additional MCP Tools**: 16+ Unraid management functions available

## Future Technology Considerations
- **Multi-Model Support**: OpenAI GPT integration planned
- **Database Integration**: Potential historical data storage
- **Message Queues**: For high-volume log processing
- **Kubernetes**: For large-scale deployments
- **Monitoring Tools**: Prometheus/Grafana integration 