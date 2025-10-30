import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import React from "react";
import Performance from "../../../../components/performance";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { OutcomePerformanceRoute } from "./route";
export const OutcomePerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomePerformanceRoute,
    component: Component,
    // errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutcomePerformanceRoute.useRouteContext();
    const results = OutcomePerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        OutcomePerformanceIndexRoute.useSearch();

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
