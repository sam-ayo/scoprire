import { createTransport, MultiClient } from "@smithery/sdk";

const mcpMultiClient = new MultiClient({
  name: "multi-client-example",
  version: "1.0.0",
});

console.log("Brave api key: ", process.env.NEXT_PUBLIC_BRAVE_API_KEY);

const braveTransport = createTransport(
  "https://server.smithery.ai/@smithery-ai/brave-search",
  {
    braveApiKey: process.env.NEXT_PUBLIC_BRAVE_API_KEY,
  }
);

export { mcpMultiClient, braveTransport };
