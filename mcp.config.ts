/**
 * Model Context Protocol (MCP) Server Configuration
 * 
 * This configuration file defines the MCP server settings including
 * authentication, endpoints, and server behavior.
 */

export interface MCPConfig {
  /** Enable or disable the MCP server */
  enabled: boolean
  /** API token for authenticating MCP requests */
  apiToken: string | undefined
  /** Server endpoint path */
  endpoint: string
  /** Maximum request timeout in milliseconds */
  timeout: number
}

/**
 * Get MCP server configuration from environment variables
 */
export function getMCPConfig(): MCPConfig {
  const enabled = import.meta.env.VITE_MCP_SERVER_ENABLED === 'true'
  const apiToken = import.meta.env.VITE_MCP_API_TOKEN

  return {
    enabled,
    apiToken,
    endpoint: '/api/mcp',
    timeout: 30000, // 30 seconds
  }
}

/**
 * Validate MCP API token
 */
export function validateMCPToken(token: string | undefined, providedToken: string): boolean {
  if (!token) {
    return false
  }
  return token === providedToken
}

export default getMCPConfig
