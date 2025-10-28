import { createRoute } from "@tanstack/react-router";

import { useSuspenseQueries } from "@tanstack/react-query";
import { Flex, Table, type TableProps } from "antd";
import React from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { DHIS2OrgUnit } from "../../../../types";
import { formatter } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { OverallPerformanceRoute } from "./route";
export const OverallPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OverallPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OverallPerformanceRoute.useRouteContext();
    const { pe, quarters, category, categoryOptions } =
        OverallPerformanceIndexRoute.useSearch();

    const { outcome, output } = OverallPerformanceRoute.useLoaderData();

    const [{ data: outcomeData }, { data: outputData }] = useSuspenseQueries({
        queries: [
            dataElementsFromGroupQueryOptions({
                engine,
                dataElementGroupSets: outcome.dataElementGroupSets,
                pe,
                quarters,
                category,
                categoryOptions,
            }),
            dataElementsFromGroupQueryOptions({
                engine,
                dataElementGroupSets: output.dataElementGroupSets,
                pe,
                quarters,
                category,
                categoryOptions,
            }),
        ],
    });

    const columns: TableProps<
        Omit<DHIS2OrgUnit, "leaf" | "dataSets" | "parent">
    >["columns"] = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            align: "center",
            render: (_, record) => record.code?.replace("V", ""),
        },
        {
            title: "Institution",
            dataIndex: "name",
            key: "name",
        },

        {
            title: (
                <span style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Absorption Rate (%)
                </span>
            ),
            dataIndex: "absorptionRate",
            key: "absorptionRate",
            width: 180,
            onCell: () => ({
                style: { whiteSpace: "nowrap", minWidth: "fit-content" },
            }),
            align: "center",
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Output Performance
                </div>
            ),
            dataIndex: "outputPerformance",
            width: 180,
            render: (_, record) =>
                formatter.format(outputData?.get(record.id).totalWeighted),
            key: "outputPerformance",
            align: "center",
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Outcome Performance
                </div>
            ),
            dataIndex: "outcomePerformance",
            key: "outcomePerformance",
            width: 180,
            align: "center",
            render: (_, record) =>
                formatter.format(outcomeData?.get(record.id).totalWeighted),
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Overall Score (%)
                </div>
            ),
            dataIndex: "overallScore",
            key: "overallScore",
            align: "center",
            width: 180,
        },
    ];
    return (
        <Flex vertical>
            <Table
                columns={columns}
                dataSource={votes}
                scroll={{ y: "calc(100vh - 192px)" }}
                rowKey="id"
                bordered={true}
                // sticky={true}
                tableLayout="auto"
                pagination={false}
                size="small"
            />
        </Flex>
    );
}
