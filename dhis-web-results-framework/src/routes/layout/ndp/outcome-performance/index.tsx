import { createRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { Flex, Table, type TableProps } from "antd";
import React from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { DHIS2OrgUnit } from "../../../../types";
import { RootRoute } from "../../../__root";
import { OutcomePerformanceRoute } from "./route";
import Spinner from "../../../../components/Spinner";
import { createColumns } from "../../../../utils";
export const OutcomePerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OutcomePerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = OutcomePerformanceRoute.useRouteContext();
    const results = OutcomePerformanceRoute.useLoaderData();
    const { period, quarters } = OutcomePerformanceIndexRoute.useSearch();

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
        return <Spinner message="Loading Outcome Performance data..." />;
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
