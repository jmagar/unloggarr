# Tech Context

## Technologies Used

### Frontend Stack
- **Next.js 15.1.8**: React framework with App Router
- **React 19**: Latest React version with concurrent features
- **TypeScript**: Full type safety throughout application with comprehensive coverage
- **Tailwind CSS 4**: Modern utility-first CSS framework (alpha features)
- **Vercel AI SDK 5.0.0-alpha.4**: AI integration with streaming capabilities
- **Lucide React**: Modern icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting

### Frontend Architecture Technologies (NEW)
- **Modular Component System**: 25+ focused files with clear separation of concerns
- **Custom React Hooks**: Encapsulated state logic across 6 specialized hooks (including `useSettings`)
- **TypeScript Interfaces**: Comprehensive type definitions across 5 type files
- **Service Layer**: API communication abstraction with error handling
- **Utility Functions**: Pure functions for parsing, formatting, and theme management

### UI/UX Enhancement Technologies (NEW)
- **CSS Gradients**: Blue-to-purple gradient system throughout interface
- **CSS Transitions**: 200-300ms smooth transitions for all interactive elements
- **CSS Transforms**: Hover scaling effects and micro-interactions
- **CSS Animation**: Shimmer effects for skeleton loading states
- **Accessibility APIs**: ARIA labels, screen reader support, keyboard navigation
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Popovers & Modals**: For improved user experience with notifications and detailed views.

### Backend Stack
- **Python 3.11**: MCP server runtime
- **FastMCP**: Model Context Protocol server implementation (Currently experiencing ASGI runtime errors)
- **FastAPI**: High-performance async web framework (Used by FastMCP)
- **Uvicorn**: ASGI server for Python applications (Used by FastMCP)
- **httpx**: Modern HTTP client for Python
- **python-dotenv**: Environment variable management

### AI & API Integration
- **Anthropic Claude 3.5 Sonnet**: Primary AI model for log analysis
- **OpenAI-compatible API**: Via Anthropic's API interface
- **Streaming Responses**: Real-time AI analysis delivery
- **Token Usage Tracking**: Cost monitoring and consumption analytics (correctly using `inputTokens`/`outputTokens`)

### Infrastructure & Deployment
- **Docker**: Containerization platform
- **Docker Compose**: Multi-service orchestration
- **MCPO (Model Context Protocol OpenAPI)**: REST API proxy for MCP (Currently unable to connect due to MCP server issues)
- **Multi-stage Builds**: Optimized container images
- **uv**: Fast Python package installer and manager

### Database & Storage
- **No Database Required**: Stateless application design
- **localStorage**: For persisting user settings (via `useSettings` hook)
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
MCPO_BASE_URL=http://unloggarr-mcpo:8000/unraid-mcp # Internal Docker network URL
# For local Next.js dev connecting to Dockerized MCPO:
# MCPO_BASE_URL=http://localhost:8000/unraid-mcp
UNLOGGAR_SCHEDULE="0 */1 * * *"  # Hourly cron
# Optional: Define a specific AI model
# AI_MODEL_NAME="claude-3-opus-20240229"
```

### Development Commands
```bash
# Container development
docker compose up --build -d      # Start all services with a fresh build
docker compose logs -f unloggar   # View logs for the main app/MCP server
docker compose logs -f unloggarr-mcpo # View logs for the MCPO proxy
docker compose down              # Stop services

# Local development (frontend only, requires running MCPO proxy separately if needed)
pnpm dev                        # Start Next.js dev server
pnpm build                      # Production build
pnpm type-check                 # TypeScript checking
pnpm lint                       # ESLint checking
```

### Port Configuration
- **3000**: Next.js web interface
- **6970**: Python MCP server (SSE) - within `unloggar` container
- **8000**: MCPO OpenAPI proxy - `unloggarr-mcpo` container
- **Internal networking**: Container-to-container communication

### Modular Development Workflow (NEW)
```bash
# File structure for development
src/
├── types/          # TypeScript definitions (log.ts, notification.ts, etc.)
├── utils/          # Pure utility functions (constants.ts, logParser.ts, dateFormatter.ts, theme.ts)
├── services/       # API communication (logService.ts, etc.)
├── hooks/          # React state logic (useLogs.ts, useSettings.ts, etc.)
└── app/
    └── components/ # UI components
        ├── common/
        ├── Header/
        └── LogViewer/
        └── Modals/
```

## Technical Constraints

### Platform Requirements
- **Docker Environment**: Required for full functionality
- **Network Access**: Unraid server must be accessible by the `unloggar` container.
- **SSL Configuration**: Self-signed certificate support for Unraid connection.
- **Resource Usage**: Moderate CPU/memory for AI analysis.

### API Limitations
- **Anthropic Rate Limits**: API usage within plan limits.
- **Token Costs**: AI analysis costs per API call.
- **Unraid API**: GraphQL endpoint availability required.
- **Gotify Server**: Push notification service dependency.
- **MCP Server Stability**: Current ASGI runtime errors in the Python MCP server are a major constraint.

### Architecture Constraints
- **Single Tenant**: One Unraid server per deployment.
- **Stateless Design**: Application itself is stateless; settings persisted in localStorage.
- **Container Dependencies**: `unloggarr-mcpo` depends on `unloggar` (MCP server part).
- **Environment Variables**: Secure credential management required.

### UI/UX Constraints (NEW)
- **Performance Budget**: Animations must not impact core functionality.
- **Accessibility Requirements**: WCAG 2.1 AA compliance.
- **Browser Support**: Modern browsers with CSS Grid and Flexbox support.
- **Color Contrast**: Minimum 4.5:1 contrast ratio (dark mode previously noted for review).
- **Responsive Breakpoints**: Mobile-first design approach.

### Development Constraints (NEW)
- **Component Size**: Individual files should generally remain under 200-250 lines.
- **Type Safety**: 100% TypeScript coverage required.
- **Hook Dependencies**: Custom hooks should have minimal dependencies.
- **Service Isolation**: Services should not directly depend on UI components.
- **Utility Purity**: Utils must be pure functions with no side effects.

### Security Considerations
- **API Key Management**: Secure environment variable handling.
- **Network Isolation**: Container network segmentation.
- **SSL Verification**: Configurable for self-signed certificates.
- **No External Dependencies**: Self-contained deployment (mcpo.tootie.tv eliminated).

### Performance Constraints
- **Log Sampling**: Up to 10,000 log entries (configurable) for AI analysis, with error/warning prioritization.
- **Memory Usage**: In-memory log processing.
- **Concurrent Requests**: Python MCP server is async but effectively single-threaded per request type.
- **Container Resources**: Docker resource allocation.
- **Animation Performance**: 60fps target for all transitions.

## Deployment Architecture

### Container Services
```yaml
unloggar:
  - Next.js frontend (port 3000)
  - Python MCP server (port 6970) - Currently Unstable
  - Multi-stage Dockerfile
  - Environment file mounting
  - Enhanced with modular architecture

unloggarr-mcpo:
  - MCPO OpenAPI proxy (port 8000)
  - MCP protocol to REST API bridge
  - SSE to HTTP conversion
  - Depends on `unloggar` service for MCP server
```

### Network Configuration
- **Internal Docker Network**: Service-to-service communication (e.g., `http://unloggarr:6970`).
- **Port Exposure**: Only necessary ports exposed (3000 for UI, 8000 for MCPO if direct access needed).
- **Environment Variables**: Secure credential injection.
- **Health Checks**: Container health monitoring.

### Migration Strategy
- **External Dependency Elimination**: Migrated from mcpo.tootie.tv to local services ✅ COMPLETED.
- **Local Service Replacement**: Self-hosted MCPO proxy.
- **Configuration Compatibility**: Maintained existing .env.local format.

## Technology Decisions

### Why These Technologies?
- **Next.js 15.1.8**: Latest React features with excellent TypeScript support, App Router.
- **Tailwind CSS 4**: Modern utility-first approach with alpha features.
- **FastMCP**: Official MCP implementation for Python.
- **Claude 3.5 Sonnet**: Superior log analysis capabilities.
- **Docker Compose**: Simple multi-service deployment.
- **TypeScript**: Type safety and developer experience.
- **Modular Architecture**: Maintainability and testability.
- **Custom Hooks (6)**: Encapsulated state logic for reusability, including `useSettings`.

### Architecture Decisions (NEW)
- **6-Layer Structure**: Clear separation of concerns (Types → Utils → Services → Hooks → Components).
- **Component Decomposition**: Transformed 1112-line monolith for maintainability.
- **Hook-Based State**: Custom hooks instead of context for better performance and encapsulation.
- **Service Abstraction**: API layer abstraction for easier testing and mocking.
- **Utility Separation**: Pure functions for parsing and formatting logic.

### UI/UX Decisions (NEW)
- **Gradient System**: Blue-to-purple gradients for modern aesthetic.
- **Animation Timing**: 200-300ms transitions for optimal user experience.
- **Accessibility First**: Screen readers and keyboard navigation as primary concerns.
- **Progressive Enhancement**: Core functionality works, animations enhance.
- **Mobile Responsive**: Mobile-first design approach.

### Alternative Considerations
- **Other AI Models**: GPT-4 considered but Claude preferred for technical analysis.
- **Database Options**: Evaluated but stateless design (with localStorage for settings) chosen for simplicity.
- **Frontend Frameworks**: Next.js chosen for excellent API integration and React ecosystem.
- **Container Orchestration**: Kubernetes considered but Docker Compose sufficient for this scale.
- **State Management**: Redux/Zustand considered but custom hooks chosen for simplicity and co-location of logic.
- **CSS Framework**: Styled Components considered but Tailwind chosen for utility-first approach.

## API Configuration Management

### Base URL Configuration
- **Environment Variable**: `MCPO_BASE_URL` for flexible endpoint configuration.
- **Utility Functions**: `getMcpoBaseUrl()` (from constants) and `MCPO_HEADERS` for consistent API calls.
- **Multiple Environments**: Support for development (localhost) and container (service name) URLs.

### API Endpoints Used
- **get_logs**: Primary log fetching endpoint (via MCPO).
- **get_notifications_overview**: Notification summary data (via MCPO).
- **list_notifications**: Detailed notification listings (via MCPO).
- **Additional MCP Tools**: 16+ Unraid management functions available via MCPO.

## Component Architecture (NEW)

### Component Design Patterns
- **Single Responsibility**: Each component has one clear purpose.
- **Composition Over Inheritance**: Components composed of smaller components.
- **Props Interface**: TypeScript interfaces for all component props.
- **Default Props**: Sensible defaults for optional props.
- **Error Boundaries**: Graceful error handling at component level (potential future enhancement).

### Hook Design Patterns
- **Custom Hooks (6)**: Encapsulated state logic with clear interfaces (e.g., `useLogs`, `useSettings`).
- **Dependency Management**: Minimal dependencies between hooks.
- **Return Objects**: Consistent return patterns across hooks.
- **Error Handling**: Built-in error states and recovery mechanisms.
- **Performance**: Optimized with `useMemo` and `useCallback` where appropriate.

### Service Layer Patterns
- **Error Handling**: Consistent error response formatting and propagation.
- **Type Safety**: Full TypeScript coverage for all service methods.
- **API Abstraction**: Services abstract away API implementation details (e.g., MCPO calls).
- **Retry Logic**: Potential for built-in retry for transient failures (currently handled by UI where needed).
- **Response Transformation**: Consistent data structures from APIs.

## Future Technology Considerations
- **Multi-Model Support**: OpenAI GPT integration planned.
- **Database Integration**: Potential historical data storage (e.g., SQLite, Postgres).
- **Message Queues**: For high-volume log processing (e.g., Redis, RabbitMQ).
- **Kubernetes**: For large-scale deployments or more complex orchestration.
- **Monitoring Tools**: Prometheus/Grafana integration for deeper system insights.
- **Testing Framework**: Jest and React Testing Library for component tests.
- **E2E Testing**: Playwright for end-to-end testing.
- **Performance Monitoring**: Web Vitals and performance budgets.