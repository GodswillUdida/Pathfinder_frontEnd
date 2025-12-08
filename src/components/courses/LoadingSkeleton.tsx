import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-64 animate-pulse" />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-t-lg" />
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
