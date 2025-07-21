import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { GoalRoute } from "./route";
import { ResultsProps } from "../../../../types";

export const GoalIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => GoalRoute,
    component: Component,
});

function Component() {
    const { engine } = GoalIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs } = GoalIndexRoute.useSearch();
    const navigate = GoalIndexRoute.useNavigate();
    const dataElementGroupSets = GoalRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        { deg, pe, ou, program, degs },
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        deg,
        pe,
        ou,
        program,
        degs,
    });

    const onChange = useCallback(
        (key: string) => {
            navigate({
                search: (prev) => ({
                    ...prev,
                    tab: key,
                }),
            });
        },
        [navigate],
    );

    const resultsProps = useMemo<ResultsProps>(
        () => ({
            data: {
                ...data.data,
                ...dataElementGroups,
            },
            dataElementGroupSets,
            onChange,
            tab,
            deg,
            ou,
            pe,
            degs,

            prefixColumns: [
                {
                    title: "Goal",
                    dataIndex: "dataElementGroupSet",
                },
                {
                    title: "Key Result Areas",
                    dataIndex: "dataElementGroup",
                },
            ],
            // prefixColumns: [
            //     { title: "Goal", dataIndex: degs },
            //     {
            //         title: "Key Result Areas",
            //         dataIndex: deg,
            //         render: (
            //             _,
            //             row: Record<string, string | number | undefined>,
            //         ) =>
            //             dataElementGroups.dataElementGroups
            //                 .flatMap((group) => {
            //                     const value = row[group];
            //                     if (value === undefined) {
            //                         return [];
            //                     }
            //                     return value;
            //                 })
            //                 .join(" "),
            //     },
            // ],
        }),
        [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs],
    );

    return <Results {...resultsProps} />;
}
