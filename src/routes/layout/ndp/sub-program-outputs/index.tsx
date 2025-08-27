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
import TruncatedText from "../../../../components/TrancatedText";

export const SubProgramOutputIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutputRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
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
                    render: (_, record) => {
                        let current = "";
                        for (const group of dataElementGroupSets) {
                            if (Object(record).hasOwnProperty(group.id)) {
                                current = group.name;
                                break;
                            }
                        }
                        return <TruncatedText text={current} />;
                    },
                },
                {
                    title: "Outputs",
                    dataIndex: "dataElementGroup",
                    render: (text) => {
                        return <TruncatedText text={text} />;
                    },
                },
            ],
        }),
        [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs],
    );

    return <Results {...resultsProps} />;
}
