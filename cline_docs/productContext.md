# Product Context

## Project Name
**unloggar** - AI-Powered Unraid Log Analyzer with Modern UI

## Why This Project Exists
This project solves the critical problem of Unraid server monitoring and log analysis by providing automated AI-powered insights with proactive alerting through a beautiful, modern, and accessible web interface. Unraid systems generate extensive logs across multiple services, making manual monitoring impractical for system administrators.

## What Problems It Solves

### **Primary Problems:**
- **Unraid Log Complexity**: Unraid generates logs across 13+ different sources (syslog, docker, graphql-api, tailscale, etc.)
- **Manual Monitoring Burden**: System administrators can't continuously monitor logs for issues
- **Alert Fatigue**: Generic monitoring solutions create too many false positives
- **Context Loss**: Traditional log viewers don't provide AI-powered insights and recommendations
- **Reactive vs Proactive**: Most solutions only alert after problems become critical
- **Poor User Experience**: Most log analysis tools have outdated, difficult-to-use interfaces
- **Code Maintainability**: Large monolithic codebases become difficult to maintain and extend

### **Specific Solutions:**
- **Intelligent Log Analysis**: AI categorizes and prioritizes issues automatically
- **Smart Notifications**: Context-aware alerts via Gotify with appropriate priority levels
- **Automated Monitoring**: Hourly scheduled analysis without manual intervention
- **Real-Time Connection**: Live integration with Unraid servers via MCP protocol
- **Cost Awareness**: Token usage tracking for AI analysis costs
- **Modern UI/UX**: Beautiful, accessible interface with smooth animations and intuitive design
- **Modular Architecture**: Maintainable, testable codebase with clear separation of concerns

## How It Actually Works

### **Core Workflow:**
1. **Live Connection**: Connects to Unraid server via GraphQL API through MCP protocol
2. **Smart Sampling**: Intelligently samples up to 1000 log entries (prioritizing errors/warnings)
3. **AI Analysis**: Claude 3.5 Sonnet analyzes logs for health, errors, warnings, and recommendations
4. **Priority Assessment**: Automatically determines notification priority based on findings
5. **Proactive Alerting**: Sends Gotify notifications with appropriate urgency levels
6. **Beautiful UI**: Provides modern web interface with enhanced UX for manual analysis and monitoring

### **Automated Scheduling:**
- **Cron-Based**: Configurable analysis schedule (default: hourly)
- **Environment Driven**: UNLOGGAR_SCHEDULE environment variable controls timing
- **Smart Prioritization**: 
  - High Priority (8): Systems with errors detected
  - Medium Priority (6): Multiple warnings present  
  - Normal Priority (5): Healthy system status

### **Technical Integration:**
- **MCP Protocol**: Uses Model Context Protocol for Unraid integration
- **Docker Deployment**: Fully containerized with multi-service architecture
- **RESTful APIs**: MCPO proxy provides OpenAPI endpoints for all MCP tools
- **Streaming AI**: Real-time AI responses with token usage tracking
- **Modular Frontend**: 25+ focused files with clean separation of concerns
- **Enhanced UI/UX**: Modern design system with accessibility and animations

### **User Experience Excellence:**
- **Modern Interface**: Beautiful gradients, smooth transitions, micro-interactions
- **Accessibility**: Screen reader support, keyboard navigation, proper contrast
- **Progressive Enhancement**: Core functionality works, animations enhance experience
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **Loading States**: Skeleton loaders and progress indicators for better UX
- **Empty States**: Helpful messaging and CTAs when no data is available

## Target Users

### **Primary Users:**
- **Unraid System Administrators**: Managing personal or small business Unraid servers
- **Home Lab Enthusiasts**: Power users running Unraid for media servers, storage, virtualization
- **IT Professionals**: Using Unraid in SOHO (Small Office/Home Office) environments

### **Use Cases:**
- **Proactive Monitoring**: Get notified of issues before they become critical
- **System Health Tracking**: Understand overall Unraid system performance trends
- **Error Diagnosis**: AI-powered analysis of complex error patterns
- **Maintenance Planning**: Insights into when systems need attention
- **Cost Management**: Monitor AI analysis costs via token usage tracking
- **Beautiful Experience**: Enjoy using a modern, well-designed interface daily

## Unique Value Proposition
**"The only AI-powered Unraid log analyzer that combines proactive monitoring, intelligent alerts, and a beautiful modern interface - eliminating manual log checking while providing an exceptional user experience that makes system administration enjoyable."**

### **Key Differentiators:**
- **AI-First**: Advanced Claude 3.5 Sonnet analysis with streaming responses
- **Beautiful Design**: Modern UI with gradients, animations, and accessibility
- **Modular Architecture**: Maintainable codebase with 95% reduction in file complexity
- **Zero Configuration**: Works out-of-the-box with Docker Compose
- **Cost Transparent**: Real-time token usage tracking for AI analysis
- **Fully Accessible**: Screen reader support, keyboard navigation, proper contrast

## Success Metrics
- **Reduced Manual Monitoring**: Eliminates need for daily log checking
- **Early Issue Detection**: Catches problems before they cause service interruption  
- **Intelligent Alerting**: Only sends notifications for actionable issues
- **Cost Efficiency**: Provides AI insights while tracking and optimizing token usage
- **Zero Maintenance**: Runs autonomously once configured
- **Developer Productivity**: Modular architecture enables faster feature development
- **User Satisfaction**: Beautiful interface encourages regular system monitoring

## Technical Achievements
- **Massive Refactor**: Successfully decomposed 1112-line monolith into 25+ focused files
- **UI Transformation**: Complete visual overhaul with modern design system
- **Architecture Excellence**: Clean separation of concerns across 5 layers (Types, Utils, Services, Hooks, Components)
- **100% Functionality Preservation**: All features maintained through decomposition
- **Enhanced Accessibility**: WCAG compliance with screen reader and keyboard support
- **Performance Optimized**: Smooth animations without impacting core functionality 