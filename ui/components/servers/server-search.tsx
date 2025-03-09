import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ServerSearch({ value, onChange }: ServerSearchProps) {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search servers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-sm pl-10"
      />
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
    </div>
  );
}
