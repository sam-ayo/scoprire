"use client";

import type { Message } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import equal from "fast-deep-equal";

import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { DeepResearch } from "./deep-research";

const PurePreviewMessage = ({
  message,
}: {
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit"
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-accent">
              <div className="translate-y-px">
                <SparklesIcon size={14} className="text-foreground" />
              </div>
            </div>
          )}

          <div className="flex flex-col w-full">
            {message.parts?.map((part) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={`message-${message.id}`}
                      className="flex flex-row gap-2 items-start w-full pb-4"
                    >
                      <div
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{part.text as string}</Markdown>
                      </div>
                    </div>
                  );
                case "tool-invocation":
                  const { toolName, toolCallId, state } = part.toolInvocation;
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ["deepResearch"].includes(toolName),
                      })}
                    >
                      {toolName === "deepResearch" ? (
                        <DeepResearch
                          toolInvocation={part.toolInvocation}
                          annotations={message.annotations}
                        />
                      ) : toolName === "webSearch" ? (
                        state === "result" ? null : (
                          <motion.div
                            className="font-mono text-xs p-2 bg-accent text-accent-foreground animate-pulse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Searching the web...
                          </motion.div>
                        )
                      ) : null}
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.annotations !== nextProps.message.annotations)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;

    return true;
  }
);
