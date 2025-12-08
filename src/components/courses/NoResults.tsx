"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface NoResultsProps {
  onClearFilters: () => void;
}

export function NoResults({ onClearFilters }: NoResultsProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No courses found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
         {" We couldn't find any courses matching your criteria. Try adjusting your filters or search terms."}
        </p>
        <Button onClick={onClearFilters}>Clear All Filters</Button>
      </div>
    </div>
  );
}
