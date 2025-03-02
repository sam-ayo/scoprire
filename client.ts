import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const clientTransport = new SSEClientTransport(
  new URL("http://localhost:3001/sse"),
  {}
);

export const client = new Client(
  { name: "example-client", version: "1.0.0" },
  { capabilities: { prompts: {}, resources: {}, tools: {} } }
);

(async () => {
  try {
    await client.connect(clientTransport);

    const tools = await client.listTools();
    console.log("Tools: ", tools);

    // Call a tool
    const result = await client.callTool({
      name: "add",
      arguments: { a: 1, b: 2 },
    });
    console.log("Result: ", result);
  } catch (error) {
    console.error("Error:", error);
  }
})();
