import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";
import { OutcomeLevelRoute } from "./route";

export const OutcomeLevelIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomeLevelRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});
function Component() {
    const { engine } = OutcomeLevelIndexRoute.useRouteContext();
    const search = OutcomeLevelIndexRoute.useSearch();
    const navigate = OutcomeLevelIndexRoute.useNavigate();
    const { dataElementGroupSets } = OutcomeLevelRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        search,
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        ...search,
        pe: derivePeriods(search.pe),
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
            ...search,
            prefixColumns: [
                {
                    title: "Programme Objectives",
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
                    title: "Outcomes",
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, ...Object.values(search)],
    );

    return <Results {...resultsProps} />;
}
