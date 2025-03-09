import Anthropic from "@anthropic-ai/sdk";
import { Response } from "express";
import { UIMessage } from "ai";
import * as dotenv from "dotenv";
import { mcpClient } from "./mcp/client";
import { inspect } from "util";

dotenv.config();
const llmClient = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"],
});

interface StreamOptions {
  selectedTools?: string[]; // Optional array of tool names to enable
}

interface Tool {
  name: string;
  inputSchema: any;
}

const llmStreamResponse = async (
  messages: UIMessage[],
  res: Response,
  tools: Tool[],
  options: StreamOptions = {}
) => {
  const pendingOperations: Promise<void>[] = [];

  // Filter tools based on user selection if provided
  const availableTools = options.selectedTools
    ? tools.filter((tool) => options.selectedTools?.includes(tool.name))
    : tools;

  llmClient.messages
    .stream({
      max_tokens: 1000,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      model: "claude-3-5-sonnet-latest",
      tools: availableTools.map((t) => ({
        name: t.name,
        input_schema: t.inputSchema,
      })),
    })
    .on("text", (delta, snapshot) => {
      console.log("Text: ", snapshot);
      res.write(`0: ${JSON.stringify(delta)}\n\n`, (e) => {
        console.log("Error in write stream: ", e);
      });
    })
    .on("inputJson", async (delta, snapshot, toolName) => {
      // Track this async operation
      const operation = (async () => {
        console.log("Delta: ", delta);
        console.log(
          `snapshot: ${inspect(snapshot, { depth: null, colors: true })}`
        );
        console.log("Tool Name: ", toolName);

        console.log(Object.keys(snapshot as any));

        if (!(Object.keys(snapshot as any).length !== 0)) {
          return;
        }

        const result = await mcpClient.callTool({
          name: toolName,
          arguments: snapshot as any,
        });

        console.log("Result: ", result);

        const lastUserMessage = messages.filter((m) => m.role === "user").pop();

        const interpretationResponse = await llmClient.messages.create({
          model: "claude-3-5-sonnet-latest",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `User Query: ${lastUserMessage?.content}\n\nTool Used: ${toolName}\n\nTool Result: ${JSON.stringify(result.content)}\n\nPlease interpret this result in the context of the user's query and provide a clear explanation.`,
            },
          ],
        });

        const interpretation =
          interpretationResponse.content[0].type === "text"
            ? interpretationResponse.content[0].text
            : "Unable to interpret the result";

        res.write(`0: ${JSON.stringify(interpretation)}\n\n`, (e) => {
          if (e) console.log("Error in write stream: ", e);
        });
      })();

      pendingOperations.push(operation);
    })
    .on("end", async () => {
      await Promise.all(pendingOperations);
      res.end();
    });
};

export { llmStreamResponse };
