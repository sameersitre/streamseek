"use client";

import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/app/stores/useAppStore";

type FloTraceProviderProps = {
  children: React.ReactNode;
  config: Record<string, unknown>;
  stores?: Record<string, unknown>;
  queryClient?: unknown;
};

const FloTraceProviderBase = dynamic<FloTraceProviderProps>(
  () =>
    import("@flotrace/runtime").then(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mod: any) => mod.FloTraceProvider
    ),
  { ssr: false }
);

export default function FloTraceDevProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") {
    return <>{children}</>;
  }

  // useQueryClient() works because FloTraceDevProvider is nested
  // inside QueryClientProvider in the layout hierarchy
  const queryClient = useQueryClient();

  return (
    <FloTraceProviderBase
      config={{ appName: "StreamSeek", enabled: true }}
      stores={{
        appStore: useAppStore,
      }}
      queryClient={queryClient}
    >
      {children}
    </FloTraceProviderBase>
  );
}
