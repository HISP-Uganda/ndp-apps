import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { SubProgramOutcomeRoute } from "./route";
import { ResultsProps } from "../../../../types";

export const SubProgramOutcomeIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutcomeRoute,
    component: Component,
});

function Component() {
    const { engine } = SubProgramOutcomeIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs } =
        SubProgramOutcomeIndexRoute.useSearch();
    const navigate = SubProgramOutcomeIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutcomeRoute.useLoaderData();
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
                    title: "Programme Objectives",
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
                    title: "Outcomes",
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
