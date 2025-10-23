import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ResultsProps } from "../../../../types";
import { GoalRoute } from "./route";

export const GoalIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => GoalRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = GoalIndexRoute.useRouteContext();
    const search = GoalIndexRoute.useSearch();
    const navigate = GoalIndexRoute.useNavigate();
    const dataElementGroupSets = GoalRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        search,
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, search);
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
            ...search,
            prefixColumns: [
                // {
                //     title: "Goal",
                //     key: "dataElementGroupSet",
                //     render: (_, record) => {
                //         let current = "";
                //         for (const group of dataElementGroupSets) {
                //             if (Object(record).hasOwnProperty(group.id)) {
                //                 current = group.name;
                //                 break;
                //             }
                //         }
                //         return current;
                //     },
                // },
                {
                    title: (
                        <div
                            style={{
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }}
                        >
                            Key Result Areas
                        </div>
                    ),
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, ...Object.values(search)],
    );

    return <Results {...resultsProps} />;
}
