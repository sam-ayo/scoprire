import { useChat } from "@ai-sdk/react";
import { Tool } from "@/types/tools";
import { PreviewMessage } from "@/components/message";
import { Tools } from "@/components/tools";
import { Textarea } from "@/components/ui/textarea";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { ArrowRight, Blocks } from "lucide-react";
import { uniqueId } from "lodash";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Welcome } from "./welcome";

interface ChatProps {
  tools: Tool[];
}

export function Chat({ tools }: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } =
    useChat({
      api: "http://localhost:3001/api/chat",
    });

  const [containerRef, endRef] = useScrollToBottom();

  if (error) return <div>{error.message}</div>;

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`flex flex-col h-[calc(100vh-3.5rem)] ${!hasMessages ? "justify-center" : ""}`}
    >
      {!hasMessages && <Welcome />}

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
        } bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
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
                className="resize-none min-h-[120px] max-h-[300px] pr-12 bg-background border-border rounded-2xl shadow-sm focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
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
                  className="rounded-full p-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-xl p-2 hover:bg-accent">
                        <Link href="/servers">
                          <Blocks className="h-4 w-4" />
                        </Link>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Browse services</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {tools.length > 0 && (
                  <div className="rounded-xl p-2 hover:bg-accent">
                    <Tools tools={tools} />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
