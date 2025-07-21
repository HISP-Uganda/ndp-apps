import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ObjectiveRoute } from "./route";
import { ResultsProps } from "../../../../types";

export const ObjectIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => ObjectiveRoute,
    component: Component,
});

function Component() {
    const { engine } = ObjectIndexRoute.useRouteContext();
    const { ou, deg, degs, pe, tab, program } = ObjectIndexRoute.useSearch();
    const navigate = ObjectIndexRoute.useNavigate();
    const dataElementGroupSets = ObjectiveRoute.useLoaderData();

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
            data: { ...data.data, ...dataElementGroups },
            dataElementGroupSets,
            onChange,
            tab,
            deg,
            ou,
            pe,
            prefixColumns: [
                {
                    title: "NDPIII Objectives",
                    dataIndex: "dataElementGroupSet",
                },
                {
                    title: "Key Result Areas",
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs],
    );

    return <Results {...resultsProps} />;
}
