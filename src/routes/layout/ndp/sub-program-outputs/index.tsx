import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { SubProgramOutputRoute } from "./route";
import { ResultsProps } from "../../../../types";

export const SubProgramOutputIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutputRoute,
    component: Component,
});

function Component() {
    const { engine } = SubProgramOutputIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs } =
        SubProgramOutputIndexRoute.useSearch();
    const navigate = SubProgramOutputIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutputRoute.useLoaderData();
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
            tab,
            deg,
            ou,
            pe,
            prefixColumns: [
                {
                    title: "Sub-Interventions",
                    dataIndex: degs,
                    render: (
                        _,
                        row: Record<string, string | number | undefined>,
                    ) =>
                        dataElementGroups.groupSets
                            .flatMap((group) => {
                                const value = row[group];
                                if (value === undefined) {
                                    return [];
                                }
                                return value;
                            })
                            .join(" "),
                },
                {
                    title: "Outputs",
                    dataIndex: deg,
                    render: (
                        _,
                        row: Record<string, string | number | undefined>,
                    ) =>
                        dataElementGroups.dataElementGroups
                            .flatMap((group) => {
                                const value = row[group];
                                if (value === undefined) {
                                    return [];
                                }
                                return value;
                            })
                            .join(" "),
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs],
    );

    return <Results {...resultsProps} />;
}
