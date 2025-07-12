import {
    Flex,
    Table,
    TableColumnsType,
    TableProps,
    Tabs,
    TabsProps,
} from "antd";
import { groupBy, orderBy } from "lodash";
import React, { useMemo } from "react";
import { ResultsProps } from "../types";
import {
    filterMapFunctional,
    formatPercentage,
    headerColors,
    makeDataElementData,
    PERFORMANCE_COLORS,
} from "../utils";

const PERFORMANCE_LABELS: Record<number, string> = {
    0: "Target",
    1: "Actual",
    2: "%",
} as const;

const OVERVIEW_COLUMNS = ["a", "m", "n", "x"] as const;

const PerformanceLegend = React.memo(() => {
    const legendItems = [
        {
            bg: PERFORMANCE_COLORS.green.bg,
            color: "white",
            label: "Achieved (≤ 100%)",
        },
        {
            bg: PERFORMANCE_COLORS.yellow.bg,
            color: "black",
            label: "Moderately achieved (75-99%)",
        },
        {
            bg: PERFORMANCE_COLORS.red.bg,
            color: "black",
            label: "Not achieved (< 75%)",
        },
        { bg: PERFORMANCE_COLORS.gray.bg, color: "black", label: "No Data" },
    ];

    return (
        <Flex justify="between" align="center" gap="4px">
            {legendItems.map((item, index) => (
                <div
                    key={index}
                    style={{
                        width: "100%",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: item.bg,
                        color: item.color,
                    }}
                >
                    {item.label}
                </div>
            ))}
        </Flex>
    );
});

PerformanceLegend.displayName = "PerformanceLegend";

export function Results({
    tab,
    data,
    onChange,
    postfixColumns = [],
    prefixColumns = [],
}: ResultsProps) {
    const {
        periods,
        target,
        value,
        analyticsItems,
        finalData,
        dataElementGroups,
    } = useMemo(() => {
        const periods = data.analytics.metaData.dimensions["pe"] ?? [];
        const [, target = "", value = ""] =
            data.analytics.metaData.dimensions["Duw5yep8Vae"] ?? [];
        const analyticsItems = data.analytics.metaData.items;
        const finalData = orderBy(
            makeDataElementData({ ...data, targetId: target, actualId: value }),
            ["code"],
            ["asc"],
        );
        const dataElementGroups = data.dataElementGroups.map((deg) => {
            const dataElements = filterMapFunctional<
                string,
                Record<string, string>
            >(data.dataElements, (_, value) => value && deg in value);
            const totalIndicators = dataElements.length;

            const results: Record<string, any> = {
                ...dataElements[0],
                indicators: totalIndicators,
            };
            const availableIndicators = finalData.filter((row) => deg in row);

            data.analytics.metaData.dimensions["pe"].map((pe) => {
                const grouped = groupBy(
                    availableIndicators,
                    `${pe}performance-group`,
                );
                Object.entries(grouped).forEach(([key, value]) => {
                    const percentage = formatPercentage(
                        value.length / totalIndicators,
                    );
                    results[`${pe}${key}`] = percentage;
                });
            });
            return results;
        });
        return {
            periods,
            target,
            value,
            analyticsItems,
            finalData,
            dataElementGroups,
        };
    }, [data.analytics]);

    const nameColumn: TableColumnsType<
        Record<string, string | number | undefined>
    > = useMemo(
        () => [
            ...prefixColumns,
            {
                title: "Indicators",
                dataIndex: "dx",
            },
        ],
        [prefixColumns],
    );

    const columns = useMemo(() => {
        const columnsMap = new Map<
            string,
            TableColumnsType<Record<string, string | number | undefined>>
        >();

        columnsMap.set("target", [
            ...nameColumn,
            ...periods.map((pe) => ({
                title: analyticsItems[pe].name,
                dataIndex: "",
                align: "center" as const,
                children: [
                    {
                        title: "Target",
                        dataIndex: `${pe}${target}`,
                        width: "200px",
                        align: "center" as const,
                    },
                ],
            })),
            ...postfixColumns,
        ]);
        columnsMap.set("performance", [
            ...nameColumn,
            ...periods.map((pe) => ({
                title: analyticsItems[pe].name,
                children: [target, value, "performance"].map((v, index) => ({
                    title: PERFORMANCE_LABELS[index],
                    key: `${pe}${v}`,
                    minWidth: "96px",
                    align: "center",
                    onCell: (row: Record<string, any>) => {
                        if (index === 2) {
                            return { style: row[`${pe}style`] };
                        }
                        return {};
                    },
                    dataIndex: `${pe}${v}`,
                })),
            })),
            ...postfixColumns,
        ]);
        columnsMap.set("performance-overview", [
            ...prefixColumns,
            {
                title: "Indicators",
                dataIndex: "indicators",
                width: "115px",
                align: "center",
            },
            ...periods.map((pe) => ({
                title: analyticsItems[pe].name,
                children: OVERVIEW_COLUMNS.map((v) => ({
                    title: `${v.toLocaleUpperCase()}%`,
                    dataIndex: `${pe}${v}`,
                    width: "60px",
                    align: "center",
                    onHeaderCell: () => {
                        return {
                            style: headerColors[v],
                        };
                    },
                })),
            })),
        ]);

        columnsMap.set("completeness", [
            ...nameColumn,
            {
                title: "Indicators",
                dataIndex: "dx",
            },
        ]);

        return columnsMap;
    }, [nameColumn, periods, target, value, analyticsItems, postfixColumns]);

    const tableProps = useMemo<TableProps>(
        () => ({
            scroll: { y: "calc(100vh - 420px)" },
            rowKey: "id",
            bordered: true,
            sticky: true,
            tableLayout: "auto",
            dataSource: finalData,
            pagination: false,
            size: "small",
        }),
        [finalData],
    );

    const performanceOverviewTableProps = useMemo<TableProps>(
        () => ({
            scroll: { y: "calc(100vh - 420px)" },
            rowKey: "value",
            bordered: true,
            sticky: true,
            tableLayout: "auto",
            dataSource: dataElementGroups,
            pagination: false,
            size: "small",
        }),
        [dataElementGroups],
    );

    const items: TabsProps["items"] = useMemo(
        () => [
            {
                key: "target",
                label: "Targets",
                children: (
                    <Table {...tableProps} columns={columns.get("target")} />
                ),
            },
            {
                key: "performance",
                label: "Performance",
                children: (
                    <Flex vertical gap={10}>
                        <PerformanceLegend />
                        <Table
                            {...tableProps}
                            columns={columns.get("performance")}
                        />
                    </Flex>
                ),
            },
            {
                key: "performance-overview",
                label: "Performance overview",
                children: (
                    <Flex vertical gap={10}>
                        <PerformanceLegend />
                        <Table
                            {...performanceOverviewTableProps}
                            columns={columns.get("performance-overview")}
                        />
                    </Flex>
                ),
            },
            {
                key: "completeness",
                label: "Completeness",
                children: (
                    <Table
                        {...tableProps}
                        columns={columns.get("completeness")}
                    />
                ),
            },
        ],
        [columns, tableProps],
    );

    return (
        <Tabs activeKey={tab || "target"} items={items} onChange={onChange} />
    );
}
