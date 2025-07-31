import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { OutcomeLevelRoute } from "./route";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";

export const OutcomeLevelIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomeLevelRoute,
    component: Component,
});
function Component() {
    const { engine } = OutcomeLevelIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs, quarters } =
        OutcomeLevelIndexRoute.useSearch();
    const navigate = OutcomeLevelIndexRoute.useNavigate();
    const { dataElementGroupSets } = OutcomeLevelRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        { deg, pe, ou, program, degs },
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        deg,
        pe: derivePeriods(pe),
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
            data: { ...data.data, ...dataElementGroups },
            dataElementGroupSets,
            onChange,
            tab,
            deg,
            ou,
            pe,
            quarters,
            prefixColumns: [
                {
                    title: "Programme Objectives",
                    dataIndex: "dataElementGroupSet",
                },
                {
                    title: "Outcomes",
                    dataIndex: "dataElementGroup",
                },
            ],
            // prefixColumns: [
            //     {
            //         title: "Programme Objectives",
            //         dataIndex: degs,
            //         render: (
            //             _,
            //             row: Record<string, string | number | undefined>,
            //         ) =>
            //             dataElementGroups.groupSets
            //                 .flatMap((group) => {
            //                     const value = row[group];
            //                     if (value === undefined) {
            //                         return [];
            //                     }
            //                     return value;
            //                 })
            //                 .join(" "),
            //     },
            //     {
            //         title: "Outcomes",
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
