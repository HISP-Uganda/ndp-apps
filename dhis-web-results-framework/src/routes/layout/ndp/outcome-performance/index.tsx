import { createRoute } from "@tanstack/react-router";
import React from "react";
import Performance from "../../../../components/performance";
import { useAnalyticsQuery } from "../../../../hooks/data-hooks";
import { RootRoute } from "../../../__root";
import { OutcomePerformanceRoute } from "./route";
export const OutcomePerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomePerformanceRoute,
    component: Component,
    // errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { ou, votes } = RootRoute.useLoaderData();
    const { engine } = OutcomePerformanceRoute.useRouteContext();
    const search = OutcomePerformanceIndexRoute.useSearch();

    const { data } = useAnalyticsQuery({
        engine,
        search: {
            ...search,
            pe: [search.pe ?? ""],
            ou: ou,
        },
        ndpVersion: search.v,
        attributeValue: "outcome",
        specificLevel: 3,
        ouIsFilter: false,
    });

    return (
        <Performance
            data={data}
            pe={search.pe ?? ""}
            groupingBy="orgUnit"
            initialColumns={[
                {
                    title: "Vote",
                    dataIndex: "code",
                    key: "code",
                    width: 80,
                    align: "center",
                    render: (_, record) => record.code?.replace("V", ""),
                    sorter: true,
                },
                {
                    title: "Institution",
                    dataIndex: "name",
                    key: "name",
                    filterSearch: true,
                    filters: votes.map((v) => ({
                        text: v.name,
                        value: v.name,
                    })),
                    onFilter: (value, record) =>
                        record.name.indexOf(value as string) === 0,
                    sorter: true,
                },
            ]}
        />
    );
}
