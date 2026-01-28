    "use client";

    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import {
      Select,
      SelectTrigger,
      SelectValue,
      SelectContent,
      SelectItem,
    } from "@/components/ui/select";
    import { Search, Filter, X } from "lucide-react";
    import { FilterState } from "@/types/course";

    interface FiltersProps {
      categories: string[];
      levels: string[];
      modes: string[];
      filters: FilterState;
      onFilterChange: (key: keyof FilterState, value: string) => void;
      hasActiveFilters: boolean;
      clearFilters: () => void;
      showFilters: boolean;
      setShowFilters: (show: boolean) => void;
      filteredCount: number;
      totalCourses: number;
    }

    export function Filters({
      categories,
      levels,
      modes,
      filters,
      onFilterChange,
      hasActiveFilters,
      clearFilters,
      showFilters,
      setShowFilters,
      filteredCount,
      totalCourses,
    }: FiltersProps) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search courses, tags, or keywords..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    onFilterChange("searchQuery", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Select
                  value={filters.category}
                  onValueChange={(value) => onFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.level}
                  onValueChange={(value) => onFilterChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.mode}
                  onValueChange={(value) => onFilterChange("mode", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {modes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Results Count & Clear */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing {filteredCount} of {totalCourses} courses
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }
