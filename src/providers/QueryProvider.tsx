"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { seedCommunityCatalogCache } from "@/lib/catalog/cache";
import { createQueryClient } from "@/lib/query/client";

type QueryProviderProps = {
  children: ReactNode;
  initialCommunityCatalog?: Record<string, string[]>;
};

export function QueryProvider({
  children,
  initialCommunityCatalog = {},
}: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const client = createQueryClient();
    seedCommunityCatalogCache(client, initialCommunityCatalog);
    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
