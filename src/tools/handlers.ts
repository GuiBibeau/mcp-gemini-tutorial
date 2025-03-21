import { performWebSearch, performLocalSearch } from "../utils/braveApi";
import { isBraveWebSearchArgs, isBraveLocalSearchArgs } from "./definitions";

// Web search handler
export async function webSearchHandler(args: unknown) {
  if (!isBraveWebSearchArgs(args)) {
    throw new Error("Invalid arguments for brave_web_search");
  }

  const { query, count = 10, offset = 0 } = args;
  const results = await performWebSearch(query, count, offset);

  return {
    content: [{ type: "text", text: results }],
    isError: false,
  };
}

// Local search handler
export async function localSearchHandler(args: unknown) {
  if (!isBraveLocalSearchArgs(args)) {
    throw new Error("Invalid arguments for brave_local_search");
  }

  const { query, count = 5 } = args;
  const results = await performLocalSearch(query, count);

  return {
    content: [{ type: "text", text: results }],
    isError: false,
  };
}
