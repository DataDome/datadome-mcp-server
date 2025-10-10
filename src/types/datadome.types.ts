export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  accept?: string;
  contentType?: string;
  body?: unknown;
  extraHeaders?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export type TrafficUsage =
  | "Login"
  | "Rss"
  | "Form"
  | "General"
  | "Payment"
  | "Cart"
  | "Forms"
  | "Account Creation";

export type Source = "Api" | "Mobile App" | "Web Browser";

export type RuleResponse = "allow" | "captcha" | "block";

export type RulePriority = "low" | "normal" | "high";

export interface Endpoint {
  id: string;
  name: string;
  description: string;
  order: number;
  trafficUsage: TrafficUsage;
  source: Source;
  domain: string;
  pathInclusion: string;
  pathExclusion: string;
  userAgentInclusion: string;
  detectionEnabled: boolean;
  protectionEnabled: boolean;
  query: string;
  deletedAt?: string;
}

export interface CustomRule {
  rule_name: string;
  query: string;
  rule_response: RuleResponse;
  rule_priority: RulePriority;
  rule_enabled: boolean;
}

export interface AccountSettings {
  [key: string]: unknown;
}

export interface UsageMetrics {
  [key: string]: unknown;
}

export interface EndpointsFilterArgs {
  id?: string;
  trafficUsage?: TrafficUsage;
  source?: Source;
  detectionEnabled?: boolean;
  protectionEnabled?: boolean;
}

export interface CreateCustomRuleArgs {
  rule_name: string;
  query: string;
  rule_response: RuleResponse;
  rule_priority: RulePriority;
}

export interface RequestsMetricsArgs {
  range: string;
  endpointId?: string;
  domain?: string;
}
