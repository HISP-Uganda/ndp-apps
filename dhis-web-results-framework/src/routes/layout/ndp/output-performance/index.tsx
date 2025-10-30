import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import React from "react";
import Performance from "../../../../components/performance";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { OutputPerformanceRoute } from "./route";
export const OutputPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutputPerformanceRoute,
    component: Component,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutputPerformanceRoute.useRouteContext();
    const results = OutputPerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        OutputPerformanceIndexRoute.useSearch();

    const { data } = useSuspenseQuery(
        dataElementsFromGroupQueryOptions({
            engine,
            dataElementGroupSets: results.dataElementGroupSets,
            pe,
            quarters,
            category,
            categoryOptions,
						votes
        }),
    );
    return <Performance props={[votes, data]} />;
}
