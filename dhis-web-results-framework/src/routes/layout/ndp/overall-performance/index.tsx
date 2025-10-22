import { createRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { Flex, Table, type TableProps } from "antd";
import React from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { DHIS2OrgUnit } from "../../../../types";
import { RootRoute } from "../../../__root";
import { OverallPerformanceRoute } from "./route";
export const OverallPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OverallPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

const calcTextWidth = (text: string, font = "14px Arial") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 100;
    ctx.font = font;
    return ctx.measureText(text).width + 24; // padding
};

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OverallPerformanceRoute.useRouteContext();
    const results = OverallPerformanceRoute.useLoaderData();
    const { period, quarters } = OverallPerformanceIndexRoute.useSearch();
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
            onCell: () => ({
                style: { whiteSpace: "nowrap", minWidth: "fit-content" },
            }),
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Output Performance
                </div>
            ),
            dataIndex: "outputPerformance",
            key: "outputPerformance",
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Outcome Performance
                </div>
            ),
            dataIndex: "outcomePerformance",
            key: "outcomePerformance",
        },
        {
            title: (
                <div style={{ width: "100%", whiteSpace: "nowrap" }}>
                    Overall Score (%)
                </div>
            ),
            dataIndex: "overallScore",
            key: "overallScore",
        },
    ];

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // if (isError) {
    //     return <div>{`Error: ${error}`}</div>;
    // }
    return (
        <Flex vertical>
            <Table
                columns={columns}
                dataSource={votes}
                // scroll={{ y: "calc(100vh - 192px)" }}
                rowKey="id"
                bordered={true}
                // sticky={true}
                tableLayout="auto"
                pagination={{pageSize:15}}
                size="small"
            />
        </Flex>
    );
}
