import { z } from "zod";
import { DataDomeApiService } from "../services/datadome-api.service.js";
import { UsageMetrics, RequestsMetricsArgs } from "../types/datadome.types.js";
import { McpToolResponse } from "../types/mcp.types.js";
import { parseTimeRange, formatDateForApi } from "../utils/date.utils.js";
import { handleToolError } from "../utils/error.utils.js";

export function createGetAccountUsageTool(apiService: DataDomeApiService) {
  return {
    name: "get_account_usage",
    config: {
      title: "Get account usage metrics",
      description: "Return the account usage and number of requests across endpoints",
      inputSchema: {
        range: z
          .string()
          .describe(
            "Time filter keyword: 'today', 'yesterday', 'last X minutes' (X≤2880), or 'last X hours' (X≤48)"
          ),
        endpointId: z.string().optional().describe("Filter by ID"),
        domain: z.string().optional().describe("Filter by domain"),
      },
    },
    handler: async (args: RequestsMetricsArgs): Promise<McpToolResponse> => {
      try {
        const { start, end } = parseTimeRange(args.range);

        // build query params
        const params: Record<string, string> = {
          from: formatDateForApi(start),
          to: formatDateForApi(end),
        };
        if (args.endpointId) params.endpointId = args.endpointId;
        if (args.domain) params.domain = args.domain;

        const usage = await apiService.get<UsageMetrics[]>("/1.0/account/usage", {
          accept: "*/*",
          params,
        });

        return {
          content: [{ type: "text", text: JSON.stringify(usage) }],
        };
      } catch (error) {
        return handleToolError(error, "get usage metrics");
      }
    },
  };
}
