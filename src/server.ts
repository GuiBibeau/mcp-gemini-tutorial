import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { SERVER_CONFIG } from "./config";
import {
  WEB_SEARCH_TOOL,
  LOCAL_SEARCH_TOOL,
  webSearchHandler,
  localSearchHandler,
} from "./tools";

// Create MCP server
export function createServer() {
  const server = new Server(
    {
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
    },
    {
      capabilities: {
        tools: {
          tools: [WEB_SEARCH_TOOL, LOCAL_SEARCH_TOOL],
        },
      },
    }
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [WEB_SEARCH_TOOL, LOCAL_SEARCH_TOOL],
  }));

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error("No arguments provided");
      }

      switch (name) {
        case "brave_web_search":
          return await webSearchHandler(args);

        case "brave_local_search":
          return await localSearchHandler(args);

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Start server with stdio transport
export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Brave Search MCP Server running on stdio");
}
