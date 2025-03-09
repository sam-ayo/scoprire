"use client";

import { PreviewMessage } from "@/components/message";
import { Tools } from "@/components/tools";
import { Textarea } from "@/components/ui/textarea";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader, Hammer } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { uniqueId } from "lodash";

interface Tool {
  id: string;
  name: string;
  description: string;
}

function Chat({ tools }: { tools: Tool[] }) {
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
    useChat({
      api: "http://localhost:3001/api/chat",
    });

  const [containerRef, endRef] = useScrollToBottom();

  if (error) return <div>{error.message}</div>;

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`flex flex-col h-screen ${!hasMessages ? "justify-center" : ""}`}
    >
      {!hasMessages && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-8 text-zinc-800">
            What can I help with?
          </h1>
          <div className="flex gap-2 justify-center mb-8">
            <Button variant="outline" className="rounded-full">
              <Hammer className="w-4 h-4 mr-2" />
              Browse Services
            </Button>
            <Button variant="outline" className="rounded-full">
              Connect to Server
            </Button>
            <Button variant="outline" className="rounded-full">
              Explore Tools
            </Button>
            <Button variant="outline" className="rounded-full">
              More
            </Button>
          </div>
        </div>
      )}

      {hasMessages && (
        <div
          className="flex-1 overflow-y-auto space-y-6 p-4 pb-[200px]"
          // @ts-expect-error ref
          ref={containerRef}
        >
          {messages.map((message) => (
            <PreviewMessage
              message={message}
              key={uniqueId(`message-${message.id}`)}
              isLoading={isLoading}
            />
          ))}
          {/*  @ts-expect-error ref */}
          <div ref={endRef} />
        </div>
      )}

      <div
        className={`${
          hasMessages
            ? "fixed bottom-0 left-0 right-0"
            : "w-full max-w-2xl mx-auto"
        } bg-background`}
      >
        <div className={`max-w-2xl mx-auto ${hasMessages ? "p-4" : "px-4"}`}>
          <form
            onSubmit={(event) => {
              handleSubmit(event, {
                body: {
                  mcpTools: tools,
                },
              });
            }}
          >
            <div className="relative">
              <Textarea
                className="resize-none min-h-[120px] max-h-[300px] pr-12 bg-zinc-900/5 border border-zinc-300 rounded-2xl shadow-sm"
                value={input}
                placeholder={hasMessages ? "Message..." : "Message..."}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e, {
                      body: {
                        mcpTools: tools,
                      },
                    });
                  }
                }}
              />
              <div className="absolute right-2 top-2">
                <button
                  type="submit"
                  className="rounded-full p-2 bg-black hover:bg-zinc-900"
                >
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <Link href="/servers">
                  <Button variant="ghost" size="sm" className="h-8">
                    <Hammer className="w-4 h-4 mr-2" />
                    Browse services
                  </Button>
                </Link>
                <button className="rounded-xl p-2 hover:bg-zinc-500">
                  <Tools tools={tools} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      try {
        // Get transport tools from localStorage
        const storedTransportTools = JSON.parse(
          localStorage.getItem("transportTools") || "[]"
        );

        // Fetch default tools from the server
        const response = await fetch("http://localhost:3001/tools");
        if (!response.ok) {
          throw new Error("Failed to fetch default tools");
        }
        const serverData = await response.json();

        // Combine default tools with stored transport tools, ensuring no duplicates by tool name
        const allTools = [
          ...serverData.tools,
          ...storedTransportTools.filter(
            (storedTool: Tool) =>
              !serverData.tools.some(
                (defaultTool: Tool) => defaultTool.name === storedTool.name
              )
          ),
        ];

        return { tools: allTools };
      } catch (error) {
        console.error("Error fetching tools:", error);
        // If there's an error fetching default tools, just use stored transport tools
        const storedTransportTools = JSON.parse(
          localStorage.getItem("transportTools") || "[]"
        );
        return { tools: storedTransportTools };
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Toaster />
      <div className="h-full">{data?.tools && <Chat tools={data.tools} />}</div>
    </main>
  );
}
