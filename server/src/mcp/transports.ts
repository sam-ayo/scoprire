import { createTransport } from "@smithery/sdk";

interface ServerConnection {
  type: "ws";
  deploymentUrl: string;
  configSchema?: Record<string, any>;
}

const createServerTransport = async (
  connection: ServerConnection,
  config = {}
) => {
  if (connection.type !== "ws") {
    throw new Error("Only WebSocket connections are supported");
  }
  const transport = createTransport(connection.deploymentUrl, config);
  return transport;
};

export { createServerTransport, type ServerConnection };
