import express, { Request, Response, RequestHandler } from "express";
import { UIMessage } from "ai";
import * as dotenv from "dotenv";
import { llmStreamResponse } from "./stream";
import { mcpClient } from "./mcp/client";
import cors from "cors";
import { createServerTransport, type ServerConnection } from "./mcp/transports";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY;

interface ServerToolsResponse {
  qualifiedName: string;
  displayName: string;
  connections: ServerConnection[];
}

const serverHandler: RequestHandler = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const searchQuery = req.query.q ? String(req.query.q) : "";
    const url = new URL("https://registry.smithery.ai/servers");

    url.searchParams.append("page", page.toString());
    if (searchQuery) {
      url.searchParams.append("q", searchQuery);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SMITHERY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Smithery API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
};

const toolsHandler: RequestHandler = async (_req, res) => {
  const tools = await mcpClient.listTools();
  res.json(tools);
};

const chatHandler: RequestHandler = async (req, res) => {
  console.log("Request body: ", req.body);
  const { messages } = req.body as {
    messages: UIMessage[];
  };

  try {
    llmStreamResponse(messages, res);
  } catch (error) {
    console.log("Error: ", error);
    return;
  }
};

const serverToolsHandler: RequestHandler = async (req, res) => {
  try {
    const { qualifiedName } = req.body;
    if (!qualifiedName) {
      return res.status(400).json({ error: "qualifiedName is required" });
    }

    const response = await fetch(
      `https://registry.smithery.ai/servers/${qualifiedName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SMITHERY_API_KEY}`,
        },
      }
    );

    const data = (await response.json()) as ServerToolsResponse;
    console.log("Server tools response:", data);

    if (!response.ok) {
      throw new Error(`Smithery API responded with status: ${response.status}`);
    }

    // Find WebSocket connection
    const wsConnection = data.connections.find((conn) => conn.type === "ws");
    if (!wsConnection) {
      return res
        .status(400)
        .json({ error: "No WebSocket connection available for this server" });
    }

    return res.json({ ...data, connections: [wsConnection] });
  } catch (error) {
    console.error("Error fetching server tools:", error);
    return res.status(500).json({ error: "Failed to fetch server tools" });
  }
};

const connectHandler: RequestHandler = async (req, res) => {
  try {
    const { connection, config = {} } = req.body as {
      connection: ServerConnection;
      config: Record<string, any>;
    };

    if (!connection || !connection.deploymentUrl) {
      return res
        .status(400)
        .json({ error: "connection with deploymentUrl is required" });
    }

    if (connection.type !== "ws") {
      return res
        .status(400)
        .json({ error: "Only WebSocket connections are supported" });
    }

    try {
      console.log("Creating transport for:", connection.deploymentUrl);
      const transport = await createServerTransport(connection, config);
      console.log("Transport created successfully");

      console.log("Connecting to server with mcpClient...");
      await mcpClient.connect(transport);
      console.log("Successfully connected to server");

      console.log("Fetching tools...");
      const tools = await mcpClient.listTools();
      console.log("Tools received:", tools);

      return res.json({
        message: "Successfully connected to server",
        tools: tools.tools,
      });
    } catch (error) {
      console.error("Error connecting to server:", error);
      return res.status(500).json({ error: "Failed to connect to server" });
    }
  } catch (error) {
    console.error("Error in server connection endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

app.get("/servers", serverHandler);
app.get("/tools", toolsHandler);
app.post("/api/chat", chatHandler);
app.post("/servers/tools", serverToolsHandler);
app.post("/servers/connect", connectHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
