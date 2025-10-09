import { DataDomeApiService } from "../services/datadome-api.service.js";
import { AccountSettings } from "../types/datadome.types.js";
import { McpToolResponse } from "../types/mcp.types.js";
import { handleToolError } from "../utils/error.utils.js";

export function createGetAccountSettingsTool(apiService: DataDomeApiService) {
  return {
    name: "get_account_settings",
    config: {
      title: "Get account settings",
      description: "Return the parameters for the account",
      inputSchema: {},
    },
    handler: async (): Promise<McpToolResponse> => {
      try {
        const settings = await apiService.get<AccountSettings>(
          "/1.0/account/settings",
          { accept: "application/json" }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(settings) }],
        };
      } catch (error) {
        return handleToolError(error, "get account settings");
      }
    },
  };
}
