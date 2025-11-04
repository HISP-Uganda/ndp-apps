import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TableProps } from "antd";

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

// Convert hex color to RGB array with validation
const hexToRgb = (hex: string): [number, number, number] | null => {
    if (!hex || typeof hex !== "string") return null;

    // Remove # if present
    const cleanHex = hex.replace("#", "").trim();

    // Validate hex format (must be 3 or 6 characters)
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        console.warn(`Invalid hex color: ${hex}`);
        return null;
    }

    // Expand shorthand format (e.g., "03F" -> "0033FF")
    const fullHex =
        cleanHex.length === 3
            ? cleanHex
                  .split("")
                  .map((char) => char + char)
                  .join("")
            : cleanHex;

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    // Validate RGB values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn(`Invalid RGB values from hex: ${hex}`);
        return null;
    }

    return [r, g, b];
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

// Calculate header depth
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

// Build header rows for jspdf-autotable
const buildHeaderRows = (columns: any[], maxDepth: number) => {
    const headerRows: any[][] = Array.from({ length: maxDepth }, () => []);

    const traverse = (
        cols: any[],
        rowIndex: number,
        colOffset: number,
    ): number => {
        let currentCol = colOffset;

        cols.forEach((col) => {
            if (col.children && col.children.length > 0) {
                const childLeafCount = flattenColumns([col]).length;
                const color = extractHeaderColor(col);

                const cellStyle: any = {
                    halign: col.align || "center",
                    valign: "middle",
                    fontStyle: "bold",
                };

                // Only add colors if they're valid
                if (color?.bg) {
                    const bgRgb = hexToRgb(color.bg);
                    if (bgRgb) cellStyle.fillColor = bgRgb;
                } else {
                    cellStyle.fillColor = [200, 200, 200];
                }

                if (color?.fg) {
                    const fgRgb = hexToRgb(color.fg);
                    if (fgRgb) cellStyle.textColor = fgRgb;
                } else {
                    cellStyle.textColor = [0, 0, 0];
                }

                headerRows[rowIndex].push({
                    content: col.title,
                    colSpan: childLeafCount,
                    rowSpan: 1,
                    styles: cellStyle,
                });

                traverse(col.children, rowIndex + 1, currentCol);
                currentCol += childLeafCount;
            } else {
                const remainingRows = maxDepth - rowIndex;
                const color = extractHeaderColor(col);

                const cellStyle: any = {
                    halign: col.align || "center",
                    valign: "middle",
                    fontStyle: "bold",
                };

                // Only add colors if they're valid
                if (color?.bg) {
                    const bgRgb = hexToRgb(color.bg);
                    if (bgRgb) cellStyle.fillColor = bgRgb;
                } else {
                    cellStyle.fillColor = [200, 200, 200];
                }

                if (color?.fg) {
                    const fgRgb = hexToRgb(color.fg);
                    if (fgRgb) cellStyle.textColor = fgRgb;
                } else {
                    cellStyle.textColor = [0, 0, 0];
                }

                headerRows[rowIndex].push({
                    content: col.title,
                    colSpan: 1,
                    rowSpan: remainingRows,
                    styles: cellStyle,
                });

                currentCol++;
            }
        });

        return currentCol;
    };

    traverse(columns, 0, 0);
    return headerRows;
};

const downloadPdfFromColumns = (
    columns: TableProps<any>["columns"],
    data: any[],
    filename: string = "export.pdf",
    options?: {
        orientation?: "portrait" | "landscape";
        title?: string;
    },
) => {
    if (!columns) return;

    const doc = new jsPDF({
        orientation: options?.orientation || "landscape",
        unit: "mm",
        format: "a4",
    });

    // Add title if provided
    if (options?.title) {
        doc.setFontSize(16);
        doc.text(options.title, 14, 15);
    }

    // Get leaf columns
    const leafColumns = flattenColumns(columns);

    // Calculate header depth
    const headerDepth = calculateHeaderDepth(columns);

    // Build header rows
    const headerRows = buildHeaderRows(columns, headerDepth);

    // Prepare body data
    const bodyData = data.map((record, recordIndex) => {
        return leafColumns.map((col: any) => {
            const value = record[col.dataIndex || col.key];

            // Apply render function if it exists
            if (col.render && typeof col.render === "function") {
                try {
                    const rendered = col.render(value, record, recordIndex);
                    return typeof rendered === "string"
                        ? rendered
                        : value ?? "";
                } catch {
                    return value ?? "";
                }
            }

            return value ?? "";
        });
    });

    // Create column definitions with widths
    const columnStyles: any = {};
    leafColumns.forEach((col: any, index: number) => {
        const width = typeof col.width === "number" ? col.width / 10 : "auto";
        columnStyles[index] = {
            cellWidth: width,
            halign: col.align || "left",
        };
    });

    // Generate table
    autoTable(doc, {
        head: headerRows,
        body: bodyData,
        startY: options?.title ? 20 : 10,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
        },
        columnStyles: columnStyles,
        didParseCell: (hookData) => {
            // Apply onCell styling to body cells
            if (hookData.section === "body") {
                const colIndex = hookData.column.index;
                const rowIndex = hookData.row.index;
                const col = leafColumns[colIndex];
                const record = data[rowIndex];

                if (col.onCell && record) {
                    const value = record[col.dataIndex || col.key];
                    const cellColor = extractCellColor(
                        col,
                        value,
                        record,
                        rowIndex,
                    );

                    if (cellColor) {
                        if (cellColor.bg) {
                            const bgRgb = hexToRgb(cellColor.bg);
                            if (bgRgb) {
                                hookData.cell.styles.fillColor = bgRgb;
                            }
                        }
                        if (cellColor.fg) {
                            const fgRgb = hexToRgb(cellColor.fg);
                            if (fgRgb) {
                                hookData.cell.styles.textColor = fgRgb;
                            }
                        }
                    }
                }
            }
        },
    });

    // Save the PDF
    doc.save(filename);
};

export default downloadPdfFromColumns;
