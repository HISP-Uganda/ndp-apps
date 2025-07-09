import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import React from "react";
import { analyticsQueryOptions } from "../../../../query-options";
import { VisionRoute } from "./route";
import { Table, TableColumnType } from "antd";
import { makeDataElementData } from "../../../../utils";

export const VisionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VisionRoute,
    component: Component,
});

function Component() {
    const { engine } = VisionIndexRoute.useRouteContext();
    const { ou, pe } = VisionRoute.useSearch();
    const dataElementGroupSets = VisionRoute.useLoaderData();
    const dataElementGroups = dataElementGroupSets.flatMap((d) =>
        d.dataElementGroups.map((g) => g.id),
    );
    const data = useSuspenseQuery(
        analyticsQueryOptions(engine, {
            deg: dataElementGroups.map((de) => `DE_GROUP-${de}`).join(";"),
            pe,
            ou,
        }),
    );

    const nameColumn: TableColumnType<{
        [key: string]: string | number | undefined;
    }> = {
        title: "Indicator",
        dataIndex: "dx",
        ellipsis: true,
    };

    return (
        <Table
            columns={[nameColumn]}
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
