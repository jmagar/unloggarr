"""
MCP Server for Unraid API
Implements the approved tool set from the design phase.
Built with FastMCP following best practices.
Transport: SSE
"""
import os
import sys
import json
import logging
import httpx
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
from logging.handlers import RotatingFileHandler

from dotenv import load_dotenv
from fastmcp import FastMCP
from fastapi.middleware.cors import CORSMiddleware

# Ensure the script's directory is in the Python path for potential local imports if structured differently
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

# Load environment variables from .env file
# In container: First try /app/.env.local (mounted), then project root .env
dotenv_paths = [
    Path('/app/.env.local'),  # Container mount point
    SCRIPT_DIR.parent / '.env.local',  # Project root .env.local
    SCRIPT_DIR.parent / '.env',  # Project root .env
    SCRIPT_DIR / '.env'  # Local .env in unraid-mcp/
]

for dotenv_path in dotenv_paths:
    if dotenv_path.exists():
        load_dotenv(dotenv_path=dotenv_path)
        break

# Configuration
UNRAID_API_URL = os.getenv("UNRAID_API_URL")
UNRAID_API_KEY = os.getenv("UNRAID_API_KEY")
UNRAID_MCP_PORT = int(os.getenv("UNRAID_MCP_PORT", "6970"))
UNRAID_MCP_HOST = os.getenv("UNRAID_MCP_HOST", "0.0.0.0")
UNRAID_MCP_TRANSPORT = os.getenv("UNRAID_MCP_TRANSPORT", "sse").lower() # Added, default to sse

raw_verify_ssl = os.getenv("UNRAID_VERIFY_SSL", "true").lower()
if raw_verify_ssl in ["false", "0", "no"]:
    UNRAID_VERIFY_SSL: Union[bool, str] = False
elif raw_verify_ssl in ["true", "1", "yes"]:
    UNRAID_VERIFY_SSL = True
else: # Path to CA bundle
    UNRAID_VERIFY_SSL = raw_verify_ssl


# Logging setup
# Get log level from environment or default to INFO
LOG_LEVEL_STR = os.getenv('UNRAID_MCP_LOG_LEVEL', 'INFO').upper() # Changed from LOG_LEVEL
NUMERIC_LOG_LEVEL = getattr(logging, LOG_LEVEL_STR, logging.INFO)

# Define a base logger
logger = logging.getLogger("UnraidMCPServer")
logger.setLevel(NUMERIC_LOG_LEVEL)
logger.propagate = False # Prevent root logger from anoying Uvicorn/FastMCP handlers from duplicating

# Console Handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(NUMERIC_LOG_LEVEL)
console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

# File Handler with Rotation (log file in the same directory as the script)
log_file_name = os.getenv("UNRAID_MCP_LOG_FILE", "unraid-mcp.log") # Use env var, default to unraid-mcp.log
log_file_path = SCRIPT_DIR / log_file_name

# Rotate logs at 5MB, keep 3 backup logs
file_handler = RotatingFileHandler(log_file_path, maxBytes=5*1024*1024, backupCount=3, encoding='utf-8')
file_handler.setLevel(NUMERIC_LOG_LEVEL)
file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

logger.info(f"Logging initialized (console and file: {log_file_path}).")

# Log loaded env vars
if UNRAID_API_URL:
    logger.info(f"UNRAID_API_URL loaded: {UNRAID_API_URL[:20]}...") # Log a preview
else:
    logger.warning("UNRAID_API_URL not found in environment or .env file.")

if UNRAID_API_KEY:
    logger.info("UNRAID_API_KEY loaded: ****") # Don't log the key itself
else:
    logger.warning("UNRAID_API_KEY not found in environment or .env file.")

logger.info(f"UNRAID_MCP_PORT set to: {UNRAID_MCP_PORT}")
logger.info(f"UNRAID_MCP_HOST set to: {UNRAID_MCP_HOST}")
logger.info(f"UNRAID_MCP_TRANSPORT set to: {UNRAID_MCP_TRANSPORT}") # Added
logger.info(f"UNRAID_MCP_LOG_LEVEL set to: {LOG_LEVEL_STR}") # Changed from LOG_LEVEL
logger.info(f"UNRAID_MCP_LOG_FILE set to: {log_file_path}") # Added
logger.info(f"UNRAID_VERIFY_SSL set to: {UNRAID_VERIFY_SSL}")

if not UNRAID_API_URL or not UNRAID_API_KEY:
    logger.error("UNRAID_API_URL and UNRAID_API_KEY must be set in the .env file for the server to function.")
    sys.exit(1)

# Initialize FastMCP Server
mcp = FastMCP(
    name="Unraid MCP Server",
    instructions="Provides tools to interact with an Unraid server's GraphQL API.",
    version="0.1.0",
)

# HTTP client timeout settings
TIMEOUT_CONFIG = httpx.Timeout(10.0, read=30.0, connect=5.0)


async def _make_graphql_request(
    query: str, 
    variables: Optional[Dict[str, Any]] = None,
    custom_timeout: Optional[httpx.Timeout] = None
) -> Dict[str, Any]:
    """Helper function to make GraphQL requests to the Unraid API."""
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": UNRAID_API_KEY,
        "User-Agent": "UnraidMCPServer/0.1.0" # Custom user-agent
    }
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    logger.debug(f"Making GraphQL request to {UNRAID_API_URL}:")
    logger.debug(f"Query: {query[:200]}{'...' if len(query) > 200 else ''}") # Log truncated query
    if variables:
        logger.debug(f"Variables: {variables}")

    current_timeout = custom_timeout if custom_timeout is not None else TIMEOUT_CONFIG

    try:
        async with httpx.AsyncClient(timeout=current_timeout, verify=UNRAID_VERIFY_SSL) as client:
            response = await client.post(UNRAID_API_URL, json=payload, headers=headers)
            response.raise_for_status()  # Raise an exception for HTTP error codes 4xx/5xx
            
            response_data = response.json()
            if "errors" in response_data and response_data["errors"]:
                logger.error(f"GraphQL API returned errors: {response_data['errors']}")
                # Consider raising a specific exception or returning a structured error
                raise ValueError(f"GraphQL error: {json.dumps(response_data['errors'])}")
            
            logger.debug("GraphQL request successful.")
            return response_data.get("data", {}) # Return only the data part

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        raise ConnectionError(f"HTTP error {e.response.status_code}: {e.response.text}") from e
    except httpx.RequestError as e:
        logger.error(f"Request error occurred: {e}")
        raise ConnectionError(f"Request error: {e}") from e
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON response: {e}")
        raise ValueError(f"Invalid JSON response: {e}") from e

# --- Tool Implementations Will Go Here ---

@mcp.tool()
async def get_system_info() -> Dict[str, Any]:
    """Retrieves comprehensive information about the Unraid system, OS, CPU, memory, and baseboard."""
    query = """
    query GetSystemInfo {
      info {
        os { platform distro release codename kernel arch hostname codepage logofile serial build uptime }
        cpu { manufacturer brand vendor family model stepping revision voltage speed speedmin speedmax threads cores processors socket cache flags }
        memory {
          # Avoid fetching problematic fields that cause type errors
          layout { bank type clockSpeed formFactor manufacturer partNum serialNum }
        }
        baseboard { manufacturer model version serial assetTag }
        system { manufacturer model version serial uuid sku }
        versions { kernel openssl systemOpenssl systemOpensslLib node v8 npm yarn pm2 gulp grunt git tsc mysql redis mongodb apache nginx php docker postfix postgresql perl python gcc unraid }
        apps { installed started }
        # Remove devices section as it has non-nullable fields that might be null
        machineId
        time
      }
    }
    """
    try:
        logger.info("Executing get_system_info tool")
        response_data = await _make_graphql_request(query)
        raw_info = response_data.get("info", {})
        if not raw_info:
            return {"error": "No system info returned from API"}

        # Process for human-readable output
        summary = {}
        if raw_info.get('os'):
            os_info = raw_info['os']
            summary['os'] = f"{os_info.get('distro', '')} {os_info.get('release', '')} ({os_info.get('platform', '')}, {os_info.get('arch', '')})"
            summary['hostname'] = os_info.get('hostname')
            summary['uptime'] = os_info.get('uptime')        
        
        if raw_info.get('cpu'):
            cpu_info = raw_info['cpu']
            summary['cpu'] = f"{cpu_info.get('manufacturer', '')} {cpu_info.get('brand', '')} ({cpu_info.get('cores')} cores, {cpu_info.get('threads')} threads)"
        
        if raw_info.get('memory') and raw_info['memory'].get('layout'):
            mem_layout = raw_info['memory']['layout']
            summary['memory_layout_details'] = [] # Renamed for clarity
            # The API is not returning 'size' for individual sticks in the layout, even if queried.
            # So, we cannot calculate total from layout currently.
            for stick in mem_layout:
                # stick_size = stick.get('size') # This is None in the actual API response
                summary['memory_layout_details'].append(
                    f"Bank {stick.get('bank', '?')}: Type {stick.get('type', '?')}, Speed {stick.get('clockSpeed', '?')}MHz, Manufacturer: {stick.get('manufacturer','?')}, Part: {stick.get('partNum', '?')}"
                )
            summary['memory_summary'] = "Stick layout details retrieved. Overall total/used/free memory stats are unavailable due to API limitations (Int overflow or data not provided by API)."
        else:
            summary['memory_summary'] = "Memory information (layout or stats) not available or failed to retrieve."

        # Include a key for the full details if needed by an LLM for deeper dives
        return {"summary": summary, "details": raw_info}

    except Exception as e:
        logger.error(f"Error in get_system_info: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_array_status() -> Dict[str, Any]:
    """Retrieves the current status of the Unraid storage array, including its state, capacity, and details of all disks."""
    query = """
    query GetArrayStatus {
      array {
        id
        state
        capacity {
          kilobytes { free used total }
          disks { free used total }
        }
        boot { id idx name device size status rotational temp numReads numWrites numErrors fsSize fsFree fsUsed exportable type warning critical fsType comment format transport color }
        parities { id idx name device size status rotational temp numReads numWrites numErrors fsSize fsFree fsUsed exportable type warning critical fsType comment format transport color }
        disks { id idx name device size status rotational temp numReads numWrites numErrors fsSize fsFree fsUsed exportable type warning critical fsType comment format transport color }
        caches { id idx name device size status rotational temp numReads numWrites numErrors fsSize fsFree fsUsed exportable type warning critical fsType comment format transport color }
      }
    }
    """
    try:
        logger.info("Executing get_array_status tool")
        response_data = await _make_graphql_request(query)
        raw_array_info = response_data.get("array", {})
        if not raw_array_info:
            return {"error": "No array info returned from API"}

        summary = {}
        summary['state'] = raw_array_info.get('state')

        if raw_array_info.get('capacity') and raw_array_info['capacity'].get('kilobytes'):
            kb_cap = raw_array_info['capacity']['kilobytes']
            # Helper to format KB into TB/GB/MB
            def format_kb(k):
                if k is None: return "N/A"
                k = int(k) # Values are strings in SDL for PrefixedID containing types like capacity
                if k >= 1024*1024*1024: return f"{k / (1024*1024*1024):.2f} TB"
                if k >= 1024*1024: return f"{k / (1024*1024):.2f} GB"
                if k >= 1024: return f"{k / 1024:.2f} MB"
                return f"{k} KB"

            summary['capacity_total'] = format_kb(kb_cap.get('total'))
            summary['capacity_used'] = format_kb(kb_cap.get('used'))
            summary['capacity_free'] = format_kb(kb_cap.get('free'))
        
        summary['num_parity_disks'] = len(raw_array_info.get('parities', []))
        summary['num_data_disks'] = len(raw_array_info.get('disks', []))
        summary['num_cache_pools'] = len(raw_array_info.get('caches', [])) # Note: caches are pools, not individual cache disks

        # Could add summaries of disk statuses here if needed (e.g., count of disks not OK)

        return {"summary": summary, "details": raw_array_info}

    except Exception as e:
        logger.error(f"Error in get_array_status: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_network_config() -> Dict[str, Any]:
    """Retrieves network configuration details, including access URLs."""
    query = """
    query GetNetworkConfig {
      network {
        id
        accessUrls { type name ipv4 ipv6 }
      }
    }
    """
    try:
        logger.info("Executing get_network_config tool")
        response_data = await _make_graphql_request(query)
        return response_data.get("network", {})
    except Exception as e:
        logger.error(f"Error in get_network_config: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_registration_info() -> Dict[str, Any]:
    """Retrieves Unraid registration details."""
    query = """
    query GetRegistrationInfo {
      registration {
        id
        type
        keyFile { location contents }
        state
        expiration
        updateExpiration
      }
    }
    """
    try:
        logger.info("Executing get_registration_info tool")
        response_data = await _make_graphql_request(query)
        return response_data.get("registration", {})
    except Exception as e:
        logger.error(f"Error in get_registration_info: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_connect_settings() -> Dict[str, Any]:
    """Retrieves settings related to Unraid Connect."""
    # Note: The SDL shows connect.settings.values, let's query that path
    query = """
    query GetConnectSettings {
      connect {
        settings {
          values {
            sandbox
            extraOrigins
            accessType
            forwardType
            port
            ssoUserIds
          }
        }
      }
    }
    """
    try:
        logger.info("Executing get_connect_settings tool")
        response_data = await _make_graphql_request(query)
        # Navigate down to the 'values' part of the response
        if response_data.get("connect") and response_data["connect"].get("settings"):
            return response_data["connect"]["settings"].get("values", {})
        return {} # Return empty if path not found
    except Exception as e:
        logger.error(f"Error in get_connect_settings: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_unraid_variables() -> Dict[str, Any]:
    """Retrieves a selection of Unraid system variables and settings. 
       Note: Many variables are omitted due to API type issues (Int overflow/NaN).
    """
    # Querying a smaller, curated set of fields to avoid Int overflow and NaN issues
    # pending Unraid API schema fixes for the full Vars type.
    query = """
    query GetSelectiveUnraidVariables {
      vars {
        id
        version
        name
        timeZone
        comment
        security
        workgroup
        domain
        domainShort
        hideDotFiles
        localMaster
        enableFruit
        useNtp
        # ntpServer1, ntpServer2, ... are strings, should be okay but numerous
        domainLogin # Boolean
        sysModel # String
        # sysArraySlots, sysCacheSlots are Int, were problematic (NaN)
        sysFlashSlots # Int, might be okay if small and always set
        useSsl # Boolean
        port # Int, usually small
        portssl # Int, usually small
        localTld # String
        bindMgt # Boolean
        useTelnet # Boolean
        porttelnet # Int, usually small
        useSsh # Boolean
        portssh # Int, usually small
        startPage # String
        startArray # Boolean
        # spindownDelay, queueDepth are Int, potentially okay if always set
        # defaultFormat, defaultFsType are String
        shutdownTimeout # Int, potentially okay
        # luksKeyfile is String
        # pollAttributes, pollAttributesDefault, pollAttributesStatus are Int/String, were problematic (NaN or type)
        # nrRequests, nrRequestsDefault, nrRequestsStatus were problematic
        # mdNumStripes, mdNumStripesDefault, mdNumStripesStatus were problematic
        # mdSyncWindow, mdSyncWindowDefault, mdSyncWindowStatus were problematic
        # mdSyncThresh, mdSyncThreshDefault, mdSyncThreshStatus were problematic
        # mdWriteMethod, mdWriteMethodDefault, mdWriteMethodStatus were problematic
        # shareDisk, shareUser, shareUserInclude, shareUserExclude are String arrays/String
        shareSmbEnabled # Boolean
        shareNfsEnabled # Boolean
        shareAfpEnabled # Boolean
        # shareInitialOwner, shareInitialGroup are String
        shareCacheEnabled # Boolean
        # shareCacheFloor is String (numeric string?)
        # shareMoverSchedule, shareMoverLogging are String
        # fuseRemember, fuseRememberDefault, fuseRememberStatus are String/Boolean, were problematic
        # fuseDirectio, fuseDirectioDefault, fuseDirectioStatus are String/Boolean, were problematic
        shareAvahiEnabled # Boolean
        # shareAvahiSmbName, shareAvahiSmbModel, shareAvahiAfpName, shareAvahiAfpModel are String
        safeMode # Boolean
        startMode # String
        configValid # Boolean
        configError # String
        joinStatus # String
        deviceCount # Int, might be okay
        flashGuid # String
        flashProduct # String
        flashVendor # String
        # regCheck, regFile, regGuid, regTy, regState, regTo, regTm, regTm2, regGen are varied, mostly String/Int
        # sbName, sbVersion, sbUpdated, sbEvents, sbState, sbClean, sbSynced, sbSyncErrs, sbSynced2, sbSyncExit are varied
        # mdColor, mdNumDisks, mdNumDisabled, mdNumInvalid, mdNumMissing, mdNumNew, mdNumErased are Int, potentially okay if counts
        # mdResync, mdResyncCorr, mdResyncPos, mdResyncDb, mdResyncDt, mdResyncAction are varied (Int/Boolean/String)
        # mdResyncSize was an overflow
        mdState # String (enum)
        mdVersion # String
        # cacheNumDevices, cacheSbNumDisks were problematic (NaN)
        # fsState, fsProgress, fsCopyPrcnt, fsNumMounted, fsNumUnmountable, fsUnmountableMask are varied
        shareCount # Int, might be okay
        shareSmbCount # Int, might be okay
        shareNfsCount # Int, might be okay
        shareAfpCount # Int, might be okay
        shareMoverActive # Boolean
        csrfToken # String
      }
    }
    """
    try:
        logger.info("Executing get_unraid_variables tool with a selective query")
        response_data = await _make_graphql_request(query)
        return response_data.get("vars", {})
    except Exception as e:
        logger.error(f"Error in get_unraid_variables: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def list_docker_containers(skip_cache: Optional[bool] = False) -> List[Dict[str, Any]]:
    """Lists all Docker containers on the Unraid system."""
    query = """
    query ListDockerContainers($skipCache: Boolean!) {
      docker {
        containers(skipCache: $skipCache) {
          id
          names
          image
          imageId
          command
          created
          ports { ip privatePort publicPort type }
          sizeRootFs
          labels # JSONObject
          state
          status
          hostConfig { networkMode }
          # networkSettings # JSONObject, potentially large, omit for list view
          # mounts # JSONObject array, potentially large, omit for list view
          autoStart
        }
      }
    }
    """
    variables = {"skipCache": skip_cache}
    try:
        logger.info(f"Executing list_docker_containers tool with skip_cache={skip_cache}")
        response_data = await _make_graphql_request(query, variables)
        if response_data.get("docker"):
            return response_data["docker"].get("containers", [])
        return []
    except Exception as e:
        logger.error(f"Error in list_docker_containers: {e}", exc_info=True)
        return [{"error": str(e)}] # Return list with error dict for consistency

@mcp.tool()
async def manage_docker_container(container_id: str, action: str) -> Dict[str, Any]:
    """Starts or stops a specific Docker container. Action must be 'start' or 'stop'."""
    if action.lower() not in ["start", "stop"]:
        logger.warning(f"Invalid action '{action}' for manage_docker_container")
        return {"error": "Invalid action. Must be 'start' or 'stop'."}

    mutation_name = action.lower()
    query = f"""
    mutation ManageDockerContainer($id: PrefixedID!) {{
      docker {{
        {mutation_name}(id: $id) {{
          id
          names
          image
          state
          status
          autoStart
        }}
      }}
    }}
    """
    variables = {"id": container_id}
    try:
        logger.info(f"Executing manage_docker_container tool: action={action}, id={container_id}")
        response_data = await _make_graphql_request(query, variables)
        if response_data.get("docker") and response_data["docker"].get(mutation_name):
            return response_data["docker"][mutation_name]
        return {"error": f"Failed to {action} container or unexpected response structure."}
    except Exception as e:
        logger.error(f"Error in manage_docker_container ({action}): {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_docker_container_details(container_identifier: str) -> Dict[str, Any]:
    """Retrieves detailed information for a specific Docker container by its ID or name."""
    # This tool fetches all containers and then filters by ID or name.
    # More detailed query for a single container if found:
    detailed_query_fields = """
          id
          names
          image
          imageId
          command
          created
          ports { ip privatePort publicPort type }
          sizeRootFs
          labels # JSONObject
          state
          status
          hostConfig { networkMode }
          networkSettings # JSONObject
          mounts # JSONObject array
          autoStart
    """

    # Fetch all containers first
    list_query = f"""
    query GetAllContainerDetailsForFiltering {{
      docker {{
        containers(skipCache: false) {{
          {detailed_query_fields}
        }}
      }}
    }}
    """
    try:
        logger.info(f"Executing get_docker_container_details for identifier: {container_identifier}")
        response_data = await _make_graphql_request(list_query)
        
        containers = []
        if response_data.get("docker"):
            containers = response_data["docker"].get("containers", [])
        
        for container in containers:
            if container.get("id") == container_identifier or container_identifier in container.get("names", []):
                logger.info(f"Found container {container_identifier}")
                return container
        
        logger.warning(f"Container with identifier '{container_identifier}' not found.")
        return {"error": f"Container '{container_identifier}' not found."}

    except Exception as e:
        logger.error(f"Error in get_docker_container_details: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def list_vms() -> List[Dict[str, Any]]:
    """Lists all Virtual Machines (VMs) on the Unraid system and their current state."""
    query = """
    query ListVMs {
      vms {
        domains {
          id
          name
          state
          # uuid # Deprecated, use id
        }
      }
    }
    """
    try:
        logger.info("Executing list_vms tool")
        response_data = await _make_graphql_request(query)
        if response_data.get("vms"):
            # The schema shows vms.domains and vms.domain (both resolving to [VmDomain!])
            # Prefer .domains if available, else .domain
            if response_data["vms"].get("domains") is not None:
                return response_data["vms"].get("domains", [])
            elif response_data["vms"].get("domain") is not None:
                 return response_data["vms"].get("domain", [])
        return []
    except Exception as e:
        logger.error(f"Error in list_vms: {e}", exc_info=True)
        return [{"error": str(e)}]

@mcp.tool()
async def manage_vm(vm_id: str, action: str) -> Dict[str, Any]:
    """Manages a VM: start, stop, pause, resume, force_stop, reboot."""
    valid_actions = ["start", "stop", "pause", "resume", "forceStop", "reboot"] # Note forceStop capitalization from SDL
    if action not in valid_actions:
        logger.warning(f"Invalid action '{action}' for manage_vm")
        return {"error": f"Invalid action. Must be one of {valid_actions}."}

    mutation_name = action
    query = f"""
    mutation ManageVM($id: PrefixedID!) {{
      vm {{
        {mutation_name}(id: $id)
      }}
    }}
    """
    variables = {"id": vm_id}
    try:
        logger.info(f"Executing manage_vm tool: action={action}, id={vm_id}")
        response_data = await _make_graphql_request(query, variables)
        if response_data.get("vm") and mutation_name in response_data["vm"]:
            # Mutations for VM return Boolean for success
            success = response_data["vm"][mutation_name]
            return {"success": success, "action": action, "vm_id": vm_id}
        return {"error": f"Failed to {action} VM or unexpected response structure."}
    except Exception as e:
        logger.error(f"Error in manage_vm ({action}): {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_vm_details(vm_identifier: str) -> Dict[str, Any]:
    """Retrieves detailed information for a specific VM by its ID or name."""
    # VmDomain type in SDL is simple: id, name, state. 
    # If more details are needed, the GraphQL query might need to be different, 
    # but there isn't a direct vm(id:...) query for richer details in the SDL.
    # This tool will, like get_docker_container_details, filter the list_vms output.
    try:
        logger.info(f"Executing get_vm_details for identifier: {vm_identifier}")
        vms = await list_vms() # This returns a list of dicts or list with error dict
        if vms and isinstance(vms[0], dict) and "error" in vms[0]:
            logger.error(f"Failed to list VMs while trying to get details: {vms[0]['error']}")
            return vms[0] # Propagate error from list_vms

        for vm_data in vms:
            if vm_data.get("id") == vm_identifier or vm_data.get("name") == vm_identifier:
                logger.info(f"Found VM {vm_identifier}")
                return vm_data
        
        logger.warning(f"VM with identifier '{vm_identifier}' not found.")
        return {"error": f"VM '{vm_identifier}' not found."}

    except Exception as e:
        logger.error(f"Error in get_vm_details: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def get_shares_info() -> List[Dict[str, Any]]:
    """Retrieves information about user shares."""
    query = """
    query GetSharesInfo {
      shares {
        id
        name
        free
        used
        size
        include
        exclude
        cache
        nameOrig
        comment
        allocator
        splitLevel
        floor
        cow
        color
        luksStatus
      }
    }
    """
    try:
        logger.info("Executing get_shares_info tool")
        response_data = await _make_graphql_request(query)
        return response_data.get("shares", [])
    except Exception as e:
        logger.error(f"Error in get_shares_info: {e}", exc_info=True)
        return [{"error": str(e)}]

@mcp.tool()
async def get_notifications_overview() -> Dict[str, Any]:
    """Retrieves an overview of system notifications (unread and archive counts by severity)."""
    query = """
    query GetNotificationsOverview {
      notifications {
        overview {
          unread { info warning alert total }
          archive { info warning alert total }
        }
      }
    }
    """
    try:
        logger.info("Executing get_notifications_overview tool")
        response_data = await _make_graphql_request(query)
        if response_data.get("notifications"):
            return response_data["notifications"].get("overview", {})
        return {}
    except Exception as e:
        logger.error(f"Error in get_notifications_overview: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def list_notifications(
    type: str, 
    offset: int, 
    limit: int, 
    importance: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Lists notifications with filtering. Type: UNREAD/ARCHIVE. Importance: INFO/WARNING/ALERT."""
    query = """
    query ListNotifications($filter: NotificationFilter!) {
      notifications {
        list(filter: $filter) {
          id
          title
          subject
          description
          importance
          link
          type
          timestamp
          formattedTimestamp
        }
      }
    }
    """
    variables = {
        "filter": {
            "type": type.upper(),
            "offset": offset,
            "limit": limit,
            "importance": importance.upper() if importance else None
        }
    }
    # Remove null importance from variables if not provided, as GraphQL might be strict
    if not importance:
        del variables["filter"]["importance"]
        
    try:
        logger.info(f"Executing list_notifications: type={type}, offset={offset}, limit={limit}, importance={importance}")
        response_data = await _make_graphql_request(query, variables)
        if response_data.get("notifications"):
            return response_data["notifications"].get("list", [])
        return []
    except Exception as e:
        logger.error(f"Error in list_notifications: {e}", exc_info=True)
        return [{"error": str(e)}]

@mcp.tool()
async def list_available_log_files() -> List[Dict[str, Any]]:
    """Lists all available log files that can be queried."""
    query = """
    query ListLogFiles {
      logFiles {
        name
        path
        size
        modifiedAt
      }
    }
    """
    try:
        logger.info("Executing list_available_log_files tool")
        response_data = await _make_graphql_request(query)
        return response_data.get("logFiles", [])
    except Exception as e:
        logger.error(f"Error in list_available_log_files: {e}", exc_info=True)
        return [{"error": str(e)}]

@mcp.tool()
async def get_logs(log_file_path: str, tail_lines: Optional[int] = 100) -> Dict[str, Any]:
    """Retrieves content from a specific log file, defaulting to the last 100 lines."""
    # The Unraid GraphQL API Query.logFile takes 'lines' and 'startLine'.
    # To implement 'tail_lines', we would ideally need to know the total lines first,
    # then calculate startLine. However, Query.logFile itself returns totalLines.
    # A simple approach for 'tail' is to request a large number of lines if totalLines is not known beforehand,
    # and let the API handle it, or make two calls (one to get totalLines, then another).
    # For now, let's assume 'lines' parameter in Query.logFile effectively means tail if startLine is not given.
    # If not, this tool might need to be smarter or the API might not directly support 'tail' easily.
    # The SDL for LogFileContent implies it returns startLine, so it seems aware of ranges.

    # Let's try fetching with just 'lines' to see if it acts as a tail, 
    # or if we need Query.logFiles first to get totalLines for calculation.
    # For robust tailing, one might need to fetch totalLines first, then calculate start_line for the tail.
    # Simplified: query for the last 'tail_lines'. If the API doesn't support tailing this way, we may need adjustment.
    # The current plan is to pass 'lines=tail_lines' directly.

    query = """
    query GetLogContent($path: String!, $lines: Int) {
      logFile(path: $path, lines: $lines) {
        path
        content
        totalLines
        startLine
      }
    }
    """
    variables = {"path": log_file_path, "lines": tail_lines}
    try:
        logger.info(f"Executing get_logs for {log_file_path}, tail_lines={tail_lines}")
        response_data = await _make_graphql_request(query, variables)
        return response_data.get("logFile", {})
    except Exception as e:
        logger.error(f"Error in get_logs for {log_file_path}: {e}", exc_info=True)
        return {"error": str(e)}

@mcp.tool()
async def list_physical_disks() -> List[Dict[str, Any]]:
    """Lists all physical disks recognized by the Unraid system."""
    # Querying an extremely minimal set of fields for diagnostics
    query = """ 
    query ListPhysicalDisksMinimal {
      disks {
        id
        device
        name
      }
    }
    """
    try:
        logger.info("Executing list_physical_disks tool with minimal query and increased timeout")
        # Increased read timeout for this potentially slow query
        long_timeout = httpx.Timeout(10.0, read=90.0, connect=5.0) 
        response_data = await _make_graphql_request(query, custom_timeout=long_timeout)
        return response_data.get("disks", [])
    except Exception as e:
        logger.error(f"Error in list_physical_disks: {e}", exc_info=True)
        return [{"error": str(e)}]

@mcp.tool()
async def get_disk_details(disk_id: str) -> Dict[str, Any]:
    """Retrieves detailed SMART information and partition data for a specific physical disk."""
    # Querying a more selective set of fields to avoid potential Int/NaN issues
    query = """
    query GetDiskDetails($id: PrefixedID!) {
      disk(id: $id) {
        id
        device
        type
        name
        vendor
        size # Long!
        # bytesPerSector # Int - Omitting for now
        firmwareRevision
        serialNum
        interfaceType
        smartStatus # Enum SmartStatus
        # temperature # Int - Omitting for now
        partitions {
          name
          fsType
          size # This is Long in Partition, should be okay
        }
      }
    }
    """
    variables = {"id": disk_id}
    try:
        logger.info(f"Executing get_disk_details for disk: {disk_id}")
        response_data = await _make_graphql_request(query, variables)
        return response_data.get("disk", {})
    except Exception as e:
        logger.error(f"Error in get_disk_details for {disk_id}: {e}", exc_info=True)
        return {"error": str(e)}

if __name__ == "__main__":
    logger.info(f"Starting Unraid MCP Server on {UNRAID_MCP_HOST}:{UNRAID_MCP_PORT} using {UNRAID_MCP_TRANSPORT} transport...")
    try:
        if UNRAID_MCP_TRANSPORT == "sse":
            mcp.run(
                transport="sse", 
                host=UNRAID_MCP_HOST, 
                port=UNRAID_MCP_PORT,
                path="/mcp"  # Standard path for FastMCP SSE
            )
        elif UNRAID_MCP_TRANSPORT == "stdio":
            mcp.run() # Defaults to stdio
        else:
            logger.error(f"Unsupported MCP_TRANSPORT: {UNRAID_MCP_TRANSPORT}. Choose 'sse' or 'stdio'.")
            sys.exit(1)
    except Exception as e:
        logger.critical(f"Failed to start Unraid MCP server: {e}", exc_info=True)
        sys.exit(1)
