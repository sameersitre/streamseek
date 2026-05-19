"use client";

import {
  FloTraceProvider,
  type TanStackQueryClientApi,
} from "@flotrace/runtime";
import { getQueryClient } from "@/app/lib/queryClient";
// optional — remove if not using Zustand
import { useAppStore } from "@/app/stores/useAppStore";
// optional — remove if not using Redux
// import { store } from "@/app/store";

type ZustandStoreLike = {
  subscribe: (...args: unknown[]) => () => void;
  getState: () => Record<string, unknown>;
};

export default function FloTrace({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <FloTraceProvider
      config={{ appName: "StreamSeek" }}
      // optional — remove if not using Zustand
      stores={{ appStore: useAppStore as unknown as ZustandStoreLike }}
      // optional — remove if not using Redux
      // reduxStore={store}
      // optional — remove if not using TanStack Query
      queryClient={queryClient as unknown as TanStackQueryClientApi}
    >
      {children}
    </FloTraceProvider>
  );
}
