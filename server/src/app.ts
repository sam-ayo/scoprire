import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import server from "./mcp-server";
import { client } from "../../client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

const app = express();

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

app.post("/message", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).json({ message: "Server is not connected to client" });
  }
});

app.listen(3001);
