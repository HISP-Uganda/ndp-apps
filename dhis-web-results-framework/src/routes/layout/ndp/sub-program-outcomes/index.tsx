import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { SubProgramOutcomeRoute } from "./route";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";

export const SubProgramOutcomeIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutcomeRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = SubProgramOutcomeIndexRoute.useRouteContext();
    const search = SubProgramOutcomeIndexRoute.useSearch();
    const navigate = SubProgramOutcomeIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutcomeRoute.useLoaderData();
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
            ...search,
            data: {
                ...data.data,
                ...dataElementGroups,
            },
            dataElementGroupSets,
            onChange,
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
                    title: "Intermediate Outcomes",
                    dataIndex: "dataElementGroup",
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, ...Object.values(search)],
    );

    return <Results {...resultsProps} />;
}
