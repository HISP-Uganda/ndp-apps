import { createRoute } from "@tanstack/react-router";
import { Flex, Table, TableProps } from "antd";
import React from "react";
import { useAnalyticsQuery } from "../../../../hooks/data-hooks";
import { AnalyticsData } from "../../../../types";
import { getCellStyle, processByPerformance } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { BudgetPerformanceRoute } from "./route";

export const BudgetPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => BudgetPerformanceRoute,
    component: Component,
});

function Component() {
    const { votes, ou, programs } = RootRoute.useLoaderData();
    const { engine } = BudgetPerformanceRoute.useRouteContext();
    const search = BudgetPerformanceIndexRoute.useSearch();
    const { data } = useAnalyticsQuery({
        engine,
        search: {
            ...search,
            pe: [search.pe ?? ""],
            ou,
        },
        ndpVersion: search.v,
        attributeValue: "action",
        specificLevel: 3,
        ouIsFilter: false,
    });

    // const [finalData, setFinalData] = useState(
    //     votes.map((vote) => {
    //         const dataForVote = data?.get(vote.id);
    //         return {
    //             ...vote,
    //             ...dataForVote,
    //         };
    //     }),
    // );

    // const handleChange: TableProps<(typeof finalData)[number]>["onChange"] = (
    //     _pagination,
    //     _filters,
    //     sorter,
    // ) => {
    //     if (!Array.isArray(sorter)) {
    //         const { field, order } = sorter;
    //         if (field && order) {
    //             setFinalData((prev) => {
    //                 return orderBy(
    //                     prev,
    //                     [String(field)],
    //                     [order === "ascend" ? "asc" : "desc"],
    //                 );
    //             });
    //         } else {
    //             setFinalData(() =>
    //                 votes.map((vote) => {
    //                     const dataForVote = data?.get(vote.id);
    //                     return {
    //                         ...vote,
    //                         ...dataForVote,
    //                     };
    //                 }),
    //             );
    //         }
    //     }
    // };

    const columns: TableProps<AnalyticsData>["columns"] = [
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
            dataIndex: `approved`,
            key: "approved",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `Cumm. Release (Ugx Bn)`,
            dataIndex: `target`,
            key: "target",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `Cumm. Expenditure (Ugx Bn)`,
            dataIndex: `actual`,
            key: "actual",
            width: 160,
            align: "center",
            sorter: true,
        },
        {
            title: `% Budget Released`,
            key: "allocation",
            dataIndex: "allocation",
            width: 160,
            align: "center",
            onCell: (record) => ({
                style: getCellStyle(record.approvedAllocation),
            }),
            sorter: true,
        },
        {
            title: `% Release Spent`,
            key: "spend",
            dataIndex: "spend",
            align: "center",
            width: 160,
            onCell: (record) => ({
                style: getCellStyle(record.actualSpend),
            }),
            sorter: true,
        },
    ];

    return (
        <Flex vertical gap="16px">
            {/* <Flex justify="flex-end">
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
            </Flex> */}
            <Table
                columns={columns}
                dataSource={processByPerformance({
                    dataElements: data,
                    groupingBy: "orgUnit",
                    programs,
                    pe: search.pe ?? "",
                    votes,
                })}
                scroll={{ y: "calc(100vh - 300px)" }}
                rowKey="orgUnit"
                bordered={true}
                sticky={true}
                pagination={false}
                size="small"
                // onChange={handleChange}
            />
        </Flex>
    );
}
