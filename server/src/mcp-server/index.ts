import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({ name: "Demo", version: "1.0.0" });

server.tool;
// Add an addition tool
server.tool(
  "add",
  "Tool to add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", texit: String(a + b) }],
  })
);

// server.tool("subtract", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
//   content: [{ type: "text", text: String(a - b) }],
// }));

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
  })
);

export default server;

// Start receiving messages on stdin and sending messages on stdout
