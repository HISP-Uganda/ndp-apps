import { DownloadOutlined } from "@ant-design/icons";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { Button, Flex, Table, TableProps, Tabs, TabsProps } from "antd";
import ExcelJS from "exceljs";
import { orderBy, uniqBy } from "lodash";
import React, { useCallback, useMemo } from "react";
import { ResultsProps } from "../types";
import { makeDataElementData, PERFORMANCE_COLORS } from "../utils";

const PERFORMANCE_LABELS: Record<number, string> = {
    0: "Target",
    1: "Actual",
    2: "%",
} as const;

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
    quarters = false,
    pe = [],
}: ResultsProps) {
    const { v } = useSearch({ from: "/layout/ndp" });
    const { configurations } = useLoaderData({ from: "__root__" });
    const { target, value, analyticsItems, finalData, baseline } =
        useMemo(() => {
            const [baseline, target = "", value = ""] =
                data.analytics.metaData.dimensions["Duw5yep8Vae"] ?? [];
            const analyticsItems = data.analytics.metaData.items;
            let finalData = orderBy(
                makeDataElementData({
                    ...data,
                    targetId: target,
                    actualId: value,
                    baselineId: baseline,
                }),
                ["code"],
                ["asc"],
            );
            finalData = finalData.map((row) => {
                const dataElementGroup = data.dataElementGroups
                    .flatMap((group) => {
                        const value = row[group];
                        if (value === undefined) {
                            return [];
                        }
                        return value;
                    })
                    .join(" ");

                const dataElementGroupSet = data.groupSets
                    .flatMap((group) => {
                        const value = row[group];
                        if (value === undefined) {
                            return [];
                        }
                        return value;
                    })
                    .join(" ");

                return { ...row, dataElementGroup, dataElementGroupSet };
            });

            return {
                target,
                value,
                analyticsItems,
                finalData,
                baseline,
            };
        }, [data.analytics]);

    const nameColumn: TableProps<Record<string, any>>["columns"] = useMemo(
        () => [
            ...prefixColumns,
            {
                title: "Indicators",
                dataIndex: "dx",
                fixed: "left",
            },
        ],
        [prefixColumns],
    );

    const columns = useMemo(() => {
        const columnsMap = new Map<
            string,
            TableProps<Record<string, any>>["columns"]
        >();

        columnsMap.set("target", [
            ...nameColumn,
            ...pe.map((pe) => {
                const title =
                    configurations[v]?.data?.baseline === pe
                        ? analyticsItems[baseline].name
                        : analyticsItems[target].name;
                const dataIndex =
                    configurations[v]?.data?.baseline === pe
                        ? `${pe}${baseline}`
                        : `${pe}${target}`;
                return {
                    title: (
                        <div style={{ whiteSpace: "nowrap" }}>
                            {analyticsItems[pe].name}
                        </div>
                    ),
                    align: "center" as const,
                    children: [
                        {
                            title: (
                                <div style={{ whiteSpace: "nowrap" }}>
                                    {title}
                                </div>
                            ),
                            dataIndex,
                            align: "center" as const,
                            minWidth:
                                configurations[v]?.data?.baseline === pe
                                    ? 100
                                    : 76,
                        },
                    ],
                };
            }),
            ...postfixColumns,
        ]);
        columnsMap.set("performance", [
            ...nameColumn,
            ...pe.map((pe) => ({
                title: (
                    <div style={{ whiteSpace: "nowrap" }}>
                        {analyticsItems[pe].name}
                    </div>
                ),
                align: "center" as const,
                children: (configurations[v]?.data?.baseline === pe
                    ? [baseline]
                    : [target, value, "performance"]
                ).flatMap((currentValue, index) => {
                    const year = Number(pe.slice(0, 4));
                    if (index === 1 && quarters) {
                        return [3, 4, 1, 2].map((quarter, index) => {
                            const currentYear =
                                quarter === 1 || quarter === 2
                                    ? year + 1
                                    : year;
                            return {
                                title: `Q${index + 1}`,
                                key: `${pe}${currentYear}Q${quarter}`,
                                align: "center",
                                children: [
                                    {
                                        title: `A`,
                                        key: `${currentYear}Q${quarter}actual`,
                                        dataIndex: `${currentYear}Q${quarter}actual`,
                                        align: "center",
                                    },
                                    {
                                        title: `%`,
                                        dataIndex: `${currentYear}Q${quarter}performance`,
                                        key: `${currentYear}Q${quarter}performance`,
                                        align: "center",
                                        onCell: (row: Record<string, any>) => {
                                            return {
                                                style: row[
                                                    `${currentYear}Q${quarter}style`
                                                ],
                                            };
                                        },
                                    },
                                ],
                            };
                        });
                    } else {
                        const title =
                            configurations[v]?.data?.baseline === pe
                                ? analyticsItems[baseline].name
                                : PERFORMANCE_LABELS[index];
                        return {
                            title: (
                                <div
                                    style={{
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {title}
                                </div>
                            ) as any,
                            key: `${pe}${currentValue}`,
                            minWidth:
                                configurations[v]?.data?.baseline === pe
                                    ? 100
                                    : 56,
                            align: "center",
                            onCell: (row: Record<string, any>) => {
                                if (index === 2) {
                                    return {
                                        style: row[`${pe}style`],
                                    };
                                }
                                return {};
                            },
                            dataIndex: `${pe}${currentValue}`,
                            children: [],
                        };
                    }
                }),
            })),
            ...postfixColumns,
        ]);
        return columnsMap;
    }, [
        nameColumn,
        target,
        value,
        analyticsItems,
        postfixColumns,
        prefixColumns,
        configurations,
        v,
        baseline,
        quarters,
        pe,
    ]);

    const exportToExcel = useCallback(
        async (activeTab: string) => {
            const currentData = finalData;
            const currentColumns = columns.get(activeTab) || [];

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(activeTab);

            const processColumns = (cols: any[]) => {
                const parentHeaders: string[] = [];
                const childHeaders: string[] = [];
                const flatColumns: any[] = [];
                const mergeRanges: Array<{
                    start: number;
                    end: number;
                    title: string;
                }> = [];

                let currentCol = 1;

                cols.forEach((col) => {
                    if (col.children && col.children.length > 0) {
                        const startCol = currentCol;
                        const endCol = currentCol + col.children.length - 1;

                        mergeRanges.push({
                            start: startCol,
                            end: endCol,
                            title: col.title || "",
                        });

                        col.children.forEach((child: any) => {
                            parentHeaders.push(col.title || "");
                            childHeaders.push(child.title || "");
                            flatColumns.push({
                                ...child,
                                parentTitle: col.title,
                            });
                            currentCol++;
                        });
                    } else {
                        parentHeaders.push(col.title || "");
                        childHeaders.push("");
                        flatColumns.push(col);
                        currentCol++;
                    }
                });

                return {
                    parentHeaders,
                    childHeaders,
                    flatColumns,
                    mergeRanges,
                };
            };

            const { parentHeaders, childHeaders, flatColumns, mergeRanges } =
                processColumns(currentColumns);

            const hasNestedHeaders = mergeRanges.length > 0;
            const dataRowOffset = hasNestedHeaders ? 3 : 2;

            if (hasNestedHeaders) {
                worksheet.addRow(parentHeaders);
                worksheet.addRow(childHeaders);
                worksheet.getRow(1).height = 30;
                worksheet.getRow(2).height = 30;

                mergeRanges.forEach(({ start, end, title }) => {
                    if (start < end) {
                        worksheet.mergeCells(1, start, 1, end);
                        const mergedCell = worksheet.getCell(1, start);
                        mergedCell.value = title;
                        mergedCell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                        };
                        mergedCell.font = { bold: true };
                        mergedCell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFD0D0D0" },
                        };
                        mergedCell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    }
                });

                parentHeaders.forEach((header, index) => {
                    const cell = worksheet.getCell(1, index + 1);
                    if (!cell.isMerged) {
                        cell.value = header;
                        cell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                        };
                        cell.font = { bold: true };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFD0D0D0" },
                        };
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    }
                });

                childHeaders.forEach((header, index) => {
                    const cell = worksheet.getCell(2, index + 1);
                    if (header) {
                        cell.value = header;
                        cell.alignment = {
                            horizontal: "center",
                            vertical: "middle",
                        };
                        cell.font = { bold: true };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFE0E0E0" },
                        };
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    }
                });
            } else {
                worksheet.addRow(parentHeaders);
                worksheet.getRow(1).height = 30;
                worksheet.getRow(1).font = { bold: true };
                worksheet.getRow(1).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFE0E0E0" },
                };
            }

            const textColumnIndices = new Set<number>();
            flatColumns.forEach((col, index) => {
                const title = col.title || col.dataIndex || "";
                const dataIndex = col.dataIndex || col.key;
                if (
                    title.toLowerCase().includes("indicator") ||
                    title.toLowerCase().includes("name") ||
                    title.toLowerCase().includes("description") ||
                    title.toLowerCase().includes("code") ||
                    dataIndex === "dx" ||
                    dataIndex === "id" ||
                    dataIndex === "display" ||
                    (currentData.length > 0 &&
                        typeof currentData[0][dataIndex] === "string" &&
                        isNaN(Number(currentData[0][dataIndex])))
                ) {
                    textColumnIndices.add(index);
                }
            });

            currentData.forEach((row: any, rowIndex: number) => {
                const rowData = flatColumns.map((col) => {
                    const value = row[col.dataIndex || col.key];
                    return value !== undefined && value !== null ? value : "";
                });
                const addedRow = worksheet.addRow(rowData);

                flatColumns.forEach((col, colIndex) => {
                    const value = row[col.dataIndex || col.key];
                    const stringValue = String(value || "");

                    if (
                        textColumnIndices.has(colIndex) &&
                        stringValue.length > 60
                    ) {
                        const cell = worksheet.getCell(
                            rowIndex + dataRowOffset,
                            colIndex + 1,
                        );

                        cell.value = stringValue.substring(0, 60) + "...";

                        cell.note = stringValue;
                    }
                });
            });

            const borderStyle = {
                top: { style: "thin" as const },
                left: { style: "thin" as const },
                bottom: { style: "thin" as const },
                right: { style: "thin" as const },
            };

            const totalRows = worksheet.rowCount;
            const totalCols = flatColumns.length;

            for (let row = dataRowOffset; row <= totalRows; row++) {
                for (let col = 1; col <= totalCols; col++) {
                    const cell = worksheet.getCell(row, col);
                    cell.border = borderStyle;
                    if (textColumnIndices.has(col - 1)) {
                        cell.alignment = {
                            wrapText: true,
                            vertical: "top",
                        };
                    }
                }
            }

            if (activeTab === "performance") {
                currentData.forEach((rowData: any, rowIndex: number) => {
                    flatColumns.forEach((col, colIndex: number) => {
                        if (col.title === "%" && col.parentTitle) {
                            const periodMatch =
                                col.key?.match(/^(\w+)performance$/);
                            if (periodMatch) {
                                const period = periodMatch[1];
                                const styleKey = `${period}style`;
                                const style = rowData[styleKey];

                                if (style) {
                                    const cell = worksheet.getCell(
                                        rowIndex + dataRowOffset,
                                        colIndex + 1,
                                    );
                                    const bgColor =
                                        style.backgroundColor?.replace(
                                            "#",
                                            "",
                                        ) || "FFFFFF";
                                    const fontColor =
                                        style.color === "white"
                                            ? "FFFFFFFF"
                                            : "FF000000";

                                    cell.fill = {
                                        type: "pattern",
                                        pattern: "solid",
                                        fgColor: { argb: `FF${bgColor}` },
                                    };
                                    cell.font = {
                                        color: { argb: fontColor },
                                    };
                                    cell.border = borderStyle;

                                    if (textColumnIndices.has(colIndex)) {
                                        cell.alignment = {
                                            wrapText: true,
                                            vertical: "top",
                                        };
                                    }
                                }
                            }
                        }
                    });
                });
            }

            worksheet.columns.forEach((column, index) => {
                if (textColumnIndices.has(index)) {
                    column.width = 40;
                } else {
                    column.width = 18;
                }
            });

            for (let row = dataRowOffset; row <= totalRows; row++) {
                let maxLinesNeeded = 1;
                let hasTextContent = false;

                for (let col = 1; col <= totalCols; col++) {
                    const cell = worksheet.getCell(row, col);
                    const cellValue = String(cell.value || "");

                    if (
                        textColumnIndices.has(col - 1) &&
                        cellValue.length > 0
                    ) {
                        hasTextContent = true;

                        const displayText =
                            cellValue.length > 60
                                ? cellValue.substring(0, 60) + "..."
                                : cellValue;

                        const avgCharsPerLine = 35;
                        const words = displayText.split(/\s+/);
                        let currentLineLength = 0;
                        let lines = 1;

                        for (const word of words) {
                            if (
                                currentLineLength + word.length + 1 >
                                avgCharsPerLine
                            ) {
                                lines++;
                                currentLineLength = word.length;
                            } else {
                                currentLineLength += word.length + 1;
                            }
                        }

                        maxLinesNeeded = Math.max(maxLinesNeeded, lines);
                    }
                }

                let calculatedHeight = 20;

                if (hasTextContent && maxLinesNeeded > 1) {
                    calculatedHeight = Math.max(20);
                }

                worksheet.getRow(row).height = calculatedHeight;
            }

            const filename = `results_${activeTab}_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
        },
        [columns, finalData],
    );
    const tableProps = useMemo<TableProps<Record<string, any>>>(
        () => ({
            scroll: { y: "calc(100vh - 460px)" },
            rowKey: "id",
            bordered: true,
            sticky: true,
            tableLayout: "auto",
            pagination: false,
            size: "middle",
            dataSource: uniqBy(finalData, "id"),
        }),
        [finalData],
    );
    const items: TabsProps["items"] = useMemo(
        () => [
            {
                key: "target",
                label: (
                    <div style={{ width: 200, textAlign: "center" }}>
                        Targets
                    </div>
                ),
                children: (
                    <Flex
                        vertical
                        gap={10}
                        style={{ height: "calc(100vh - 278px)" }}
                    >
                        <Flex justify="end">
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => exportToExcel("target")}
                                type="primary"
                            >
                                Download Excel
                            </Button>
                        </Flex>
                        <Table
                            {...tableProps}
                            columns={columns.get("target")}
                        />
                    </Flex>
                ),
            },
            {
                key: "performance",
                label: (
                    <div style={{ width: 200, textAlign: "center" }}>
                        Performance
                    </div>
                ),
                children: (
                    <Flex
                        vertical
                        gap={10}
                        style={{
                            height: "calc(100vh - 278px)",
                        }}
                    >
                        <PerformanceLegend />
                        <Flex>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => exportToExcel("performance")}
                                type="primary"
                            >
                                Download Excel
                            </Button>
                        </Flex>
                        <Table
                            {...tableProps}
                            columns={columns.get("performance")}
                        />
                    </Flex>
                ),
            },
        ],
        [columns, tableProps, exportToExcel],
    );

    return (
        <Tabs
            activeKey={tab || "target"}
            type="card"
            items={items}
            onChange={onChange}
            size="large"
            renderTabBar={(props, DefaultTabBar) => (
                <DefaultTabBar
                    {...props}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyItems: "center",
                        flexDirection: "row",
                    }}
                />
            )}
            style={{
                "--tab-bg": "#f5f5f5",
                "--tab-active-bg": "#ffffff",
                "--tab-border": "#e8e8e8",
                "--tab-shadow": "0 2px 8px rgba(0,0,0,0.1)",
            } as React.CSSProperties}
            className="file-icon-tabs"
        />
    );
}
