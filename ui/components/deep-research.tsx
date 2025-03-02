"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Research } from "@/ai/agents/deep-research";
import type { JSONValue, ToolInvocation } from "ai";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, LinkIcon } from "lucide-react";
import { DeepResearchStatus, StatusUpdate } from "./steps";
import { Markdown } from "./markdown";

function formatElapsedTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

export const DeepResearch = ({
  toolInvocation,
  annotations,
}: {
  toolInvocation: ToolInvocation;
  annotations?: JSONValue[];
}) => {
  const { state } = toolInvocation;
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (state !== "result") {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, state]);

  const statusUpdates = annotations
    ?.filter(
      (
        annotation,
      ): annotation is { status: { title: string; description?: string } } =>
        annotation !== null &&
        typeof annotation === "object" &&
        "status" in annotation,
    )
    .map((update) => update.status);

  const steps: StatusUpdate[] = (statusUpdates || []).map((status) => ({
    title: status.title,
    description: status.description || "",
  }));

  const sourceUpdates = Array.from(
    new Set(
      annotations?.filter(
        (
          annotation,
        ): annotation is { source: { title: string; url: string } } =>
          annotation !== null &&
          typeof annotation === "object" &&
          "source" in annotation,
      ),
    ),
  ) as {
    source: { title: string; url: string };
  }[];

  if (state === "result") {
    const { result } = toolInvocation;
    const {
      report,
      research,
    }: { report: { report: string; title: string }; research: Research } =
      result;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-zinc-200 mb-4"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-zinc-500" />
              <h2 className="text-xl font-semibold">Deep Research</h2>
            </div>
            <div className="text-sm text-zinc-500 pr-2">
              Completed in {formatElapsedTime(elapsedTime)}
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full">
              <motion.div className="w-full text-left p-4 rounded-xl hover:bg-zinc-50 border border-zinc-200 shadow-sm hover:border-zinc-200 transition-colors mb-6">
                <h3 className="text-lg mb-2 font-semibold">{report.title}</h3>
                <div className="text-zinc-500 line-clamp-2 text-xs font-mono">
                  {report.report.slice(0, 250)}
                </div>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium tracking-tight flex pt-2 items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" />
                  {report.title}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-full mt-4 border-t border-border">
                <div className="prose prose-zinc px-4 py-2 prose-headings:font-normal prose-a:text-zinc-900 hover:prose-a:text-zinc-500 prose-a:transition-colors prose-a:duration-200 max-w-none">
                  <Markdown>{report.report}</Markdown>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {research.sources && research.sources.length > 0 && (
            <Dialog>
              <DialogTrigger className="text-sm text-zinc-500 mx-2 hover:text-zinc-600 transition-colors cursor-pointer">
                Deep Research used{" "}
                {Array.from(new Set(research.sources)).length} sources.
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[75vh]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium tracking-tight flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-zinc-500" />
                    Sources Used
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh]">
                  <p className="text-sm text-zinc-600 mb-4">
                    The following sources were used in the research:
                  </p>
                  <div className="text-sm text-zinc-600 space-y-2">
                    <AnimatePresence>
                      {Array.from(new Set(research.sources)).map(
                        (source, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="p-4 border border-zinc-200 rounded-lg mb-4"
                          >
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:opacity-75 transition-opacity"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={source.favicon}
                                  alt="Favicon"
                                  className="w-4 h-4 rounded-full"
                                />
                                {source.title}
                              </div>
                              <p className="text-zinc-600 text-sm line-clamp-2">
                                {source.content}
                              </p>
                            </a>
                          </motion.div>
                        ),
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-zinc-400" />
            <h2 className="text-2xl font-normal">Deep Research</h2>
          </div>
          <div className="text-sm text-zinc-400">
            Time elapsed: {formatElapsedTime(elapsedTime)}
          </div>
        </div>

        <div className="space-y-6">
          <DeepResearchStatus updates={steps} className="mt-6" />

          {sourceUpdates && sourceUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <div className="text-sm text-zinc-500">
                Sources found so far:{" "}
                {
                  Array.from(new Set(sourceUpdates.map((s) => s.source.url)))
                    .length
                }
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
