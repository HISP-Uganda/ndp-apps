import ExcelJS, { Alignment } from "exceljs";
import { saveAs } from "file-saver";
import { TableProps } from "antd";

// Helper function to convert hex to ARGB format for ExcelJS
const hexToArgb = (hex: string): string => {
    const cleanHex = hex.replace("#", "");
    return cleanHex.length === 6 ? `FF${cleanHex}` : cleanHex;
};

// Function to extract color from onHeaderCell
const extractHeaderColor = (column: any) => {
    if (column.onHeaderCell) {
        const headerStyle = column.onHeaderCell();
        if (headerStyle?.style) {
            return {
                bg: headerStyle.style.backgroundColor,
                fg: headerStyle.style.color,
            };
        }
    }
    return null;
};

// Function to extract color from onCell
const extractCellColor = (
    column: any,
    value: any,
    record: any,
    index: number,
) => {
    if (column.onCell) {
        const cellProps = column.onCell(record);
        if (cellProps?.style) {
            return {
                bg: cellProps.style.backgroundColor,
                fg: cellProps.style.color,
            };
        }
    }
    return null;
};

// Flatten columns to get leaf columns (actual data columns)
const flattenColumns = (columns: any[]): any[] => {
    const result: any[] = [];

    const traverse = (cols: any[]) => {
        cols.forEach((col) => {
            if (col.children && col.children.length > 0) {
                traverse(col.children);
            } else {
                result.push(col);
            }
        });
    };

    traverse(columns);
    return result;
};

// Calculate header depth (number of header rows needed)
const calculateHeaderDepth = (columns: any[]): number => {
    let maxDepth = 1;

    const traverse = (cols: any[], depth: number) => {
        cols.forEach((col) => {
            if (col.children && col.children.length > 0) {
                traverse(col.children, depth + 1);
            } else {
                maxDepth = Math.max(maxDepth, depth);
            }
        });
    };

    traverse(columns, 1);
    return maxDepth;
};

interface HeaderCell {
    title: string;
    colSpan: number;
    rowSpan: number;
    color: any;
    align?: string;
}

// Build a 2D grid for headers
const buildHeaderGrid = (
    columns: any[],
    maxDepth: number,
): (HeaderCell | null)[][] => {
    const leafColumns = flattenColumns(columns);
    const totalCols = leafColumns.length;

    // Initialize grid with nulls
    const grid: (HeaderCell | null)[][] = Array.from({ length: maxDepth }, () =>
        Array(totalCols).fill(null),
    );

    // Traverse and fill grid
    const traverse = (
        cols: any[],
        rowIndex: number,
        colOffset: number,
    ): number => {
        let currentCol = colOffset;

        cols.forEach((col) => {
            if (col.children && col.children.length > 0) {
                // Parent column - get width by counting leaf children
                const childLeafCount = flattenColumns([col]).length;

                // Place this cell in the grid
                grid[rowIndex][currentCol] = {
                    title: col.title,
                    colSpan: childLeafCount,
                    rowSpan: 1,
                    color: extractHeaderColor(col),
                    align: col.align || "center",
                };

                // Fill the spanned columns with markers
                for (
                    let c = currentCol + 1;
                    c < currentCol + childLeafCount;
                    c++
                ) {
                    grid[rowIndex][c] = {
                        title: "",
                        colSpan: 0,
                        rowSpan: 0,
                        color: null,
                    };
                }

                // Recursively process children
                traverse(col.children, rowIndex + 1, currentCol);
                currentCol += childLeafCount;
            } else {
                // Leaf column - spans down to the bottom
                const remainingRows = maxDepth - rowIndex;

                grid[rowIndex][currentCol] = {
                    title: col.title,
                    colSpan: 1,
                    rowSpan: remainingRows,
                    color: extractHeaderColor(col),
                    align: col.align || "center",
                };

                // Fill the spanned rows with markers
                for (let r = rowIndex + 1; r < maxDepth; r++) {
                    grid[r][currentCol] = {
                        title: "",
                        colSpan: 0,
                        rowSpan: 0,
                        color: null,
                    };
                }

                currentCol++;
            }
        });

        return currentCol;
    };

    traverse(columns, 0, 0);
    return grid;
};

const downloadExcelFromColumns = async (
    columns: TableProps<any>["columns"],
    data: any[],
    filename: string = "export.xlsx",
) => {
    if (!columns) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Get leaf columns (actual data columns)
    const leafColumns = flattenColumns(columns);

    // Calculate header depth
    const headerDepth = calculateHeaderDepth(columns);

    // Build header grid
    const headerGrid = buildHeaderGrid(columns, headerDepth);

    // Set up columns based on leaf columns
    const excelColumns = leafColumns.map((col: any) => {
        const width = typeof col.width === "number" ? col.width / 8 : 15;
        return {
            header: "", // We'll set headers manually
            key: col.dataIndex || col.key,
            width: width,
            render: col.render,
            align: col.align,
            onCell: col.onCell, // Store onCell function
        };
    });

    worksheet.columns = excelColumns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
    }));

    // Process the grid and create headers with merges
    const mergeRanges: Array<{
        startRow: number;
        startCol: number;
        endRow: number;
        endCol: number;
    }> = [];

    headerGrid.forEach((row, rowIndex) => {
        const excelRow = worksheet.getRow(rowIndex + 1);

        row.forEach((cell, colIndex) => {
            // Skip marker cells (already part of a merge)
            if (cell === null || cell.colSpan === 0) {
                return;
            }

            const excelCell = excelRow.getCell(colIndex + 1);
            excelCell.value = cell.title;
            excelCell.font = { bold: true };
            excelCell.alignment = {
                vertical: "middle",
                horizontal: (cell.align || "center") as Alignment["horizontal"],
                wrapText: true,
            };

            // Apply color if exists
            if (cell.color) {
                excelCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: hexToArgb(cell.color.bg) },
                };
                excelCell.font = {
                    ...excelCell.font,
                    color: { argb: hexToArgb(cell.color.fg) },
                };
            }

            // Record merge ranges
            const startRow = rowIndex + 1;
            const startCol = colIndex + 1;
            const endRow = startRow + cell.rowSpan - 1;
            const endCol = startCol + cell.colSpan - 1;

            if (endRow > startRow || endCol > startCol) {
                mergeRanges.push({ startRow, startCol, endRow, endCol });
            }
        });
    });

    // Apply all merges
    mergeRanges.forEach((range) => {
        worksheet.mergeCells(
            range.startRow,
            range.startCol,
            range.endRow,
            range.endCol,
        );
    });

    // Add data rows (starting after header rows)
    data.forEach((record, recordIndex) => {
        const rowData: any = {};

        excelColumns.forEach((col) => {
            const value = record[col.key];

            // Apply render function if it exists
            if (col.render && typeof col.render === "function") {
                try {
                    const rendered = col.render(value, record, recordIndex);
                    rowData[col.key] =
                        typeof rendered === "string" ? rendered : value;
                } catch {
                    rowData[col.key] = value;
                }
            } else {
                rowData[col.key] = value ?? "";
            }
        });

        const row = worksheet.addRow(rowData);

        // Apply alignment and colors to data cells based on column configuration
        excelColumns.forEach((col, index) => {
            const cell = row.getCell(index + 1);
            const value = record[col.key];

            // Apply alignment
            if (col.align) {
                cell.alignment = {
                    horizontal: col.align as any,
                    vertical: "middle",
                };
            }

            // Extract and apply cell color from onCell function
            if (col.onCell) {
                const cellColor = extractCellColor(
                    col,
                    value,
                    record,
                    recordIndex,
                );
                if (cellColor) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: hexToArgb(cellColor.bg) },
                    };
                    if (cellColor.fg) {
                        cell.font = {
                            color: { argb: hexToArgb(cellColor.fg) },
                        };
                    }
                }
            }
        });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename);
};

export default downloadExcelFromColumns;
