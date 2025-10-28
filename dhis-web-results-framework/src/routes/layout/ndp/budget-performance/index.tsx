import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Table, TableProps } from "antd";
import React from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { BudgetPerformanceRoute } from "./route";
import { formatter, PERFORMANCE_COLORS } from "../../../../utils";
export const BudgetPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => BudgetPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = BudgetPerformanceRoute.useRouteContext();
    const results = BudgetPerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        BudgetPerformanceIndexRoute.useSearch();

    const { data } = useSuspenseQuery(
        dataElementsFromGroupQueryOptions({
            engine,
            dataElementGroupSets: results.dataElementGroupSets,
            pe,
            quarters,
            category,
            categoryOptions,
        }),
    );

    const finalData = votes.map((vote) => {
        const dataForVote = data?.get(vote.id);
        return {
            ...vote,
            ...dataForVote,
        };
    });

    const columns: TableProps<(typeof finalData)[number]>["columns"] = [
        {
            title: "Vote",
            dataIndex: "vote",
            key: "vote",
            width: 60,
            align: "center",
            render: (_, record) => record.code?.replace("V", ""),
        },
        {
            title: "Institution",
            dataIndex: "name",
            key: "name",
            filterSearch: true,
            filters: votes.map((v) => ({ text: v.name, value: v.name })),
            onFilter: (value, record) =>
                record.name.indexOf(value as string) === 0,
        },
        {
            title: `Cumm. Allocation (Ugx Bn)`,
            dataIndex: "baseline",
            key: "baseline",
            width: 160,
            align: "center",
        },
        {
            title: `Cumm. Release  (Ugx Bn)`,
            dataIndex: "target",
            key: "target",
            width: 160,
            align: "center",
        },
        {
            title: `Cumm. Expenditure  (Ugx Bn)`,
            dataIndex: "actual",
            key: "actual",
            width: 160,
            align: "center",
        },
        {
            title: `% Budget Released`,
            key: "moderatelyAchieved",
            width: 160,
            align: "center",
            render: (_, record) =>
                formatter.format(
                    record.baseline === 0 || record.target === 0
                        ? 0
                        : record.target / record.baseline,
                ),
        },
        {
            title: `% Release Spent`,
            key: "notAchieved",
            align: "center",
            width: 160,
            render: (_, record) => formatter.format(record.performance),

            onCell: () => {
                return {
                    style: {
                        backgroundColor: PERFORMANCE_COLORS.green.bg,
                        color: PERFORMANCE_COLORS.green.fg,
                    },
                };
            },
        },
        // {
        //     title: `% Release Spent`,
        //     dataIndex: "performance",
        //     key: "performance",
        //     width: 160,
        //     align: "center",
        //     render: (_, record) => formatter.format(record.performance),
        // },
    ];

    return (
        <Table
            columns={columns}
            dataSource={finalData}
            scroll={{ y: "calc(100vh - 300px)" }}
            rowKey="id"
            bordered={true}
            sticky={true}
            pagination={false}
            size="small"
        />
    );
}
