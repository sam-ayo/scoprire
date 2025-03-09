import { useQuery } from "@tanstack/react-query";
import { Tool, ServerConfig } from "@/types/tools";

async function fetchTools() {
  try {
    // Only try to get MCP tools if they exist in localStorage
    const mcpServersStr = localStorage.getItem("mcpServers");
    if (!mcpServersStr) {
      return { tools: [] };
    }

    // Get stored MCP server configurations
    const storedServers = JSON.parse(mcpServersStr) as ServerConfig[];
    if (
      !storedServers ||
      !Array.isArray(storedServers) ||
      storedServers.length === 0
    ) {
      return { tools: [] };
    }

    // Extract tools from stored MCP server configurations
    const mcpTools = storedServers.reduce(
      (acc: Tool[], server: ServerConfig) => {
        return [...acc, ...server.tools];
      },
      []
    );

    return {
      tools: mcpTools,
    };
  } catch (error) {
    console.error("Error fetching tools:", error);
    return { tools: [] };
  }
}

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: fetchTools,
  });
}
