import { useDataEngine } from "@dhis2/app-runtime";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { analyticsQueryOptions } from "../query-options";
import { DataElementGroupSet, GoalSearch } from "../types";
import { buildQueryParams, resolveDataElementGroups } from "../utils";

export const useDataElementGroups = (
    searchParams: GoalSearch,
    dataElementGroupSets: DataElementGroupSet[],
): { groupSets: string[]; dataElementGroups: string[] } => {
    return useMemo(() => {
        return resolveDataElementGroups(searchParams, dataElementGroupSets);
    }, [
        searchParams.deg,
        searchParams.degs,
        searchParams.program,
        dataElementGroupSets,
    ]);
};

export const useAnalyticsQuery = (
    engine: ReturnType<typeof useDataEngine>,
    dataElementGroups: { groupSets: string[]; dataElementGroups: string[] },
    searchParams: GoalSearch,
) => {
    const queryParams = useMemo(() => {
        return buildQueryParams(dataElementGroups, searchParams);
    }, [
        dataElementGroups,
        searchParams.pe,
        searchParams.ou,
        searchParams.program,
    ]);
    const queryOptions = useMemo(
        () => analyticsQueryOptions(engine, queryParams),
        [engine, queryParams, analyticsQueryOptions],
    );
    return useSuspenseQuery(queryOptions);
};
export const useRouteAnalytics = (
    routeContext: { engine: ReturnType<typeof useDataEngine> },
    searchParams: GoalSearch,
    dataElementGroupSets: DataElementGroupSet[],
) => {
    const { engine } = routeContext;
    const dataElementGroups = useDataElementGroups(
        searchParams,
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, searchParams);

    const resultsProps = useMemo(
        () => ({
            data: data.data,
            dataElementGroupSets,
            tab: searchParams.tab,
            deg: searchParams.deg,
            ou: searchParams.ou,
            pe: searchParams.pe,
            degs: searchParams.degs,
        }),
        [
            data.data,
            dataElementGroupSets,
            searchParams.tab,
            searchParams.deg,
            searchParams.ou,
            searchParams.pe,
            searchParams.degs,
        ],
    );

    return {
        data,
        resultsProps,
        dataElementGroups,
    };
};
