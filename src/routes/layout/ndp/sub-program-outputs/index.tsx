import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { SubProgramOutputRoute } from "./route";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";

export const SubProgramOutputIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutputRoute,
    component: Component,
});

function Component() {
    const { engine } = SubProgramOutputIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs, quarters } =
        SubProgramOutputIndexRoute.useSearch();
    const navigate = SubProgramOutputIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutputRoute.useLoaderData();
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
            quarters,
            prefixColumns: [
                {
                    title: "Sub-Interventions",
                    dataIndex: "dataElementGroupSet",
                },
                {
                    title: "Outputs",
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs],
    );

    return <Results {...resultsProps} />;
}
