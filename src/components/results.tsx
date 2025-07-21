import {
    Button,
    Flex,
    Table,
    TableColumnsType,
    TableProps,
    Tabs,
    TabsProps,
    Tooltip,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { groupBy, orderBy, sumBy } from "lodash";
import React, { useCallback, useMemo } from "react";
import ExcelJS from "exceljs";
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

const TruncatedText = React.memo(
    ({ text, maxLength = 50 }: { text: string; maxLength?: number }) => {
        if (!text || text.length <= maxLength) {
            return <span>{text}</span>;
        }

        const truncated = text.substring(0, maxLength) + "...";

        return (
            <Tooltip title={text} placement="topLeft">
                <span style={{ cursor: "help" }}>{truncated}</span>
            </Tooltip>
        );
    },
);

TruncatedText.displayName = "TruncatedText";

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
        completeness,
    } = useMemo(() => {
        const periods = data.analytics.metaData.dimensions["pe"] ?? [];
        const [, target = "", value = ""] =
            data.analytics.metaData.dimensions["Duw5yep8Vae"] ?? [];
        const analyticsItems = data.analytics.metaData.items;
        let finalData = orderBy(
            makeDataElementData({ ...data, targetId: target, actualId: value }),
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
        const completeness = data.groupSets.map((degs) => {
            const dataElements = filterMapFunctional<
                string,
                Record<string, string>
            >(data.dataElements, (_, value) => value && degs in value);
            const firstDataElement = dataElements[0] ?? {};

            const dataElementGroupSet = firstDataElement[degs];

            const results: Record<string, any> = {
                ...firstDataElement,
                dataElementGroupSet,
            };

            const availableIndicators = finalData.filter((row) => degs in row);

            data.analytics.metaData.dimensions["pe"].map((pe) => {
                const target = sumBy(availableIndicators, `${pe}target`);
                const actual = sumBy(availableIndicators, `${pe}actual`);
                results[`${pe}target`] = formatPercentage(
                    target / dataElements.length,
                );
                results[`${pe}actual`] = formatPercentage(
                    actual / dataElements.length,
                );
            });
            return results;
        });
        const dataElementGroups = data.dataElementGroups.map((deg) => {
            const dataElements = filterMapFunctional<
                string,
                Record<string, string>
            >(data.dataElements, (_, value) => value && deg in value);
            const totalIndicators = dataElements.length;
            const firstDataElement = dataElements[0] ?? {};
            const dataElementGroup = data.dataElementGroups
                .flatMap((group) => {
                    const value = firstDataElement[group];
                    if (value === undefined) {
                        return [];
                    }
                    return value;
                })
                .join(" ");

            const dataElementGroupSet = data.groupSets
                .flatMap((group) => {
                    const value = firstDataElement[group];
                    if (value === undefined) {
                        return [];
                    }
                    return value;
                })
                .join(" ");

            const results: Record<string, any> = {
                ...firstDataElement,
                dataElementGroup,
                dataElementGroupSet,
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
            completeness,
        };
    }, [data.analytics]);

    const nameColumn: TableColumnsType<
        Record<string, string | number | undefined>
    > = useMemo(
        () => [
            ...prefixColumns.map((col) => ({
                ...col,
                render:
                    col.render ||
                    ((text: string) => {
                        const dataIndex =
                            "dataIndex" in col ? (col.dataIndex as string) : "";
                        if (
                            dataIndex === "dataElementGroup" ||
                            dataIndex === "dataElementGroupSet" ||
                            (typeof text === "string" && text.length > 50)
                        ) {
                            return <TruncatedText text={text} maxLength={50} />;
                        }
                        return text;
                    }),
                width: col.width || 250,
            })),
            {
                title: "Indicators",
                dataIndex: "dx",
                width: 300,
                render: (text: string) => (
                    <TruncatedText text={text} maxLength={60} />
                ),
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
            ...prefixColumns.map((col) => ({
                ...col,
                render:
                    col.render ||
                    ((text: string) => {
                        // Apply truncation to text columns
                        const dataIndex =
                            "dataIndex" in col ? (col.dataIndex as string) : "";
                        if (
                            dataIndex === "dataElementGroup" ||
                            dataIndex === "dataElementGroupSet" ||
                            (typeof text === "string" && text.length > 50)
                        ) {
                            return <TruncatedText text={text} maxLength={50} />;
                        }
                        return text;
                    }),
                width: col.width || 250,
            })),
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
            ...prefixColumns.filter((col) => {
                return col.key === "dataElementGroupSet";
            }),
            ...periods.map((pe) => ({
                title: analyticsItems[pe].name,
                children: [
                    {
                        title: "Target",
                        dataIndex: `${pe}target`,
                        width: "200px",
                        align: "center",
                    },
                    {
                        title: "Actual",
                        dataIndex: `${pe}actual`,
                        width: "200px",
                        align: "center",
                    },
                ],
            })),
        ]);
        return columnsMap;
    }, [
        nameColumn,
        periods,
        target,
        value,
        analyticsItems,
        postfixColumns,
        prefixColumns,
    ]);

    const exportToExcel = useCallback(
        async (activeTab: string) => {
            const currentData =
                activeTab === "performance-overview"
                    ? dataElementGroups
                    : finalData;
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

            // Initialize text column indices before using them
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

                // Add comments for truncated text in Excel
                flatColumns.forEach((col, colIndex) => {
                    const value = row[col.dataIndex || col.key];
                    const stringValue = String(value || "");

                    // Check if this is a text column and the content is long
                    if (
                        textColumnIndices.has(colIndex) &&
                        stringValue.length > 60
                    ) {
                        const cell = worksheet.getCell(
                            rowIndex + dataRowOffset,
                            colIndex + 1,
                        );

                        // Truncate the display value
                        cell.value = stringValue.substring(0, 60) + "...";

                        // Add full content as a comment
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

                                    // Preserve word wrap for text columns
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

            if (activeTab === "performance-overview") {
                flatColumns.forEach((col, colIndex: number) => {
                    if (
                        col.title &&
                        ["A%", "M%", "N%", "X%"].includes(col.title)
                    ) {
                        const letter = col.title.charAt(0).toLowerCase();
                        const headerStyle =
                            headerColors[letter as keyof typeof headerColors];

                        if (headerStyle) {
                            const headerRowIndex = hasNestedHeaders ? 2 : 1;
                            const headerCell = worksheet.getCell(
                                headerRowIndex,
                                colIndex + 1,
                            );
                            const bgColor =
                                headerStyle.backgroundColor?.replace("#", "") ||
                                "FFFFFF";
                            const fontColor =
                                headerStyle.color === "white"
                                    ? "FFFFFFFF"
                                    : "FF000000";

                            headerCell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: { argb: `FF${bgColor}` },
                            };
                            headerCell.font = {
                                color: { argb: fontColor },
                                bold: true,
                            };
                            headerCell.border = borderStyle;

                            // Preserve word wrap for text column headers
                            if (textColumnIndices.has(colIndex)) {
                                headerCell.alignment = {
                                    horizontal: "center",
                                    vertical: "middle",
                                    wrapText: true,
                                };
                            }
                        }
                    }
                });
            }

            worksheet.columns.forEach((column, index) => {
                // Set width based on whether this is a text column
                if (textColumnIndices.has(index)) {
                    column.width = 40;
                } else {
                    column.width = 18;
                }
            });

            // Calculate dynamic row heights based on content
            for (let row = dataRowOffset; row <= totalRows; row++) {
                let maxLinesNeeded = 1;
                let hasTextContent = false;

                // Check each cell in the row to determine content complexity
                for (let col = 1; col <= totalCols; col++) {
                    const cell = worksheet.getCell(row, col);
                    const cellValue = String(cell.value || "");

                    // Only consider text columns for height calculation
                    if (
                        textColumnIndices.has(col - 1) &&
                        cellValue.length > 0
                    ) {
                        hasTextContent = true;

                        // Use truncated content for height calculation (max 60 chars + "...")
                        const displayText =
                            cellValue.length > 60
                                ? cellValue.substring(0, 60) + "..."
                                : cellValue;

                        // More accurate line calculation considering word wrapping
                        const avgCharsPerLine = 35; // Considering column width of 40
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

                // Calculate height based on number of lines needed
                let calculatedHeight = 20; // minimum height

                if (hasTextContent && maxLinesNeeded > 1) {
                    // Each line needs about 16 pixels, with base padding
                    calculatedHeight = Math.max(
                        20,
                        Math.min(maxLinesNeeded * 16 + 8, 120),
                    );
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
        [columns, dataElementGroups, finalData],
    );

    const tableProps = useMemo<TableProps>(
        () => ({
            scroll: { y: "calc(100vh - 420px)", x: "max-content" },
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
    const completenessTableProps = useMemo<TableProps>(
        () => ({
            scroll: { y: "calc(100vh - 420px)", x: "max-content" },
            rowKey: "id",
            bordered: true,
            sticky: true,
            tableLayout: "auto",
            dataSource: completeness,
            pagination: false,
            size: "small",
        }),
        [finalData],
    );

    const performanceOverviewTableProps = useMemo<TableProps>(
        () => ({
            scroll: { y: "calc(100vh - 420px)", x: "max-content" },
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
                    <Flex vertical gap={10}>
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
                label: "Performance",
                children: (
                    <Flex vertical gap={10}>
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
            {
                key: "performance-overview",
                label: "Performance overview",
                children: (
                    <Flex vertical gap={10}>
                        <PerformanceLegend />
                        <Flex>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                    exportToExcel("performance-overview")
                                }
                                type="primary"
                            >
                                Download Excel
                            </Button>
                        </Flex>
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
                    <Flex vertical gap={10}>
                        <Flex justify="end">
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => exportToExcel("completeness")}
                                type="primary"
                            >
                                Download Excel
                            </Button>
                        </Flex>
                        <Table
                            {...completenessTableProps}
                            columns={columns.get("completeness")}
                        />
                    </Flex>
                ),
            },
        ],
        [columns, tableProps, performanceOverviewTableProps, exportToExcel],
    );

    return (
        <Tabs activeKey={tab || "target"} items={items} onChange={onChange} />
    );
}
