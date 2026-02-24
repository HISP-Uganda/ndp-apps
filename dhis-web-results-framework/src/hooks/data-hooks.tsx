import { useDataEngine } from "@dhis2/app-runtime";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { analyticsQueryOptions } from "../query-options";
import { GoalSearch } from "../types";
export const useAnalyticsQuery = ({
    engine,
    search,
    attributeValue,
    ndpVersion,
    queryByOu,
    specificLevel,
    ouIsFilter = true,
    isVision,
    goal,
    keyResultArea,
}: {
    engine: ReturnType<typeof useDataEngine>;
    search: GoalSearch;
    attributeValue?: string;
    ndpVersion: string;
    queryByOu?: boolean;
    specificLevel?: number;
    ouIsFilter?: boolean;
    isVision?: boolean;
    goal?: string;
    keyResultArea?: string;
}) => {
    const queryOptions = useMemo(
        () =>
            analyticsQueryOptions({
                engine,
                search,
                attributeValue,
                ndpVersion,
                queryByOu,
                specificLevel,
                ouIsFilter,
                isVision,
            }),
        [
            engine,
            Object.values(search).sort().join(","),
            ndpVersion,
            attributeValue,
        ],
    );
    const { data } = useSuspenseQuery(queryOptions);
    return data;
};
