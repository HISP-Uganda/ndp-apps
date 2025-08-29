import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ObjectiveRoute } from "./route";
import { ResultsProps } from "../../../../types";
import TruncatedText from "../../../../components/TrancatedText";

export const ObjectIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => ObjectiveRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = ObjectIndexRoute.useRouteContext();
    const { ou, deg, degs, pe, tab, program, requiresProgram } =
        ObjectIndexRoute.useSearch();
    const navigate = ObjectIndexRoute.useNavigate();
    const dataElementGroupSets = ObjectiveRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        { deg, pe, ou, program, degs, requiresProgram },
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
                    title: "Objectives",
                    dataIndex: "dataElementGroupSet",
                    render: (_, record) => {
                        let current = "";
                        for (const group of dataElementGroupSets) {
                            if (Object(record).hasOwnProperty(group.id)) {
                                current = group.name;
                                break;
                            }
                        }
                        return current;
                    },
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
