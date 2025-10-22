import { createRoute } from "@tanstack/react-router";
import React from "react";
import { OutputPerformanceRoute } from "./route";
import { useQuery } from "@tanstack/react-query";
import { Flex, Table, type TableProps } from "antd";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { DHIS2OrgUnit } from "../../../../types";
import { RootRoute } from "../../../__root";
import Spinner from "../../../../components/Spinner";
import { createColumns, PERFORMANCE_COLORS } from "../../../../utils";
export const OutputPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutputPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutputPerformanceRoute.useRouteContext();
    const results = OutputPerformanceRoute.useLoaderData();
    const { period, quarters } = OutputPerformanceIndexRoute.useSearch();

    const { data, isLoading, isError, error } = useQuery(
        dataElementsFromGroupQueryOptions({
            engine,
            dataElementGroupSets: results.dataElementGroupSets,
            period,
            quarters,
        }),
    );

    const columns = createColumns(votes, data);

    if (isLoading) {
        return <Spinner message="Loading Output Performance data..." />;
    }

    if (isError) {
        return <div>{`Error: ${error}`}</div>;
    }
    return (
        <Flex vertical>
            <Table
                columns={columns}
                dataSource={votes}
                scroll={{ y: "calc(100vh - 192px)" }}
                rowKey="id"
                bordered={true}
                sticky={true}
                tableLayout="auto"
                pagination={false}
                size="small"
            />
        </Flex>
    );
}
