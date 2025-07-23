export type McpServerType = "stdio" | "http" | "sse";

export interface McpServerConfig<T extends McpServerType = McpServerType> {
  type: T;
  command?: T extends "stdio" ? string : never;
  args?: T extends "stdio" ? string[] : never;
  url?: T extends "http" | "sse" ? string : never;
  env?: Record<string, string>;
  headers?: T extends "stdio" ? never : Record<string, string>;
}
