import { deepResearchTool } from "@/ai/agents/deep-research";
import { tools } from "@/ai/tools";
import { openai } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText, tool, UIMessage } from "ai";
import { llmClient } from "./llm";
import { ToolUnion } from "@anthropic-ai/sdk/resources/index.mjs";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Allow streaming responses up to 120 seconds
export const maxDuration = 120;

const transport1 = new SSEClientTransport(
  new URL("http://localhost:3001/sse"),
  {}
);

export const client = new Client(
  { name: "example-client", version: "1.0.0" },
  { capabilities: { prompts: {}, resources: {}, tools: {} } }
);

export async function POST(req: Request) {
  const { messages, mcpTools } = (await req.json()) as {
    messages: UIMessage[];
    mcpTools: { tools: ToolUnion[] };
  };

  await client.connect(transport1);

  try {
    const response = await llmClient.messages.create({
      max_tokens: 1000,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      model: "claude-3-5-sonnet-latest",
      tools: mcpTools.tools.map((t) => ({
        name: t.name,
        input_schema: t.inputSchema,
      })),
    });

    console.log("Response: ", response);

    response.content.forEach(async (c) => {
      if (c.type === "tool_use") {
        const toolName = c.name;
        const toolInput = c.input;
        const result = await client.callTool({
          name: toolName,
          arguments: toolInput,
        });

        console.log("Result: ", result);
      }
    });
  } catch (error) {
    console.log("Error: ", error.error);
  }

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system: `You are a helpful assistant. Do not repeat the results of deepResearch tool calls. You can report (max 2 sentences) that the tool has been used successfully. Do not call multiple tools at once. Here are some extra tools you have access to ${mcpTools}`,
        tools: {
          ...tools,
          deepResearch: deepResearchTool(dataStream),
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
