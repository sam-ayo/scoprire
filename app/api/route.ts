import { deepResearchTool } from "@/ai/agents/deep-research";
import { tools } from "@/ai/tools";
import { openai } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText } from "ai";

// Allow streaming responses up to 120 seconds
export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o"),
        messages,
        system:
          "You are a helpful assistant. Do not repeat the results of deepResearch tool calls. You can report (max 2 sentences) that the tool has been used successfully. Do not call multiple tools at once.",
        tools: { ...tools, deepResearch: deepResearchTool(dataStream) },
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
