"use client";

import { PreviewMessage } from "@/components/message";
import { Tools } from "@/components/tools";
import { Textarea } from "@/components/ui/textarea";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "@ai-sdk/react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { ArrowRight, Hammer } from "lucide-react";
import { useEffect, useState } from "react";

const transport1 = new SSEClientTransport(
  new URL("http://localhost:3001/sse"),
  {}
);

export const client = new Client(
  { name: "example-client", version: "1.0.0" },
  { capabilities: { prompts: {}, resources: {}, tools: {} } }
);

export default function Chat() {
  const [tools, setTools] = useState<any>(null);
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
    useChat({ maxSteps: 10, body: { mcpTools: tools } });
  const [containerRef, endRef] = useScrollToBottom();

  console.log(tools);

  useEffect(() => {
    const connectClient = async () => {
      try {
        await client.connect(transport1);
        const tools = await client.listTools();
        setTools(() => tools);
      } catch (error) {
        console.log("Error: ", error);
        setTools(0);
      }
    };
    connectClient();
  }, []);

  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto stretch h-dvh">
      <div
        className="space-y-6 h-full flex-1 py-12 overflow-y-scroll"
        // @ts-expect-error ref
        ref={containerRef}
      >
        {messages.map((message) => (
          <PreviewMessage
            message={message}
            key={message.id}
            isLoading={isLoading}
          />
        ))}
        {/*  @ts-expect-error ref */}
        <div ref={endRef} className="pb-10" />
      </div>

      <form className="mb-4">
        <div className="relative w-full h-32">
          <Textarea
            className="bg-zinc-200 border-2 pt-2 pb-6 w-full max-w-2xl rounded-xl my-4 pr-12 h-32 align-top resize-none"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 rounded-full p-2 bg-black hover:bg-zinc-900"
          >
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
          <button
            type="submit"
            className="absolute bottom-2 right-2 rounded-xl p-2 hover:bg-zinc-500"
          >
            <Tools tools={tools && tools.tools} />
          </button>
        </div>
      </form>
    </div>
  );
}
