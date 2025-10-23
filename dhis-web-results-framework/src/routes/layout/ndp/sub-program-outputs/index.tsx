import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";
import { SubProgramOutputRoute } from "./route";

export const SubProgramOutputIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutputRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = SubProgramOutputIndexRoute.useRouteContext();
    const search = SubProgramOutputIndexRoute.useSearch();
    const navigate = SubProgramOutputIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutputRoute.useLoaderData();
    const dataElementGroups = useDataElementGroups(
        search,
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        ...search,
        pe: derivePeriods(search.pe),
    });

    const onChange = (key: string) => {
        navigate({
            search: (prev) => ({
                ...prev,
                tab: key,
            }),
        });
    };

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
                //     title:
                //         search.v === "NDPIII"
                //             ? "Sub-Interventions"
                //             : "Interventions",
                //     dataIndex: "dataElementGroupSet",
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
                    title: "Outputs",
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, ...Object.values(search)],
    );

    return <Results {...resultsProps} />;
}
