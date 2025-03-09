"use client";

import { Toaster } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ServerSearch } from "@/components/servers/server-search";
import { ServerGrid } from "@/components/servers/server-grid";
import { ServerPagination } from "@/components/servers/server-pagination";

interface MCPServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  createdAt: string;
  useCount: number;
  homepage: string;
}

interface ServerResponse {
  servers: MCPServer[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

export default function ServersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = useQuery<ServerResponse>({
    queryKey: ["servers", page, debouncedSearch],
    queryFn: async () => {
      const url = new URL("http://localhost:3001/servers");
      url.searchParams.append("page", page.toString());
      if (debouncedSearch) {
        url.searchParams.append("q", debouncedSearch);
      }
      const res = await fetch(url.toString());
      return await res.json();
    },
  });

  return (
    <main className="min-h-screen bg-background py-8">
      <Toaster />
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Available MCP Servers</h1>
            <p className="text-muted-foreground">
              Browse and select servers to add to your chat application.
            </p>
          </div>

          <ServerSearch
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
          />

          <ServerGrid
            servers={data?.servers}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />

          {data?.pagination && data.servers.length > 0 && (
            <ServerPagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </main>
  );
}
