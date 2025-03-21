#!/usr/bin/env bun
import { googleGenAi, createMcpClient } from "../src/utils/googleAi";
import { SchemaType } from "@google/generative-ai";

// Example 1: Using Gemini with function calling to access MCP tools
async function geminiWithFunctionCalling() {
  console.log("🤖 Gemini AI with MCP Tool Function Calling");
  console.log("==========================================\n");

  const { client, transport } = await createMcpClient();

  try {
    // Get available search tools
    const { tools } = await client.listTools();
    console.log(`Available tools: ${tools.map((t) => t.name).join(", ")}`);

    // Configure function calling for Gemini
    const model = googleGenAi.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      tools: [
        {
          functionDeclarations: [
            {
              name: "brave_web_search",
              description: "Search the web using Brave Search API",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  query: {
                    type: SchemaType.STRING,
                    description: "The search query (required)",
                  },
                  count: {
                    type: SchemaType.NUMBER,
                    description: "Number of results to return (default: 3)",
                  },
                },
                required: ["query"],
              },
            },
            {
              name: "brave_local_search",
              description:
                "Search for local businesses and places using Brave Search API",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  query: {
                    type: SchemaType.STRING,
                    description: "The local search query (required)",
                  },
                  count: {
                    type: SchemaType.NUMBER,
                    description: "Number of results to return (default: 3)",
                  },
                },
                required: ["query"],
              },
            },
          ],
        },
      ],
    });

    // Handle function calling with MCP
    async function handleFunctionCall(functionCall: any) {
      const { name, args } = functionCall;

      console.log(`🔍 Gemini requested tool: ${name}`);
      console.log(`📝 Function arguments: ${JSON.stringify(args)}`);

      // Call the appropriate MCP tool
      const result = await client.callTool({
        name,
        arguments: args,
      });

      return (result as any).content[0].text;
    }

    // Process user queries with Gemini and MCP tools
    async function processQuery(userQuery: string) {
      console.log(`\n📝 User query: "${userQuery}"`);

      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: userQuery }] }],
        });

        const response = result.response;

        // Check if Gemini wants to call a function
        if (
          response.candidates &&
          response.candidates[0].content.parts[0].functionCall
        ) {
          const functionCall =
            response.candidates[0].content.parts[0].functionCall;
          const searchResults = await handleFunctionCall(functionCall);

          // Send the function result back to Gemini
          const finalResult = await model.generateContent({
            contents: [
              { role: "user", parts: [{ text: userQuery }] },
              {
                role: "model",
                parts: [
                  {
                    functionCall: functionCall,
                  },
                ],
              },
              {
                role: "user",
                parts: [
                  {
                    text: searchResults,
                  },
                ],
              },
            ],
          });

          return finalResult.response.text();
        }

        return response.text();
      } catch (error) {
        console.error(`Error processing query: ${error.message || error}`);
        return `Sorry, I encountered an error while processing your request: ${
          error.message || "Unknown error"
        }`;
      }
    }

    // Demo with some example queries
    const demoQueries = [
      "What are the latest AI research papers in 2025?",
      "Find some good coffee shops in San Francisco",
      "Tell me about the history of quantum computing",
    ];

    for (const [i, query] of demoQueries.entries()) {
      console.log(`\n🔄 DEMO #${i + 1}`);
      const answer = await processQuery(query);
      console.log("\n🤖 Gemini response:");
      console.log("=".repeat(50));
      console.log(answer);
      console.log("=".repeat(50));

      if (i < demoQueries.length - 1) {
        // Pause between demos
        console.log("\nMoving to next demo in a moment...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    // Clean up
    await transport.close();
    console.log("\n👋 Session ended");
  }
}

// Run the demo
geminiWithFunctionCalling().catch(console.error);
