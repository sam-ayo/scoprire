import Link from "next/link";
import { Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Welcome() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">
        What can I help with?
      </h1>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/servers">
                <Button
                  variant="outline"
                  className="rounded-full border-border hover:bg-accent"
                >
                  <Blocks className="w-4 h-4 mr-2" />
                  Browse Services
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Browse services</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          className="rounded-full border-border hover:bg-accent"
        >
          Connect to Server
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-border hover:bg-accent"
          onClick={() => {
            localStorage.removeItem("mcpServers");
            window.location.reload();
          }}
        >
          Clear Stored Servers
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-border hover:bg-accent"
        >
          Explore Tools
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-border hover:bg-accent"
        >
          More
        </Button>
      </div>
    </div>
  );
}
