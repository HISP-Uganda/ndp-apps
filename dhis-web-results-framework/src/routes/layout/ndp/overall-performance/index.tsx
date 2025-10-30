import { createRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Flex, Table, type TableProps } from "antd";
import { orderBy } from "lodash";
import React, { useState } from "react";
import { dataElementsFromGroupQueryOptions } from "../../../../query-options";
import { formatter, getCellStyle, legendItems } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { OverallPerformanceRoute } from "./route";
import PerformanceLegend from "../../../../components/performance-legend";

export const OverallPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => OverallPerformanceRoute,
    component: Component,
    // errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { votes, categories } = RootRoute.useLoaderData();
    const { engine } = OverallPerformanceRoute.useRouteContext();
    const { pe, quarters } = OverallPerformanceIndexRoute.useSearch();
    const { outcome, output, action } = OverallPerformanceRoute.useLoaderData();
    const targetCategoryOptions = categories.get("Duw5yep8Vae");
    const budgetCategoryOptions = categories.get("kfnptfEdnYl");
    const [{ data: outcomeData }, { data: outputData }, { data: actionData }] =
        useSuspenseQueries({
            queries: [
                dataElementsFromGroupQueryOptions({
                    engine,
                    dataElementGroupSets: outcome.dataElementGroupSets,
                    pe,
                    quarters,
                    category: "Duw5yep8Vae",
                    categoryOptions: targetCategoryOptions,
                    votes,
                }),
                dataElementsFromGroupQueryOptions({
                    engine,
                    dataElementGroupSets: output.dataElementGroupSets,
                    pe,
                    quarters,
                    category: "Duw5yep8Vae",
                    categoryOptions: targetCategoryOptions,
                    votes,
                }),
                dataElementsFromGroupQueryOptions({
                    engine,
                    dataElementGroupSets: action.dataElementGroupSets,
                    pe,
                    quarters,
                    category: "kfnptfEdnYl",
                    categoryOptions: budgetCategoryOptions,
                    votes,
                }),
            ],
        });

    const [finalData, setFinalData] = useState(
        votes.map((vote) => {
            const outputPerformance = outputData.get(vote.id).totalWeighted;
            const outcomePerformance = outcomeData.get(vote.id).totalWeighted;
            const absorptionRate = actionData.get(vote.id).performance;
            const overallScore =
                0.4 * outcomePerformance +
                0.4 * outputPerformance +
                0.2 * absorptionRate;
            return {
                ...vote,
                outputPerformance,
                outcomePerformance,
                absorptionRate,
                overallScore,
            };
        }),
    );

    React.useEffect(() => {
        setFinalData(() =>
            votes.map((vote) => {
                const outputPerformance = outputData.get(vote.id).totalWeighted;
                const outcomePerformance = outcomeData.get(
                    vote.id,
                ).totalWeighted;
                const absorptionRate = actionData.get(vote.id).performance;
                const overallScore =
                    0.4 * outcomePerformance +
                    0.4 * outputPerformance +
                    0.2 * absorptionRate;
                return {
                    ...vote,
                    outputPerformance,
                    outcomePerformance,
                    absorptionRate,
                    overallScore,
                };
            }),
        );
    }, [outputData, outcomeData, actionData, votes]);

    const columns: TableProps<(typeof finalData)[number]>["columns"] = [
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            align: "center",
            sorter: true,
            width: 70,
            render: (_, record) => record.code?.replace("V", ""),
        },
        {
            title: "Institution",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },

        {
            title: " Absorption Rate (%)",
            dataIndex: "absorptionRate",
            key: "absorptionRate",
            width: 180,
            align: "center",
            sorter: true,
            render: (_, record) => formatter.format(record.absorptionRate),
            onCell: (record) => ({
                style: getCellStyle(record.absorptionRate ?? 0),
            }),
        },
        {
            title: "Output Performance",
            dataIndex: "outputPerformance",
            width: 180,
            key: "outputPerformance",
            align: "center",
            sorter: true,
            render: (_, record) => formatter.format(record.outputPerformance),
            onCell: (record) => ({
                style: getCellStyle(record.outputPerformance ?? 0),
            }),
        },
        {
            title: "Outcome Performance",
            dataIndex: "outcomePerformance",
            key: "outcomePerformance",
            width: 180,
            align: "center",
            sorter: true,
            render: (_, record) => formatter.format(record.outcomePerformance),
            onCell: (record) => ({
                style: getCellStyle(record.outcomePerformance ?? 0),
            }),
        },
        {
            title: " Overall Score (%)",
            dataIndex: "overallScore",
            key: "overallScore",
            align: "center",
            width: 180,
            sorter: true,
            render: (_, record) => formatter.format(record.overallScore),
            onCell: (record) => ({
                style: getCellStyle(record.overallScore ?? 0),
            }),
        },
    ];

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
                        const outputPerformance = outputData?.get(
                            vote.id,
                        ).totalWeighted;
                        const outcomePerformance = outcomeData?.get(
                            vote.id,
                        ).totalWeighted;
                        const absorptionRate = actionData?.get(
                            vote.id,
                        ).performance;
                        const overallScore =
                            0.4 * outcomePerformance +
                            0.4 * outputPerformance +
                            0.2 * absorptionRate;
                        return {
                            ...vote,
                            outputPerformance,
                            outcomePerformance,
                            absorptionRate,
                            overallScore,
                        };
                    }),
                );
            }
        }
    };
    return (
        <Flex vertical gap={10}>
            <PerformanceLegend legendItems={legendItems} />
            <Table
                columns={columns}
                dataSource={finalData}
                scroll={{ y: "calc(100vh - 242px)" }}
                rowKey="id"
                bordered={true}
                tableLayout="auto"
                pagination={false}
                size="small"
                onChange={handleChange}
            />
        </Flex>
    );
}
