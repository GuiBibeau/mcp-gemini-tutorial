# MCP with Gemini Tutorial

This repository contains the complete code for the tutorial on building Model Context Protocol (MCP) servers with Google's Gemini 2.0 model, as described in [this blog post](https://www.guibibeau.com/blog/mcp-with-gemini).

## What is Model Context Protocol (MCP)?

MCP is an open standard developed by Anthropic that enables AI models to seamlessly access external tools and resources. It creates a standardized way for AI models to interact with tools, access the internet, run code, and more, without needing custom integrations for each tool or model.

Key benefits include:

- **Interoperability**: Any MCP-compatible model can use any MCP-compatible tool
- **Modularity**: Add or update tools without changing model integrations
- **Standardization**: Consistent interface reduces integration complexity
- **Separation of Concerns**: Clean division between model capabilities and tool functionality

## Project Overview

This tutorial demonstrates how to:

- Build a complete MCP server with Brave Search integration
- Connect it to Google's Gemini 2.0 model
- Create a flexible architecture for AI-powered applications

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (for fast TypeScript execution)
- Brave Search API key
- Google API key for Gemini access

### Installation

```bash
# Clone the repository
git clone https://github.com/guibibeau/mcp-tutorial.git
cd mcp-tutorial

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file with your API keys:

```
BRAVE_API_KEY="your_brave_api_key"
GOOGLE_API_KEY="your_google_api_key"
```

## Usage

### Running the Basic Client

```bash
bun examples/basic-client.ts
```

### Running the Gemini Integration

```bash
bun examples/gemini-tool-function.ts
```

## Project Structure

- `src/` - Core implementation of the MCP server and tools
- `examples/` - Example clients demonstrating how to use the MCP server
- `tests/` - Test files for the project

## Tools Implemented

This MCP server exposes two main tools:

1. **Web Search**: For general internet searches via Brave Search
2. **Local Search**: For finding businesses and locations via Brave Search

## Extending the Project

You can add your own tools by:

1. Defining a new tool with a schema
2. Implementing the functionality
3. Registering it with the MCP server

## Learn More

- [Official MCP Documentation](https://github.com/anthropics/anthropic-cookbook/tree/main/model_context_protocol)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Brave Search API Documentation](https://brave.com/search/api/)

## License

MIT

---

This project was created using `bun init` in bun v1.1.37. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
