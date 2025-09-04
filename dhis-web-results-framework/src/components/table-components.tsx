import React from "react";
import { DataElementGroupSet, GoalSearch } from "../types";
import { useRouteAnalytics } from "../hooks/data-hooks";
import { Results } from "./results";
import { useDataEngine } from "@dhis2/app-runtime";

interface AnalyticsRouteProps {
    routeContext: { engine: ReturnType<typeof useDataEngine> };
    searchParams: GoalSearch;
    dataElementGroupSets: DataElementGroupSet[];
}

export const AnalyticsRoute: React.FC<AnalyticsRouteProps> = ({
    routeContext,
    searchParams,
    dataElementGroupSets,
}) => {
    const { resultsProps } = useRouteAnalytics(
        routeContext,
        searchParams,
        dataElementGroupSets,
    );

    return <Results {...resultsProps} />;
};

export const createAnalyticsRouteComponent = () => {
    return (
        useRouteContext: () => { engine: ReturnType<typeof useDataEngine> },
        useSearch: () => GoalSearch,
        useLoaderData: () => any,
    ) => {
        const Component = () => {
            const routeContext = useRouteContext();
            const searchParams = useSearch();
            const loaderData = useLoaderData();
            const dataElementGroupSets =
                loaderData?.dataElementGroupSets || loaderData || [];

            return (
                <AnalyticsRoute
                    routeContext={routeContext}
                    searchParams={searchParams}
                    dataElementGroupSets={dataElementGroupSets}
                />
            );
        };

        Component.displayName = "AnalyticsRouteComponent";
        return Component;
    };
};
