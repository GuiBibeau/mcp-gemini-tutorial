// Configuration for the Brave Search MCP server
export const SERVER_CONFIG = {
  name: "brave-search-mcp",
  version: "0.1.0",
};

// Check for API key at startup
export const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
if (!BRAVE_API_KEY) {
  console.error("Error: BRAVE_API_KEY environment variable is required");
  process.exit(1);
}
