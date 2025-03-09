export interface ToolParameter {
  type: string;
  description: string;
  required?: boolean;
  properties?: Record<string, ToolParameter>;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ServerConfig {
  connection: {
    type: string;
    deploymentUrl: string;
    configSchema?: Record<string, ToolParameter>;
  };
  config: Record<string, unknown>;
  displayName: string;
  qualifiedName: string;
  tools: Tool[];
}
