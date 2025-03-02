import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface StatusUpdate {
  title: string;
  description: string;
}

interface StatusProps {
  updates: StatusUpdate[];
  className?: string;
}

export function DeepResearchStatus({ updates, className }: StatusProps) {
  if (updates.length === 0) return null;
  const currentUpdate = updates[updates.length - 1];

  return (
    <div className={cn("relative px-4 py-2 bg-zinc-100 rounded-md", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentUpdate.title}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: 90 }}
          transition={{
            duration: 0.3,
            ease: [0.645, 0.045, 0.355, 1.0],
          }}
          className="flex flex-col w-full h-full"
        >
          <p className="text-sm font-mono tracking-tight text-zinc-950 line-clamp-2">
            {currentUpdate.title}
          </p>
          {/* {currentUpdate.description && (
            <p className="text-xs font-mono tracking-tight text-zinc-950 px-4 py-2 bg-zinc-100 rounded-md">
              {currentUpdate.description}
            </p>
          )} */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
