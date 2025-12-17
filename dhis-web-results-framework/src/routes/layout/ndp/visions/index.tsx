import { createRoute } from "@tanstack/react-router";
import React from "react";
import { useAnalyticsQuery } from "../../../../hooks/data-hooks";
import { VisionRoute } from "./route";
import { Table, TableProps } from "antd";
import { AnalyticsData } from "../../../../types";
import { RootRoute } from "../../../__root";
export const VisionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VisionRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

const visionColumns: Record<number, string> = {
    0: "bqIaasqpTas",
    1: "HKtncMjp06U",
    2: "Px8Lqkxy2si",
};

function Component() {
    const { engine } = VisionIndexRoute.useRouteContext();
    const search = VisionRoute.useSearch();
    const { configurations } = RootRoute.useLoaderData();
    const { data, dimensions, items } = useAnalyticsQuery({
        engine,
        search,
        ndpVersion: search.v,
        isVision: true,
    });

    const [baseline = "", target = "", value = ""] =
        dimensions["Duw5yep8Vae"] ?? [];

    const periods = dimensions["pe"] ?? [];

    const nameColumn: TableProps<AnalyticsData>["columns"] = [
        {
            title: "Indicator",
            dataIndex: "name",
        },
    ];

    const periodColumns: TableProps<AnalyticsData>["columns"] = periods.map(
        (pe, index) => ({
            title:
                configurations[search.v]?.data?.baseline === pe
                    ? `${items[pe]?.name} ${items[baseline].name}`
                    : index === 1
                    ? `${items[pe]?.name} Target`
                    : "Vision Target 2040",
            dataIndex: `${pe}${visionColumns[index]}`,
            align: "center",
        }),
    );

    return (
        <Table
            columns={[...nameColumn, ...periodColumns]}
            dataSource={data}
            pagination={false}
            scroll={{ y: "calc(100vh - 148px)", x: "max-content" }}
            rowKey="id"
            bordered
            sticky
            tableLayout="auto"
            size="small"
        />
    );
}
