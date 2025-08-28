import { createRoute } from "@tanstack/react-router";
import React, { useCallback, useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { ResultsProps } from "../../../../types";
import { GoalRoute } from "./route";
import TruncatedText from "../../../../components/TrancatedText";

export const GoalIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => GoalRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = GoalIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program, degs, requiresProgram } =
        GoalIndexRoute.useSearch();
    const navigate = GoalIndexRoute.useNavigate();
    const dataElementGroupSets = GoalRoute.useLoaderData();

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
            degs,
            prefixColumns: [
                {
                    title: "Goal",
                    key: "dataElementGroupSet",
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
                    title: (
                        <div
                            style={{
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }}
                        >
                            Key Result Areas
                        </div>
                    ),
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
