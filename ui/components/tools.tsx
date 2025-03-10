import { useState } from "react";
import { Hammer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uniqueId } from "lodash";

interface Tool {
  id: string;
  name: string;
  description: string;
}

function TruncatedDescription({ text }: { text: string }) {
  const words = text.split(" ");
  const truncated =
    words.length > 20 ? words.slice(0, 20).join(" ") + "..." : text;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-sm text-muted-foreground">{truncated}</p>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-[300px] whitespace-normal"
        >
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Tools({ tools }: { tools: Tool[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowModal(true)}
              className="flex gap-x-1 items-center justify-center"
            >
              <Hammer className="h-4 w-4 text-grey" />
              <p>{tools?.length || 0}</p>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Available Tools</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Available Tools</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {tools?.map((tool) => (
                <div key={uniqueId(`tool-${tool.id}`)} className="space-y-2">
                  <h3 className="font-semibold">{tool.name}</h3>
                  <TruncatedDescription text={tool.description} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
