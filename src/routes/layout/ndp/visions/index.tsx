import { createRoute, useLoaderData } from "@tanstack/react-router";
import { Table, TableColumnsType } from "antd";
import React from "react";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { makeDataElementData, textPxWidth } from "../../../../utils";
import { VisionRoute } from "./route";

const visionColumns: Record<number, string> = {
    0: "bqIaasqpTas",
    1: "HKtncMjp06U",
    2: "Px8Lqkxy2si",
};

export const VisionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VisionRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = VisionIndexRoute.useRouteContext();
    const { ou, pe, degs, deg, program, v, requiresProgram } =
        VisionRoute.useSearch();
    const dataElementGroupSets = VisionRoute.useLoaderData();
    const { configurations } = useLoaderData({ from: "__root__" });

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

    const periods = data.data.analytics.metaData.dimensions["pe"] ?? [];

    const [baseline = "", target = "", value = ""] =
        data.data.analytics.metaData.dimensions["Duw5yep8Vae"] ?? [];
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
        title:
            configurations[v]?.data?.baseline === pe
                ? `${data.data.analytics.metaData.items[pe]?.name} ${data.data.analytics.metaData.items[baseline].name}`
                : index === 1
                ? `${data.data.analytics.metaData.items[pe]?.name} Target`
                : "Vision Target 2040",
        dataIndex: `${pe}${visionColumns[index]}`,
        minWidth:
            textPxWidth(data.data.analytics.metaData.items[pe]?.name) + 40,
        align: "center",
    }));
    return (
        <Table
            columns={[...nameColumn, ...periodColumns]}
            dataSource={makeDataElementData({
                ...data.data,
                targetId: target,
                actualId: value,
                baselineId: baseline,
            })}
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
