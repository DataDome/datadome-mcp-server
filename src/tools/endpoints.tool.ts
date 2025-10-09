import { z } from "zod";
import { DataDomeApiService } from "../services/datadome-api.service.js";
import { Endpoint, EndpointsFilterArgs } from "../types/datadome.types.js";
import { McpToolResponse } from "../types/mcp.types.js";
import { toTabularJson } from "../utils/tabular.utils.js";
import { handleToolError } from "../utils/error.utils.js";

const ALLOWED_FIELDS = [
  "id",
  "name",
  "description",
  "order",
  "trafficUsage",
  "source",
  "domain",
  "pathInclusion",
  "pathExclusion",
  "userAgentInclusion",
  "detectionEnabled",
  "protectionEnabled",
  "query",
];

function filterEndpoints(endpoints: Endpoint[], args: EndpointsFilterArgs): Endpoint[] {
  return endpoints
    .filter((ep) => ep.deletedAt == null)
    .filter(
      (ep) =>
        (!args.id || ep.id === args.id) &&
        (!args.trafficUsage || ep.trafficUsage === args.trafficUsage) &&
        (!args.source || ep.source === args.source) &&
        (args.detectionEnabled === undefined ||
          ep.detectionEnabled === args.detectionEnabled) &&
        (args.protectionEnabled === undefined ||
          ep.protectionEnabled === args.protectionEnabled)
    );
}

function pickAllowedFields(endpoints: Endpoint[]): Record<string, unknown>[] {
  return endpoints.map((ep) => {
    const picked: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      picked[key] = ep[key as keyof Endpoint];
    }
    return picked;
  });
}

export function createGetAllEndpointsTool(apiService: DataDomeApiService) {
  return {
    name: "get_all_endpoints",
    config: {
      title: "List all endpoints",
      description: "Return a collection of all configured endpoint details",
      inputSchema: {
        id: z.string().optional().describe("Filter by ID"),
        trafficUsage: z
          .enum([
            "Login",
            "Rss",
            "Form",
            "General",
            "Payment",
            "Cart",
            "Forms",
            "Account Creation",
          ])
          .optional()
          .describe("Filter by intended traffic type"),
        source: z
          .enum(["Api", "Mobile App", "Web Browser"])
          .optional()
          .describe("Filter by client source"),
        detectionEnabled: z
          .boolean()
          .optional()
          .describe("Is detection enabled?"),
        protectionEnabled: z
          .boolean()
          .optional()
          .describe("Is protection enabled?"),
      },
    },
    handler: async (args: EndpointsFilterArgs): Promise<McpToolResponse> => {
      try {
        const endpoints = await apiService.get<Endpoint[]>("/1.0/endpoints", {
          accept: "application/json",
        });

        const filtered = filterEndpoints(endpoints, args);
        const picked = pickAllowedFields(filtered);
        const tabular = toTabularJson(picked);

        return {
          content: [{ type: "text", text: JSON.stringify(tabular) }],
        };
      } catch (error) {
        return handleToolError(error, "list endpoints");
      }
    },
  };
}
