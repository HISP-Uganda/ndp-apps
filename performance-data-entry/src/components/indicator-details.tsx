import React, { useMemo } from "react";
import { Table, TableProps } from "antd";
import { IDataElement } from "../types";
import { IndexRoute } from "../routes";
import { indicatorQueryOptions } from "../query-options";
import { useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner";
import { RootRoute } from "../routes/__root";

const makeIndicatorData = (
    data: Record<string, any>,
    categoryOptions: Map<string, string>,
) => {
    return [
        { code: "Name", dx: data.name },
        { code: "Description", dx: data["description"] ?? "" },
        {
            code: "Measurement",
            dx:
                categoryOptions.get(data["Lxe84DpBHhm"]) ??
                data["Lxe84DpBHhm"] ??
                "",
        },
        {
            code: "Unit of Measure",
            dx:
                categoryOptions.get(data["FuRWtF51PyL"]) ??
                data["FuRWtF51PyL"] ??
                "",
        },
        {
            code: "Data Source",
            dx:
                categoryOptions.get(data["Prss6OhQvYg"]) ??
                data["Prss6OhQvYg"] ??
                "",
        },
        {
            code: "Responsibility for reporting",
            dx:
                categoryOptions.get(data["lIRw10zARY7"]) ??
                data["lIRw10zARY7"] ??
                "",
        },
        { code: "Indicator code", dx: data["code"] ?? "" },
        { code: "Indicator type", dx: data["Indicator type"] ?? "" },
        { code: "Aggregation type", dx: data["aggregationType"] ?? "" },
        {
            code: "Frequency of data collection",
            dx: data["M5nS9I96cCx"],
        },
        {
            code: "Reporting Frequency",
            dx:
                data["dataSetPeriodType"] === "FinancialJuly"
                    ? "Financial Year"
                    : data["dataSetPeriodType"],
        },

        {
            code: "Descending Indicator",
            dx: data["descending indicator type"] ? "Yes" : "No",
        },
        {
            code: "Goal",
            dx:
                categoryOptions.get(data["m3Be0z4xNnA"]) ??
                data["m3Be0z4xNnA"] ??
                "",
        },
        {
            code: "Programme",
            dx:
                categoryOptions.get(data["UBWSASWdyfi"]) ??
                data["UBWSASWdyfi"] ??
                "",
        },
        {
            code: "Strategic Objective",
            dx:
                categoryOptions.get(data["fwSdMAZ9egv"]) ??
                data["fwSdMAZ9egv"] ??
                "",
        },
        {
            code: "Program Objective",
            dx:
                categoryOptions.get(data["GuoVDNEBAXA"]) ??
                data["GuoVDNEBAXA"] ??
                "",
        },
        {
            code: "Program Intervention",
            dx:
                categoryOptions.get(data["LKWITZXQD9l"]) ??
                data["LKWITZXQD9l"] ??
                "",
        },
        {
            code: "Intermediate Outcome",
            dx:
                categoryOptions.get(data["k9c6BOHIohu"]) ??
                data["k9c6BOHIohu"] ??
                "",
        },
        {
            code: "Key Result Area",
            dx:
                categoryOptions.get(data["JmZO4hoIlfT"]) ??
                data["JmZO4hoIlfT"] ??
                "",
        },
        {
            code: "Program Output",
            dx:
                categoryOptions.get(data["AKzxCNn1zkQ"]) ??
                data["AKzxCNn1zkQ"] ??
                "",
        },
    ];
};

export default function IndicatorDetails({
    indicator,
}: {
    indicator: IDataElement;
}) {
    const { all } = RootRoute.useLoaderData();
    const indicatorColumns: TableProps<any>["columns"] = useMemo(
        () => [
            {
                title: "Indicator Code",
                dataIndex: "code",
                key: "code",
                width: "50%",
            },
            {
                title: "Indicator Name",
                dataIndex: "dx",
                key: "dx",
                width: "50%",
            },
        ],
        [],
    );
    const { engine } = IndexRoute.useRouteContext();
    const { data, isError, error, isLoading, isSuccess } = useQuery(
        indicatorQueryOptions(engine, indicator.id),
    );

    if (isError) return <div>Error: {(error as Error).message}</div>;
    if (isLoading) return <Spinner />;
    if (isSuccess && data)
        return (
            <Table
                columns={indicatorColumns}
                dataSource={makeIndicatorData(data, all)}
                style={{
                    margin: 0,
                    padding: 0,
                }}
                pagination={false}
                rowKey="code"
                scroll={{ y: 700 }}
                showHeader={false}
                bordered
            />
        );
    return null;
}
