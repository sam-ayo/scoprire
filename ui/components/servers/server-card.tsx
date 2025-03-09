import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ServerConfigForm } from "./server-config-form";

interface MCPServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  createdAt: string;
  useCount: number;
  homepage: string;
}

interface ConfigSchema {
  type: string;
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      required?: boolean;
    }
  >;
  required?: string[];
}

export function ServerCard({ server }: { server: MCPServer }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configSchema, setConfigSchema] = useState<ConfigSchema | null>(null);
  const [pendingConnection, setPendingConnection] = useState<any>(null);

  const startServerConnection = async () => {
    try {
      setIsLoading(true);

      // First, fetch server tools and connection info
      console.log("Fetching tools for server:", server.qualifiedName);
      const toolsResponse = await fetch(`http://localhost:3001/servers/tools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qualifiedName: server.qualifiedName,
        }),
      });

      const toolsData = await toolsResponse.json();
      console.log("Server tools response:", toolsData);

      if (!toolsResponse.ok) {
        throw new Error(toolsData.error || "Failed to fetch server tools");
      }

      if (!toolsData.connections || !toolsData.connections[0]) {
        throw new Error("No WebSocket connection available for this server");
      }

      const connection = toolsData.connections[0];

      // Check if the connection requires configuration
      if (
        connection.configSchema &&
        Object.keys(connection.configSchema).length > 0
      ) {
        setConfigSchema(connection.configSchema);
        setPendingConnection(connection);
        setShowConfigForm(true);
        return;
      }

      // If no config needed, connect directly
      await connectToServer(connection, {});
    } catch (error) {
      console.error("Error adding server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add server tools"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const connectToServer = async (
    connection: any,
    config: Record<string, any>
  ) => {
    try {
      setIsLoading(true);

      console.log("Connecting to server with connection:", connection);
      const connectResponse = await fetch(
        `http://localhost:3001/servers/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            connection,
            config,
          }),
        }
      );

      const connectData = await connectResponse.json();
      console.log("Server connect response:", connectData);

      if (!connectResponse.ok) {
        throw new Error(connectData.error || "Failed to connect to server");
      }

      if (!connectData.tools) {
        console.error("No tools in response:", connectData);
        throw new Error("No tools received from server connection");
      }

      if (!Array.isArray(connectData.tools)) {
        console.error("Tools is not an array:", connectData.tools);
        throw new Error("Invalid tools format received from server");
      }

      if (connectData.tools.length === 0) {
        console.warn("Received empty tools array from server");
      }

      // Store the tools in localStorage
      const existingTools = JSON.parse(
        localStorage.getItem("chatTools") || "[]"
      );
      const newTools = [...existingTools, ...connectData.tools];
      localStorage.setItem("chatTools", JSON.stringify(newTools));

      toast.success(`Added ${server.displayName} tools to chat`);
      router.push("/");
    } catch (error) {
      console.error("Error connecting to server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to connect to server"
      );
    } finally {
      setIsLoading(false);
      setShowConfigForm(false);
      setPendingConnection(null);
      setConfigSchema(null);
    }
  };

  const handleConfigSubmit = (config: Record<string, any>) => {
    if (pendingConnection) {
      connectToServer(pendingConnection, config);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full relative">
        <CardHeader className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg">{server.displayName}</CardTitle>
              <CardDescription className="mt-2 line-clamp-3">
                {server.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {server.useCount} uses
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="absolute bottom-4 right-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={startServerConnection}
                    disabled={isLoading}
                  >
                    <MessageSquarePlus
                      className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {showConfigForm && configSchema && (
        <ServerConfigForm
          isOpen={showConfigForm}
          onClose={() => {
            setShowConfigForm(false);
            setPendingConnection(null);
            setConfigSchema(null);
          }}
          onSubmit={handleConfigSubmit}
          configSchema={configSchema}
          serverName={server.displayName}
        />
      )}
    </>
  );
}
