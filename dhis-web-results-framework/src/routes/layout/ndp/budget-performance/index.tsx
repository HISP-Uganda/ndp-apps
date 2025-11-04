import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Button, Flex, Table, TableProps } from "antd";
import { orderBy } from "lodash";
import React, { useState } from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { formatter, getCellStyle } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { BudgetPerformanceRoute } from "./route";
import downloadExcelFromColumns from "../../../../download-antd-table";
import { DownloadOutlined } from "@ant-design/icons";

export const BudgetPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => BudgetPerformanceRoute,
    component: Component,
});

function Component() {
    const { votes } = RootRoute.useLoaderData();
    const { engine } = BudgetPerformanceRoute.useRouteContext();
    const results = BudgetPerformanceRoute.useLoaderData();
    const { pe, quarters, category, categoryOptions } =
        BudgetPerformanceIndexRoute.useSearch();

    const { data } = useSuspenseQuery(
        dataElementsFromGroupQueryOptions({
            engine,
            dataElementGroupSets: results.dataElementGroupSets,
            pe,
            quarters,
            category,
            categoryOptions,
            votes,
        }),
    );

    const [finalData, setFinalData] = useState(
        votes.map((vote) => {
            const dataForVote = data?.get(vote.id);
            return {
                ...vote,
                ...dataForVote,
            };
        }),
    );

    const handleChange: TableProps<(typeof finalData)[number]>["onChange"] = (
        _pagination,
        _filters,
        sorter,
    ) => {
        if (!Array.isArray(sorter)) {
            const { field, order } = sorter;
            if (field && order) {
                setFinalData((prev) => {
                    return orderBy(
                        prev,
                        [String(field)],
                        [order === "ascend" ? "asc" : "desc"],
                    );
                });
            } else {
                setFinalData(() =>
                    votes.map((vote) => {
                        const dataForVote = data?.get(vote.id);
                        return {
                            ...vote,
                            ...dataForVote,
                        };
                    }),
                );
            }
        }
    };

    const columns: TableProps<(typeof finalData)[number]>["columns"] = [
        {
            title: "Vote",
            dataIndex: "vote",
            key: "vote",
            width: 80,
            align: "center",
            render: (_, record) => record.code?.replace("V", ""),
            sorter: true,
        },
        {
            title: "Institution",
            dataIndex: "name",
            key: "name",
            filterSearch: true,
            filters: votes.map((v) => ({ text: v.name, value: v.name })),
            onFilter: (value, record) =>
                record.name.indexOf(value as string) === 0,

            sorter: true,
        },
        {
            title: `Cumm. Allocation (Ugx Bn)`,
            dataIndex: "baseline",
            key: "baseline",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `Cumm. Release (Ugx Bn)`,
            dataIndex: "target",
            key: "target",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `Cumm. Expenditure (Ugx Bn)`,
            dataIndex: "actual",
            key: "actual",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `% Budget Released`,
            key: "moderatelyAchieved",
            width: 160,
            align: "center",
            render: (_, record) =>
                formatter.format(
                    record.baseline === 0 || record.target === 0
                        ? 0
                        : record.target / record.baseline,
                ),

            onCell: (record) => ({
                style: getCellStyle(
                    record.baseline === 0 || record.target === 0
                        ? 0
                        : record.target / record.baseline,
                ),
            }),
            sorter: true,
        },
        {
            title: `% Release Spent`,
            key: "performance",
            dataIndex: "performance",
            align: "center",
            width: 160,
            render: (_, record) => formatter.format(record.performance),
            onCell: (record) => ({
                style: getCellStyle(record.performance),
            }),
            sorter: true,
        },
    ];

    return (
        <Flex vertical gap="16px">
            <Flex justify="flex-end">
                <Button
                    onClick={() =>
                        downloadExcelFromColumns(
                            columns,
                            finalData,
                            "budget-performance-report.xlsx",
                        )
                    }
                    icon={<DownloadOutlined />}
                >
                    Download Excel
                </Button>
            </Flex>
            <Table
                columns={columns}
                dataSource={finalData}
                scroll={{ y: "calc(100vh - 300px)" }}
                rowKey="id"
                bordered={true}
                sticky={true}
                pagination={false}
                size="small"
                onChange={handleChange}
            />
        </Flex>
    );
}
