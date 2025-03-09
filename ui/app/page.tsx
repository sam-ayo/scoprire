"use client";

import { Chat } from "@/components/chat";
import { useTools } from "@/hooks/use-tools";
import { Loader } from "lucide-react";
import { Toaster } from "sonner";

export default function Home() {
  const { data, isLoading } = useTools();

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
