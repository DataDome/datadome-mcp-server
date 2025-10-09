import { TabularJson } from "../types/mcp.types.js";

export function toTabularJson(data: Record<string, unknown>[]): TabularJson {
  if (data.length === 0) {
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(data[0]);
  const rows = data.map((row) => columns.map((col) => row[col]));

  return { columns, rows };
}
