#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runBasicDemo() {
  console.log("🔍 Brave Search MCP Demo - Basic Client");
  console.log("======================================\n");

  // Create MCP client and transport
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["index.ts"], // Use your existing server entry point
  });

  const client = new Client(
    { name: "brave-search-demo-client", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  try {
    // Connect to the server
    console.log("📡 Connecting to Brave Search MCP server...");
    await client.connect(transport);
    console.log("✅ Connected successfully!\n");

    // List available tools
    console.log("📋 Listing available tools...");
    const { tools } = await client.listTools();
    console.log(
      `Found ${(tools as any).length} tools:\n- ${(tools as any[])
        .map((t) => t.name)
        .join("\n- ")}\n`
    );

    // Example 1: Web Search
    console.log("🌐 DEMO #1: Web Search");
    console.log("Query: 'latest AI research papers 2024'");
    const webResult = await client.callTool({
      name: "brave_web_search",
      arguments: {
        query: "latest AI research papers 2024",
        count: 3,
      },
    });
    console.log("\nResults:");
    console.log((webResult as any).content[0].text);
    console.log("\n-----------------------------------\n");

    // Example 2: Local Search
    console.log("🏙️ DEMO #2: Local Search");
    console.log("Query: 'best coffee shops in San Francisco'");
    const localResult = await client.callTool({
      name: "brave_local_search",
      arguments: {
        query: "best coffee shops in San Francisco",
        count: 3,
      },
    });
    console.log("\nResults:");
    console.log((localResult as any).content[0].text);

    console.log("\n-----------------------------------\n");
    console.log("✅ Demo completed successfully!");
  } catch (error) {
    console.error("❌ Error during demo:", error);
  } finally {
    // Clean up
    await transport.close();
    console.log("👋 Disconnected from server");
  }
}

runBasicDemo().catch(console.error);
