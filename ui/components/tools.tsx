import { Hammer } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function Tools({ tools }: { tools: [] }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex gap-x-1 items-center justify-center">
          <Hammer className="h-4 w-4 text-grey" />
          <p>{tools && tools.length}</p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div>
            {tools &&
              tools.map((tool, index) => <p key={index}>{tool.name}</p>)}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
