export interface McpToolResponse {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface TabularJson {
  columns: string[];
  rows: unknown[][];
}
