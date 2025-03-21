#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Simple prompt function for Bun
async function prompt(message: string): Promise<string> {
  process.stdout.write(message);
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function runInteractiveDemo() {
  console.log("🔍 Brave Search MCP Demo - Interactive Client");
  console.log("===========================================\n");

  // Create MCP client
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["index.ts"], // Use your existing server entry point
  });

  const client = new Client(
    { name: "brave-search-interactive-demo", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  try {
    // Connect to the server
    console.log("📡 Connecting to Brave Search MCP server...");
    await client.connect(transport);
    console.log("✅ Connected successfully!\n");

    // List available tools
    const { tools } = await client.listTools();
    console.log(
      `Available search tools: ${tools.map((t) => t.name).join(", ")}\n`
    );

    while (true) {
      console.log("\n📋 DEMO OPTIONS:");
      console.log("1. Web Search");
      console.log("2. Local Search");
      console.log("3. Exit Demo");

      const choice = await prompt("\nSelect option (1-3): ");

      if (choice === "3") {
        console.log("Exiting demo...");
        break;
      }

      if (choice !== "1" && choice !== "2") {
        console.log("❌ Invalid choice. Please enter 1, 2, or 3.");
        continue;
      }

      const query = await prompt("Enter search query: ");
      if (!query) {
        console.log("❌ Query cannot be empty. Please try again.");
        continue;
      }

      const countStr = await prompt("Number of results (default: 3): ");
      const count = countStr ? parseInt(countStr) : 3;

      console.log("\n🔍 Searching...");

      let toolName: string;
      let args: any;

      if (choice === "1") {
        toolName = "brave_web_search";
        const offsetStr = await prompt("Offset (default: 0): ");
        const offset = offsetStr ? parseInt(offsetStr) : 0;
        args = { query, count, offset };
        console.log(`\n🌐 Performing web search for: "${query}"`);
      } else {
        toolName = "brave_local_search";
        args = { query, count };
        console.log(`\n🏙️ Performing local search for: "${query}"`);
      }

      const startTime = Date.now();
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });
      const duration = Date.now() - startTime;

      console.log(`\n✅ Results (retrieved in ${duration}ms):`);
      console.log("=".repeat(50));
      console.log((result as any).content[0].text);
      console.log("=".repeat(50));

      await prompt("\nPress Enter to continue...");
    }
  } catch (error) {
    console.error("❌ Error during demo:", error);
  } finally {
    // Clean up
    await transport.close();
    console.log("👋 Disconnected from server");
  }
}

runInteractiveDemo().catch(console.error);
