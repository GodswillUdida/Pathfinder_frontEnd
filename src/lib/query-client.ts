// lib/query-client.ts
// Per-request QueryClient for Server Components. `cache()` scopes this
// to a single request so concurrent requests never share state, while
// still deduping multiple prefetches within the same render.
import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // Data prefetched on the server is fresh for this long before
          // the client will consider refetching it — prevents the
          // hydrated cache from being immediately invalidated on mount.
          staleTime: 60 * 1000,
        },
      },
    })
);