import React, { useMemo } from "react";
import { Table, TableProps } from "antd";
import { IDataElement } from "../types";
import { IndexRoute } from "../routes";
import { indicatorQueryOptions } from "../query-options";
import { useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner";

const makeIndicatorData = (data: Record<string, any>) => {
    return [
        { code: "Name", display: data["name"] },
        { code: "Description", display: data["description"] },
        { code: "Computation method", display: data["Computation method"] },
        { code: "Unit of Measure", display: data["Unit"] },
        { code: "Indicator Source", display: data["Indicator Source"] },

        {
            code: "Alternative data source",
            display: data["Alternative data source"],
        },
        {
            code: "Preferred data source",
            display: data["Preferred data source"],
        },
        { code: "Vote", display: data["dataSetOrganisationUnitName"] },
        {
            code: "Accountability for indicator",
            display: data["Accountability for indicator"],
        },
        {
            code: "Responsibility for indicator",
            display: data["Responsibility for indicator"],
        },
        // { code: "Lead MDA", display: data["Lead MDA"] },
        { code: "Other MDAs", display: data["Other MDAs"] },
        { code: "Indicator code", display: data["code"] },
        { code: "Indicator type", display: data["Indicator type"] },
        { code: "Aggregation type", display: data["aggregationType"] },
        {
            code: "Frequency of data collection",
            display: data["Frequency of data collection"],
        },
        {
            code: "Reporting Frequency",
            display:
                data["dataSetPeriodType"] === "FinancialJuly"
                    ? "Financial Year"
                    : data["dataSetPeriodType"],
        },

        // { code: "Baseline Status 2010", display: data["Baseline Status 2010"] },
        {
            code: "Chart of Accounts Code",
            display: data["Chart of Accounts Code"],
        },
        // { code: "Computation type", display: data["Computation type"] },
        {
            code: "Descending Indicator",
            display: data["descending indicator type"] ? "Yes" : "No",
        },
        // { code: "Green range", display: data["Green range"] },
        // { code: "Current Project Cost", display: data["Current Project Cost"] },
        // { code: "Limitations", display: data["Limitations"] },

        // { code: "Rationale", display: data["Rationale"] },
        // { code: "Red range", display: data["Red range"] },
        // { code: "References", display: data["References"] },

        // { code: "Vision 2040", display: data["Vision 2040"] },
        // { code: "Yellow range", display: data["Yellow range"] },
    ];
};

export default function IndicatorDetails({
    indicator,
}: {
    indicator: IDataElement;
}) {
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
                dataIndex: "display",
                key: "display",
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
                dataSource={makeIndicatorData(data)}
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
