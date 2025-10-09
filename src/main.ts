import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config/environment.js";
import { DataDomeApiService } from "./services/datadome-api.service.js";
import { createGetAllEndpointsTool } from "./tools/endpoints.tool.js";
import { createGetCustomRulesTool, createCreateCustomRuleTool } from "./tools/rules.tool.js";
import { createGetAccountSettingsTool } from "./tools/account.tool.js";
import { createGetAccountUsageTool } from "./tools/account-usage.tool.js";
import { registerDocumentationResources } from "./resources/documentation.resource.js";

function registerTools(
  server: McpServer,
  apiService: DataDomeApiService
): void {
  // Register endpoint tools
  const getAllEndpointsTool = createGetAllEndpointsTool(apiService);
  server.registerTool(
    getAllEndpointsTool.name,
    getAllEndpointsTool.config,
    getAllEndpointsTool.handler
  );

  // Register rules tools
  const getCustomRulesTool = createGetCustomRulesTool(apiService);
  server.registerTool(
    getCustomRulesTool.name,
    getCustomRulesTool.config,
    getCustomRulesTool.handler
  );

  const createCustomRuleTool = createCreateCustomRuleTool(apiService);
  server.registerTool(
    createCustomRuleTool.name,
    createCustomRuleTool.config,
    createCustomRuleTool.handler
  );

  // Register account tools
  const getAccountSettingsTool = createGetAccountSettingsTool(apiService);
  server.registerTool(
    getAccountSettingsTool.name,
    getAccountSettingsTool.config,
    getAccountSettingsTool.handler
  );

  const getAccountUsageTool = createGetAccountUsageTool(apiService);
  server.registerTool(
    getAccountUsageTool.name,
    getAccountUsageTool.config,
    getAccountUsageTool.handler
  );
}

function createMcpServer(): McpServer {
  const config = loadConfig();
  const apiService = new DataDomeApiService(config.api);

  const server = new McpServer({ name: "datadome-server", version: "1.0.0" });

  registerTools(server, apiService);
  registerDocumentationResources(server);

  return server;
}

async function main() {
  try {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("✅ DataDome MCP server running on stdio");
  } catch (error) {
    console.error("Fatal server error:", error);
    process.exit(1);
  }
}

main();
