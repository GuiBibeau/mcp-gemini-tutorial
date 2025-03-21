#!/usr/bin/env node
import { startServer } from "./src/server";

// Run the server
startServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
