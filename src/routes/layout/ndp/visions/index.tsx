import { createRoute } from "@tanstack/react-router";
import { Table, TableColumnsType } from "antd";
import React from "react";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { makeDataElementData } from "../../../../utils";
import { VisionRoute } from "./route";

const visionColumns: Record<number, string> = {
    0: "bqIaasqpTas",
    1: "HKtncMjp06U",
    2: "Px8Lqkxy2si",
};

const visionLabels: Record<number, string> = {
    0: "Baseline 2010",
    1: "NDPIII Target 2025",
    2: "Vision Target 2040",
};

export const VisionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VisionRoute,
    component: Component,
});

function Component() {
    const { engine } = VisionIndexRoute.useRouteContext();
    const { ou, pe, degs, deg, program } = VisionRoute.useSearch();
    const dataElementGroupSets = VisionRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        { deg, pe, ou, program, degs },
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        deg,
        pe,
        ou,
        program,
        degs,
    });

    const periods = data.data.analytics.metaData.dimensions["pe"] ?? [];

    const nameColumn: TableColumnsType<{
        [key: string]: string | number | undefined;
    }> = [
        {
            title: "Indicator",
            dataIndex: "dx",
            ellipsis: true,
        },
    ];
    const periodColumns: TableColumnsType<{
        [key: string]: string | number | undefined;
    }> = periods.map((pe, index) => ({
        title: visionLabels[index],
        dataIndex: `${pe}${visionColumns[index]}`,
        align: "center",
    }));
    return (
        <Table
            columns={[...nameColumn, ...periodColumns]}
            dataSource={makeDataElementData(data.data)}
            pagination={false}
            scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
            rowKey="id"
            bordered
            sticky
            tableLayout="auto"
        />
    );
}
