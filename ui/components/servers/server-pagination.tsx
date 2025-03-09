import { Button } from "@/components/ui/button";

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ServerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ServerPaginationProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
      <span className="text-sm text-muted-foreground self-center">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
