import { useDataEngine } from "@dhis2/app-runtime";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { initialQueryOptions } from "../query-options";

export const RootRoute = createRootRouteWithContext<{
    queryClient: QueryClient;
    engine: ReturnType<typeof useDataEngine>;
}>()({
    component: Outlet,
    loader: async ({ context }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(initialQueryOptions(engine));
        return data;
    },
});
