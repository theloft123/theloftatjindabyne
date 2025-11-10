"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/siteContent";
import { useAccess } from "./AccessContext";

type SiteContentContextValue = {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateContent: (content: SiteContent) => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | undefined>(
  undefined
);

export function SiteContentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, clearAccess } = useAccess();

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/site-content");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load site content.");
      }
      const data = (await response.json()) as { content: SiteContent };
      setContent(data.content);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = useCallback(
    async (nextContent: SiteContent) => {
      if (!token) {
        throw new Error("Admin session required to update content.");
      }

      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: nextContent }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) {
          clearAccess();
          throw new Error("Admin session expired. Log in again to continue editing.");
        }
        throw new Error(body.error ?? "Failed to update site content.");
      }

      setContent(nextContent);
    },
    [clearAccess, token]
  );

  useEffect(() => {
    void fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider
      value={{ content, loading, error, refresh: fetchContent, updateContent }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return context;
}

