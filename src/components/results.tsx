import {
    Flex,
    Table,
    TableColumnsType,
    TableColumnType,
    Tabs,
    TabsProps,
} from "antd";
import { orderBy } from "lodash";
import React from "react";
import { Analytics, DataElementGroupSet, GoalSearch } from "../types";
import { makeDataElementData } from "../utils";

const performanceLabels: Record<number, string> = {
    0: "Target",
    1: "Actual",
    2: "%",
};

const red = { bg: "#CD615A", fg: "black", end: 75 };
const yellow = { bg: "#F4CD4D", fg: "black", start: 75, end: 99 };
const gray = { bg: "#AAAAAA", fg: "black", start: 75, end: 99 };
const green = { bg: "#339D73", fg: "white", start: 100 };

const findBackground = (
    row: Record<string, string>,
    current: string[],
    pe: string,
) => {
    const actual = Number(row[`${pe}${current[1]}`]);
    const target = Number(row[`${pe}${current[0]}`]);

    if (!isNaN(actual) && !isNaN(target) && target !== 0) {
        const ratio = (actual * 100) / target;

        if (row["wRRYuIS8JKN"] === "true") {
            if (ratio <= green.start) {
                return {
                    style: { backgroundColor: green.bg, color: green.fg },
                };
            }
            if (ratio >= yellow.end && ratio < yellow.start) {
                return {
                    style: { backgroundColor: yellow.bg, color: yellow.fg },
                };
            }
            if (ratio > red.end) {
                return { style: { backgroundColor: red.bg, color: red.fg } };
            }
        } else {
            if (ratio < red.end) {
                return { style: { backgroundColor: red.bg, color: red.fg } };
            }
            if (ratio >= yellow.start && ratio < yellow.end) {
                return {
                    style: { backgroundColor: yellow.bg, color: yellow.fg },
                };
            }
            if (ratio >= green.start) {
                return {
                    style: { backgroundColor: green.bg, color: green.fg },
                };
            }
        }
    }

    return {
        style: { backgroundColor: gray.bg, color: gray.fg },
    };
};
export function Results({
    tab,
    data,
    onChange,
}: {
    dataElementGroupSets: DataElementGroupSet[];
    data: Analytics;
    onChange?: (key: string) => void;
} & GoalSearch) {
    const nameColumn: TableColumnType<{
        [key: string]: string | number | undefined;
    }> = {
        title: "Indicator",
        dataIndex: "dx",
        ellipsis: true,
    };
    const periods = data.metaData.dimensions["pe"] ?? [];
    const [, target = "", value = ""] =
        data.metaData.dimensions["Duw5yep8Vae"] ?? [];

    const finalData = orderBy(makeDataElementData(data), ["code"], ["asc"]);
    const columns: Map<
        string,
        TableColumnsType<Record<string, string | number | undefined>>
    > = new Map([
        [
            "target",
            [
                nameColumn,
                ...periods.map((pe) => ({
                    title: data.metaData.items[pe].name,
                    dataIndex: "",
                    align: "center",
                    children: [
                        {
                            title: "Target",
                            dataIndex: `${pe}${target}`,
                            width: "200px",
                            align: "center",
                        },
                    ],
                })),
            ],
        ],
        [
            "performance",
            [
                nameColumn,
                ...periods.map((pe) => ({
                    title: data.metaData.items[pe].name,
                    children: [target, value, "performance"].map(
                        (v, index, current) => ({
                            title: performanceLabels[index],
                            key: `${pe}${v}`,
                            minWidth: "96px",
                            align: "center",
                            onCell: (row: Record<string, string>) => {
                                if (index === 2) {
                                    return findBackground(row, current, pe);
                                }
                                return {};
                            },
                            render: (
                                _: unknown,
                                row: Record<string, string>,
                            ) => {
                                if (index === 2) {
                                    const actual = Number(
                                        row[`${pe}${current[1]}`],
                                    );
                                    const target = Number(
                                        row[`${pe}${current[0]}`],
                                    );
                                    if (
                                        !isNaN(actual) &&
                                        !isNaN(target) &&
                                        target !== 0
                                    ) {
                                        return Intl.NumberFormat("en-US", {
                                            style: "percent",
                                        }).format(actual / target);
                                    }
                                    return "-";
                                }
                                return row[`${pe}${v}`];
                            },
                        }),
                    ),
                })),
            ],
        ],
        [
            "performance-overview",
            [
                nameColumn,
                {
                    title: "Indicators",
                    dataIndex: "indicators",
                },
                ...periods.map((pe) => ({
                    title: pe,
                    dataIndex: "",
                    children: ["a", "m", "n", "x"].map((v) => ({
                        title: `${v.toLocaleUpperCase()}%`,
                        dataIndex: `${pe}${v}`,
                        width: "60px",
                    })),
                })),
            ],
        ],
        [
            "completeness",
            [
                nameColumn,
                {
                    title: "Indicators",
                    dataIndex: "indicators",
                },
            ],
        ],
    ]);

    const items: TabsProps["items"] = [
        {
            key: "target",
            label: "Targets",
            children: (
                <Table
                    columns={columns.get("target")}
                    dataSource={finalData}
                    pagination={false}
                    scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
                    rowKey="id"
                    bordered
                    sticky
                    tableLayout="auto"
                />
            ),
        },
        {
            key: "performance",
            label: "Performance",
            children: (
                <Flex vertical gap={10}>
                    <Flex justify="between" align="center" gap="4px">
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: green.bg,
                                color: "white",
                            }}
                        >
                            Achieved (&le; 100%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: yellow.bg,
                            }}
                        >
                            Moderately achieved (75-99%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: red.bg,
                            }}
                        >
                            Not achieved (&lt; 75%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: gray.bg,
                            }}
                        >
                            No Data
                        </div>
                    </Flex>
                    <Table
                        columns={columns.get("performance")}
                        dataSource={finalData}
                        pagination={false}
                        scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
                        rowKey="id"
                        bordered
                        sticky
                        tableLayout="auto"
                    />
                </Flex>
            ),
        },
        {
            key: "performance-overview",
            label: "Performance overview",
            children: (
                <Flex vertical gap={10}>
                    <Flex justify="between" align="center" gap="4px">
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: green.bg,
                                color: "white",
                            }}
                        >
                            Achieved (&le; 100%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: yellow.bg,
                            }}
                        >
                            Moderately achieved (75-99%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: red.bg,
                            }}
                        >
                            Not achieved (&lt; 75%)
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: gray.bg,
                            }}
                        >
                            No Data
                        </div>
                    </Flex>
                    <Table
                        columns={columns.get("performance-overview")}
                        dataSource={finalData}
                        pagination={false}
                        scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
                        rowKey="id"
                        bordered
                        sticky
                        tableLayout="auto"
                    />
                </Flex>
            ),
        },
        {
            key: "completeness",
            label: "Completeness",
            children: (
                <Table
                    columns={columns.get("completeness")}
                    dataSource={finalData}
                    pagination={false}
                    scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
                    rowKey="id"
                    bordered
                    sticky
                    tableLayout="auto"
                />
            ),
        },
    ];
    return (
        <Tabs activeKey={tab || "target"} items={items} onChange={onChange} />
    );
}
