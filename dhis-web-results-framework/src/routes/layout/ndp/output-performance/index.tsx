import { useQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import React from "react";
import Performance from "../../../../components/performance";
import Spinner from "../../../../components/Spinner";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { OutputPerformanceRoute } from "./route";
export const OutputPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutputPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutputPerformanceRoute.useRouteContext();
    const results = OutputPerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        OutputPerformanceIndexRoute.useSearch();

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
    if (isLoading) {
        return <Spinner message="Loading Output Performance data..." />;
    }

    if (isError) {
        return <div>{`Error: ${error}`}</div>;
    }

    if (data !== undefined) return <Performance props={[votes, data]} />;

    return null;
}
