import { McpToolResponse } from "../types/mcp.types.js";

export function handleToolError(error: unknown, context: string): McpToolResponse {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text",
        text: `Failed to ${context}: ${message}`
      }
    ],
    isError: true
  };
}
