# Unraid MCP Server

This server provides an MCP interface to interact with an Unraid server's GraphQL API.

## Setup

1.  Ensure your main project dependencies (including `fastmcp`, `python-dotenv`, `httpx`) are installed (typically via `uv pip install -e .` from the project root, which uses `pyproject.toml`).
2.  Navigate to this directory: `cd src/unraid-mcp`
3.  Copy `.env.example` to `.env`: `cp .env.example .env`
4.  Edit `.env` and fill in your Unraid and MCP server details:
    *   `UNRAID_API_URL`: Your Unraid GraphQL endpoint (e.g., `http://your-unraid-ip/graphql`).
    *   `UNRAID_API_KEY`: Your Unraid API key.
    *   `UNRAID_MCP_TRANSPORT` (optional, defaults to `sse`). Valid options: `sse`, `stdio`.
    *   `UNRAID_MCP_HOST` (optional, defaults to `0.0.0.0` for SSE, listens on all interfaces).
    *   `UNRAID_MCP_PORT` (optional, defaults to `6970` for SSE).
    *   `UNRAID_MCP_LOG_LEVEL` (optional, defaults to `INFO`). Examples: `DEBUG`, `INFO`, `WARNING`, `ERROR`.
    *   `UNRAID_MCP_LOG_FILE` (optional, defaults to `unraid-mcp.log` in the `src/unraid-mcp/` directory).
    *   `UNRAID_VERIFY_SSL` (optional, defaults to `true`. Set to `false` for self-signed certificates, or provide a path to a CA bundle).

## Running the Server

From the project root (`yarr-mcp/`):

```bash
python src/unraid-mcp/unraid-mcp-server.py
```

Or from `src/unraid-mcp/`:

```bash
python unraid-mcp-server.py
```

The server will start, by default using SSE transport on port 6970.

## Implemented Tools

Below is a list of the implemented tools and their basic functions. 
Refer to the Unraid GraphQL schema for detailed response structures.

*   `get_system_info()`: Retrieves comprehensive system, OS, CPU, memory, and hardware information.
*   `get_array_status()`: Gets the current status of the storage array, capacity, and disk details.
*   `list_docker_containers(skip_cache: Optional[bool] = False)`: Lists all Docker containers.
*   `manage_docker_container(container_id: str, action: str)`: Starts or stops a Docker container (action: "start" or "stop").
*   `get_docker_container_details(container_identifier: str)`: Gets detailed info for a specific Docker container by ID or name.
*   `list_vms()`: Lists all Virtual Machines and their states.
*   `manage_vm(vm_id: str, action: str)`: Manages a VM (actions: "start", "stop", "pause", "resume", "forceStop", "reboot").
*   `get_vm_details(vm_identifier: str)`: Gets details for a specific VM by ID or name.
*   `get_shares_info()`: Retrieves information about all user shares.
*   `get_notifications_overview()`: Gets an overview of system notifications (counts by severity/status).
*   `list_notifications(type: str, offset: int, limit: int, importance: Optional[str] = None)`: Lists notifications with filters.
*   `list_available_log_files()`: Lists all available log files.
*   `get_logs(log_file_path: str, tail_lines: Optional[int] = 100)`: Retrieves content from a specific log file (tails last N lines).
*   `list_physical_disks()`: Lists all physical disks recognized by the system.
*   `get_disk_details(disk_id: str)`: Retrieves detailed SMART info and partition data for a specific physical disk.
*   `get_unraid_variables()`: Retrieves a wide range of Unraid system variables and settings.
*   `get_network_config()`: Retrieves network configuration details, including access URLs.
*   `get_registration_info()`: Retrieves Unraid registration details.
*   `get_connect_settings()`: Retrieves settings related to Unraid Connect.

### Claude Desktop Client Configuration

If your Unraid MCP Server is running on `localhost:6970` (the default for SSE):

Create or update your Claude Desktop MCP settings file at `~/.config/claude/claude_mcp_settings.jsonc` (create the `claude` directory if it doesn't exist).
Add or update the entry for this server:

```jsonc
{
  "mcp_servers": {
    "unraid": { // Use a short, descriptive name for the client
      "url": "http://localhost:6970/mcp", // Default path for FastMCP SSE is /mcp
      "disabled": false,
      "timeout": 60, // Optional: timeout in seconds for requests
      "transport": "sse" // Explicitly set transport if not default or for clarity
    }
    // ... other server configurations
  }
}
```

Make sure the `url` matches your `UNRAID_MCP_HOST` and `UNRAID_MCP_PORT` settings if you've changed them from the defaults.

(Details to be added after implementation based on the approved toolset.) 