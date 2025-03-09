import { Loader } from "lucide-react";
import { ServerCard } from "./server-card";

interface MCPServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  createdAt: string;
  useCount: number;
  homepage: string;
}

interface ServerGridProps {
  servers?: MCPServer[];
  isLoading: boolean;
  searchQuery: string;
}

export function ServerGrid({
  servers,
  isLoading,
  searchQuery,
}: ServerGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
        <div className="col-span-full flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!servers?.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No servers found
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servers.map((server) => (
        <ServerCard key={server.qualifiedName} server={server} />
      ))}
    </div>
  );
}
