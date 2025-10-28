import { createRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Performance from "../../../../components/performance";
import Spinner from "../../../../components/Spinner";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { OutcomePerformanceRoute } from "./route";
export const OutcomePerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomePerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutcomePerformanceRoute.useRouteContext();
    const results = OutcomePerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        OutcomePerformanceIndexRoute.useSearch();

    const { data, isLoading, isError, error } = useQuery(
        dataElementsFromGroupQueryOptions({
            engine,
            dataElementGroupSets: results.dataElementGroupSets,
            pe,
            quarters,
            category,
            categoryOptions,
        }),
    );
    if (isLoading)
        return <Spinner message="Loading Outcome Performance data..." />;

    if (isError) return <div>{`Error: ${error}`}</div>;

    if (data !== undefined) return <Performance props={[votes, data]} />;
    return null;
}
