import { z } from "zod";
import { DataDomeApiService } from "../services/datadome-api.service.js";
import { CustomRule, CreateCustomRuleArgs } from "../types/datadome.types.js";
import { McpToolResponse } from "../types/mcp.types.js";
import { handleToolError } from "../utils/error.utils.js";

export function createGetCustomRulesTool(apiService: DataDomeApiService) {
  return {
    name: "get_custom_rules",
    config: {
      title: "Get custom rules",
      description: "Return a collection of all custom rules",
      inputSchema: {},
    },
    handler: async (): Promise<McpToolResponse> => {
      try {
        const rules = await apiService.get<CustomRule[]>(
          "/1.1/protection/custom-rules",
          { accept: "*/*" }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(rules) }],
        };
      } catch (error) {
        return handleToolError(error, "get custom rules");
      }
    },
  };
}

export function createCreateCustomRuleTool(apiService: DataDomeApiService) {
  return {
    name: "create_custom_rule",
    config: {
      title: "Create custom rule",
      description: "Create a new custom protection rule",
      inputSchema: {
        rule_name: z.string().max(70).describe("Rule name (≤70 chars)"),
        query: z.string().max(1000).describe("Lucene query string (≤1000 chars)"),
        rule_response: z
          .enum(["allow", "captcha", "block"])
          .describe("Action when rule matches"),
        rule_priority: z
          .enum(["low", "normal", "high"])
          .describe("Rule evaluation priority"),
      },
    },
    handler: async (args: CreateCustomRuleArgs): Promise<McpToolResponse> => {
      try {
        const body = {
          data: {
            rule_name: args.rule_name,
            query: args.query,
            rule_response: args.rule_response,
            rule_priority: args.rule_priority,
            rule_enabled: true,
          },
        };

        const created = await apiService.post<CustomRule>(
          "/1.1/protection/custom-rules",
          body,
          {
            accept: "*/*",
            contentType: "application/json",
          }
        );

        return {
          content: [{ type: "text", text: JSON.stringify(created) }],
        };
      } catch (error) {
        return handleToolError(error, "create custom rule");
      }
    },
  };
}
