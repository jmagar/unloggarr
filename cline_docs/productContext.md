# Product Context

## Project Name
**unloggar** - AI-Powered Unraid Log Analyzer

## Why This Project Exists
This project solves the critical problem of Unraid server monitoring and log analysis by providing automated AI-powered insights with proactive alerting. Unraid systems generate extensive logs across multiple services, making manual monitoring impractical for system administrators.

## What Problems It Solves

### **Primary Problems:**
- **Unraid Log Complexity**: Unraid generates logs across 13+ different sources (syslog, docker, graphql-api, tailscale, etc.)
- **Manual Monitoring Burden**: System administrators can't continuously monitor logs for issues
- **Alert Fatigue**: Generic monitoring solutions create too many false positives
- **Context Loss**: Traditional log viewers don't provide AI-powered insights and recommendations
- **Reactive vs Proactive**: Most solutions only alert after problems become critical

### **Specific Solutions:**
- **Intelligent Log Analysis**: AI categorizes and prioritizes issues automatically
- **Smart Notifications**: Context-aware alerts via Gotify with appropriate priority levels
- **Automated Monitoring**: Hourly scheduled analysis without manual intervention
- **Real-Time Connection**: Live integration with Unraid servers via MCP protocol
- **Cost Awareness**: Token usage tracking for AI analysis costs

## How It Actually Works

### **Core Workflow:**
1. **Live Connection**: Connects to Unraid server via GraphQL API through MCP protocol
2. **Smart Sampling**: Intelligently samples up to 1000 log entries (prioritizing errors/warnings)
3. **AI Analysis**: Claude 3.5 Sonnet analyzes logs for health, errors, warnings, and recommendations
4. **Priority Assessment**: Automatically determines notification priority based on findings
5. **Proactive Alerting**: Sends Gotify notifications with appropriate urgency levels
6. **Real-Time UI**: Provides web interface for manual analysis and system monitoring

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

## Unique Value Proposition
**"The only AI-powered Unraid log analyzer that proactively monitors your system health and sends intelligent alerts, eliminating the need for manual log checking while preventing downtime through early issue detection."**

## Success Metrics
- **Reduced Manual Monitoring**: Eliminates need for daily log checking
- **Early Issue Detection**: Catches problems before they cause service interruption  
- **Intelligent Alerting**: Only sends notifications for actionable issues
- **Cost Efficiency**: Provides AI insights while tracking and optimizing token usage
- **Zero Maintenance**: Runs autonomously once configured 