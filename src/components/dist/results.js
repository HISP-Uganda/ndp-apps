"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Results = void 0;
var antd_1 = require("antd");
var icons_1 = require("@ant-design/icons");
var lodash_1 = require("lodash");
var react_1 = require("react");
var exceljs_1 = require("exceljs");
var utils_1 = require("../utils");
var PERFORMANCE_LABELS = {
    0: "Target",
    1: "Actual",
    2: "%"
};
var OVERVIEW_COLUMNS = ["a", "m", "n", "x"];
var PerformanceLegend = react_1["default"].memo(function () {
    var legendItems = [
        {
            bg: utils_1.PERFORMANCE_COLORS.green.bg,
            color: "white",
            label: "Achieved (≤ 100%)"
        },
        {
            bg: utils_1.PERFORMANCE_COLORS.yellow.bg,
            color: "black",
            label: "Moderately achieved (75-99%)"
        },
        {
            bg: utils_1.PERFORMANCE_COLORS.red.bg,
            color: "black",
            label: "Not achieved (< 75%)"
        },
        { bg: utils_1.PERFORMANCE_COLORS.gray.bg, color: "black", label: "No Data" },
    ];
    return (react_1["default"].createElement(antd_1.Flex, { justify: "between", align: "center", gap: "4px" }, legendItems.map(function (item, index) { return (react_1["default"].createElement("div", { key: index, style: {
            width: "100%",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: item.bg,
            color: item.color
        } }, item.label)); })));
});
PerformanceLegend.displayName = "PerformanceLegend";
var TruncatedText = react_1["default"].memo(function (_a) {
    var text = _a.text, _b = _a.maxLength, maxLength = _b === void 0 ? 50 : _b;
    if (!text || text.length <= maxLength) {
        return react_1["default"].createElement("span", null, text);
    }
    var truncated = text.substring(0, maxLength) + "...";
    return (react_1["default"].createElement(antd_1.Tooltip, { title: text, placement: "topLeft" },
        react_1["default"].createElement("span", { style: { cursor: "help" } }, truncated)));
});
TruncatedText.displayName = "TruncatedText";
function Results(_a) {
    var _this = this;
    var tab = _a.tab, data = _a.data, onChange = _a.onChange, _b = _a.postfixColumns, postfixColumns = _b === void 0 ? [] : _b, _c = _a.prefixColumns, prefixColumns = _c === void 0 ? [] : _c;
    var _d = react_1.useMemo(function () {
        var _a, _b;
        var periods = (_a = data.analytics.metaData.dimensions["pe"]) !== null && _a !== void 0 ? _a : [];
        var _c = (_b = data.analytics.metaData.dimensions["Duw5yep8Vae"]) !== null && _b !== void 0 ? _b : [], _d = _c[1], target = _d === void 0 ? "" : _d, _e = _c[2], value = _e === void 0 ? "" : _e;
        var analyticsItems = data.analytics.metaData.items;
        var finalData = lodash_1.orderBy(utils_1.makeDataElementData(__assign(__assign({}, data), { targetId: target, actualId: value })), ["code"], ["asc"]);
        finalData = finalData.map(function (row) {
            var dataElementGroup = data.dataElementGroups
                .flatMap(function (group) {
                var value = row[group];
                if (value === undefined) {
                    return [];
                }
                return value;
            })
                .join(" ");
            var dataElementGroupSet = data.groupSets
                .flatMap(function (group) {
                var value = row[group];
                if (value === undefined) {
                    return [];
                }
                return value;
            })
                .join(" ");
            return __assign(__assign({}, row), { dataElementGroup: dataElementGroup, dataElementGroupSet: dataElementGroupSet });
        });
        var completeness = data.groupSets.map(function (degs) {
            var _a;
            var dataElements = utils_1.filterMapFunctional(data.dataElements, function (_, value) { return value && degs in value; });
            var firstDataElement = (_a = dataElements[0]) !== null && _a !== void 0 ? _a : {};
            var dataElementGroupSet = firstDataElement[degs];
            var results = __assign(__assign({}, firstDataElement), { dataElementGroupSet: dataElementGroupSet });
            var availableIndicators = finalData.filter(function (row) { return degs in row; });
            data.analytics.metaData.dimensions["pe"].map(function (pe) {
                var target = lodash_1.sumBy(availableIndicators, pe + "target");
                var actual = lodash_1.sumBy(availableIndicators, pe + "actual");
                results[pe + "target"] = utils_1.formatPercentage(target / dataElements.length);
                results[pe + "actual"] = utils_1.formatPercentage(actual / dataElements.length);
            });
            return results;
        });
        var dataElementGroups = data.dataElementGroups.map(function (deg) {
            var _a;
            var dataElements = utils_1.filterMapFunctional(data.dataElements, function (_, value) { return value && deg in value; });
            var totalIndicators = dataElements.length;
            var firstDataElement = (_a = dataElements[0]) !== null && _a !== void 0 ? _a : {};
            var dataElementGroup = data.dataElementGroups
                .flatMap(function (group) {
                var value = firstDataElement[group];
                if (value === undefined) {
                    return [];
                }
                return value;
            })
                .join(" ");
            var dataElementGroupSet = data.groupSets
                .flatMap(function (group) {
                var value = firstDataElement[group];
                if (value === undefined) {
                    return [];
                }
                return value;
            })
                .join(" ");
            var results = __assign(__assign({}, firstDataElement), { dataElementGroup: dataElementGroup,
                dataElementGroupSet: dataElementGroupSet, indicators: totalIndicators });
            var availableIndicators = finalData.filter(function (row) { return deg in row; });
            data.analytics.metaData.dimensions["pe"].map(function (pe) {
                var grouped = lodash_1.groupBy(availableIndicators, pe + "performance-group");
                Object.entries(grouped).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var percentage = utils_1.formatPercentage(value.length / totalIndicators);
                    results["" + pe + key] = percentage;
                });
            });
            return results;
        });
        return {
            periods: periods,
            target: target,
            value: value,
            analyticsItems: analyticsItems,
            finalData: finalData,
            dataElementGroups: dataElementGroups,
            completeness: completeness
        };
    }, [data.analytics]), periods = _d.periods, target = _d.target, value = _d.value, analyticsItems = _d.analyticsItems, finalData = _d.finalData, dataElementGroups = _d.dataElementGroups, completeness = _d.completeness;
    var nameColumn = react_1.useMemo(function () { return __spreadArrays(prefixColumns.map(function (col) { return (__assign(__assign({}, col), { render: col.render ||
            (function (text) {
                var dataIndex = "dataIndex" in col ? col.dataIndex : "";
                if (dataIndex === "dataElementGroup" ||
                    dataIndex === "dataElementGroupSet" ||
                    (typeof text === "string" && text.length > 50)) {
                    return react_1["default"].createElement(TruncatedText, { text: text, maxLength: 50 });
                }
                return text;
            }), width: col.width || 250 })); }), [
        {
            title: "Indicators",
            dataIndex: "dx",
            width: 300,
            render: function (text) { return (react_1["default"].createElement(TruncatedText, { text: text, maxLength: 60 })); }
        },
    ]); }, [prefixColumns]);
    var columns = react_1.useMemo(function () {
        var columnsMap = new Map();
        columnsMap.set("target", __spreadArrays(nameColumn, periods.map(function (pe) { return ({
            title: analyticsItems[pe].name,
            dataIndex: "",
            align: "center",
            children: [
                {
                    title: "Target",
                    dataIndex: "" + pe + target,
                    width: "200px",
                    align: "center"
                },
            ]
        }); }), postfixColumns));
        columnsMap.set("performance", __spreadArrays(nameColumn, periods.map(function (pe) { return ({
            title: analyticsItems[pe].name,
            children: [target, value, "performance"].map(function (v, index) { return ({
                title: PERFORMANCE_LABELS[index],
                key: "" + pe + v,
                minWidth: "96px",
                align: "center",
                onCell: function (row) {
                    if (index === 2) {
                        return { style: row[pe + "style"] };
                    }
                    return {};
                },
                dataIndex: "" + pe + v
            }); })
        }); }), postfixColumns));
        columnsMap.set("performance-overview", __spreadArrays(prefixColumns.map(function (col) { return (__assign(__assign({}, col), { render: col.render ||
                (function (text) {
                    // Apply truncation to text columns
                    var dataIndex = "dataIndex" in col ? col.dataIndex : "";
                    if (dataIndex === "dataElementGroup" ||
                        dataIndex === "dataElementGroupSet" ||
                        (typeof text === "string" && text.length > 50)) {
                        return react_1["default"].createElement(TruncatedText, { text: text, maxLength: 50 });
                    }
                    return text;
                }), width: col.width || 250 })); }), [
            {
                title: "Indicators",
                dataIndex: "indicators",
                width: "115px",
                align: "center"
            }
        ], periods.map(function (pe) { return ({
            title: analyticsItems[pe].name,
            children: OVERVIEW_COLUMNS.map(function (v) { return ({
                title: v.toLocaleUpperCase() + "%",
                dataIndex: "" + pe + v,
                width: "60px",
                align: "center",
                onHeaderCell: function () {
                    return {
                        style: utils_1.headerColors[v]
                    };
                }
            }); })
        }); })));
        columnsMap.set("completeness", __spreadArrays(prefixColumns.filter(function (col) {
            return col.key === "dataElementGroupSet";
        }), periods.map(function (pe) { return ({
            title: analyticsItems[pe].name,
            children: [
                {
                    title: "Target",
                    dataIndex: pe + "target",
                    width: "200px",
                    align: "center"
                },
                {
                    title: "Actual",
                    dataIndex: pe + "actual",
                    width: "200px",
                    align: "center"
                },
            ]
        }); })));
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
    var exportToExcel = react_1.useCallback(function (activeTab) { return __awaiter(_this, void 0, void 0, function () {
        var currentData, currentColumns, workbook, worksheet, processColumns, _a, parentHeaders, childHeaders, flatColumns, mergeRanges, hasNestedHeaders, dataRowOffset, textColumnIndices, borderStyle, totalRows, totalCols, row, col, cell, row, maxLinesNeeded, hasTextContent, col, cell, cellValue, displayText, avgCharsPerLine, words, currentLineLength, lines, _i, words_1, word, calculatedHeight, filename, buffer, blob, url, link;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    currentData = activeTab === "performance-overview"
                        ? dataElementGroups
                        : finalData;
                    currentColumns = columns.get(activeTab) || [];
                    workbook = new exceljs_1["default"].Workbook();
                    worksheet = workbook.addWorksheet(activeTab);
                    processColumns = function (cols) {
                        var parentHeaders = [];
                        var childHeaders = [];
                        var flatColumns = [];
                        var mergeRanges = [];
                        var currentCol = 1;
                        cols.forEach(function (col) {
                            if (col.children && col.children.length > 0) {
                                var startCol = currentCol;
                                var endCol = currentCol + col.children.length - 1;
                                mergeRanges.push({
                                    start: startCol,
                                    end: endCol,
                                    title: col.title || ""
                                });
                                col.children.forEach(function (child) {
                                    parentHeaders.push(col.title || "");
                                    childHeaders.push(child.title || "");
                                    flatColumns.push(__assign(__assign({}, child), { parentTitle: col.title }));
                                    currentCol++;
                                });
                            }
                            else {
                                parentHeaders.push(col.title || "");
                                childHeaders.push("");
                                flatColumns.push(col);
                                currentCol++;
                            }
                        });
                        return {
                            parentHeaders: parentHeaders,
                            childHeaders: childHeaders,
                            flatColumns: flatColumns,
                            mergeRanges: mergeRanges
                        };
                    };
                    _a = processColumns(currentColumns), parentHeaders = _a.parentHeaders, childHeaders = _a.childHeaders, flatColumns = _a.flatColumns, mergeRanges = _a.mergeRanges;
                    hasNestedHeaders = mergeRanges.length > 0;
                    dataRowOffset = hasNestedHeaders ? 3 : 2;
                    if (hasNestedHeaders) {
                        worksheet.addRow(parentHeaders);
                        worksheet.addRow(childHeaders);
                        worksheet.getRow(1).height = 30;
                        worksheet.getRow(2).height = 30;
                        mergeRanges.forEach(function (_a) {
                            var start = _a.start, end = _a.end, title = _a.title;
                            if (start < end) {
                                worksheet.mergeCells(1, start, 1, end);
                                var mergedCell = worksheet.getCell(1, start);
                                mergedCell.value = title;
                                mergedCell.alignment = {
                                    horizontal: "center",
                                    vertical: "middle"
                                };
                                mergedCell.font = { bold: true };
                                mergedCell.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: { argb: "FFD0D0D0" }
                                };
                                mergedCell.border = {
                                    top: { style: "thin" },
                                    left: { style: "thin" },
                                    bottom: { style: "thin" },
                                    right: { style: "thin" }
                                };
                            }
                        });
                        parentHeaders.forEach(function (header, index) {
                            var cell = worksheet.getCell(1, index + 1);
                            if (!cell.isMerged) {
                                cell.value = header;
                                cell.alignment = {
                                    horizontal: "center",
                                    vertical: "middle"
                                };
                                cell.font = { bold: true };
                                cell.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: { argb: "FFD0D0D0" }
                                };
                                cell.border = {
                                    top: { style: "thin" },
                                    left: { style: "thin" },
                                    bottom: { style: "thin" },
                                    right: { style: "thin" }
                                };
                            }
                        });
                        childHeaders.forEach(function (header, index) {
                            var cell = worksheet.getCell(2, index + 1);
                            if (header) {
                                cell.value = header;
                                cell.alignment = {
                                    horizontal: "center",
                                    vertical: "middle"
                                };
                                cell.font = { bold: true };
                                cell.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: { argb: "FFE0E0E0" }
                                };
                                cell.border = {
                                    top: { style: "thin" },
                                    left: { style: "thin" },
                                    bottom: { style: "thin" },
                                    right: { style: "thin" }
                                };
                            }
                        });
                    }
                    else {
                        worksheet.addRow(parentHeaders);
                        worksheet.getRow(1).height = 30;
                        worksheet.getRow(1).font = { bold: true };
                        worksheet.getRow(1).fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFE0E0E0" }
                        };
                    }
                    textColumnIndices = new Set();
                    flatColumns.forEach(function (col, index) {
                        var title = col.title || col.dataIndex || "";
                        var dataIndex = col.dataIndex || col.key;
                        if (title.toLowerCase().includes("indicator") ||
                            title.toLowerCase().includes("name") ||
                            title.toLowerCase().includes("description") ||
                            title.toLowerCase().includes("code") ||
                            dataIndex === "dx" ||
                            dataIndex === "id" ||
                            dataIndex === "display" ||
                            (currentData.length > 0 &&
                                typeof currentData[0][dataIndex] === "string" &&
                                isNaN(Number(currentData[0][dataIndex])))) {
                            textColumnIndices.add(index);
                        }
                    });
                    currentData.forEach(function (row, rowIndex) {
                        var rowData = flatColumns.map(function (col) {
                            var value = row[col.dataIndex || col.key];
                            return value !== undefined && value !== null ? value : "";
                        });
                        var addedRow = worksheet.addRow(rowData);
                        // Add comments for truncated text in Excel
                        flatColumns.forEach(function (col, colIndex) {
                            var value = row[col.dataIndex || col.key];
                            var stringValue = String(value || "");
                            // Check if this is a text column and the content is long
                            if (textColumnIndices.has(colIndex) &&
                                stringValue.length > 60) {
                                var cell = worksheet.getCell(rowIndex + dataRowOffset, colIndex + 1);
                                // Truncate the display value
                                cell.value = stringValue.substring(0, 60) + "...";
                                // Add full content as a comment
                                cell.note = stringValue;
                            }
                        });
                    });
                    borderStyle = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                    totalRows = worksheet.rowCount;
                    totalCols = flatColumns.length;
                    for (row = dataRowOffset; row <= totalRows; row++) {
                        for (col = 1; col <= totalCols; col++) {
                            cell = worksheet.getCell(row, col);
                            cell.border = borderStyle;
                            if (textColumnIndices.has(col - 1)) {
                                cell.alignment = {
                                    wrapText: true,
                                    vertical: "top"
                                };
                            }
                        }
                    }
                    if (activeTab === "performance") {
                        currentData.forEach(function (rowData, rowIndex) {
                            flatColumns.forEach(function (col, colIndex) {
                                var _a, _b;
                                if (col.title === "%" && col.parentTitle) {
                                    var periodMatch = (_a = col.key) === null || _a === void 0 ? void 0 : _a.match(/^(\w+)performance$/);
                                    if (periodMatch) {
                                        var period = periodMatch[1];
                                        var styleKey = period + "style";
                                        var style = rowData[styleKey];
                                        if (style) {
                                            var cell = worksheet.getCell(rowIndex + dataRowOffset, colIndex + 1);
                                            var bgColor = ((_b = style.backgroundColor) === null || _b === void 0 ? void 0 : _b.replace("#", "")) || "FFFFFF";
                                            var fontColor = style.color === "white"
                                                ? "FFFFFFFF"
                                                : "FF000000";
                                            cell.fill = {
                                                type: "pattern",
                                                pattern: "solid",
                                                fgColor: { argb: "FF" + bgColor }
                                            };
                                            cell.font = {
                                                color: { argb: fontColor }
                                            };
                                            cell.border = borderStyle;
                                            // Preserve word wrap for text columns
                                            if (textColumnIndices.has(colIndex)) {
                                                cell.alignment = {
                                                    wrapText: true,
                                                    vertical: "top"
                                                };
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    }
                    if (activeTab === "performance-overview") {
                        flatColumns.forEach(function (col, colIndex) {
                            var _a;
                            if (col.title &&
                                ["A%", "M%", "N%", "X%"].includes(col.title)) {
                                var letter = col.title.charAt(0).toLowerCase();
                                var headerStyle = utils_1.headerColors[letter];
                                if (headerStyle) {
                                    var headerRowIndex = hasNestedHeaders ? 2 : 1;
                                    var headerCell = worksheet.getCell(headerRowIndex, colIndex + 1);
                                    var bgColor = ((_a = headerStyle.backgroundColor) === null || _a === void 0 ? void 0 : _a.replace("#", "")) ||
                                        "FFFFFF";
                                    var fontColor = headerStyle.color === "white"
                                        ? "FFFFFFFF"
                                        : "FF000000";
                                    headerCell.fill = {
                                        type: "pattern",
                                        pattern: "solid",
                                        fgColor: { argb: "FF" + bgColor }
                                    };
                                    headerCell.font = {
                                        color: { argb: fontColor },
                                        bold: true
                                    };
                                    headerCell.border = borderStyle;
                                    // Preserve word wrap for text column headers
                                    if (textColumnIndices.has(colIndex)) {
                                        headerCell.alignment = {
                                            horizontal: "center",
                                            vertical: "middle",
                                            wrapText: true
                                        };
                                    }
                                }
                            }
                        });
                    }
                    worksheet.columns.forEach(function (column, index) {
                        // Set width based on whether this is a text column
                        if (textColumnIndices.has(index)) {
                            column.width = 40;
                        }
                        else {
                            column.width = 18;
                        }
                    });
                    // Calculate dynamic row heights based on content
                    for (row = dataRowOffset; row <= totalRows; row++) {
                        maxLinesNeeded = 1;
                        hasTextContent = false;
                        // Check each cell in the row to determine content complexity
                        for (col = 1; col <= totalCols; col++) {
                            cell = worksheet.getCell(row, col);
                            cellValue = String(cell.value || "");
                            // Only consider text columns for height calculation
                            if (textColumnIndices.has(col - 1) &&
                                cellValue.length > 0) {
                                hasTextContent = true;
                                displayText = cellValue.length > 60
                                    ? cellValue.substring(0, 60) + "..."
                                    : cellValue;
                                avgCharsPerLine = 35;
                                words = displayText.split(/\s+/);
                                currentLineLength = 0;
                                lines = 1;
                                for (_i = 0, words_1 = words; _i < words_1.length; _i++) {
                                    word = words_1[_i];
                                    if (currentLineLength + word.length + 1 >
                                        avgCharsPerLine) {
                                        lines++;
                                        currentLineLength = word.length;
                                    }
                                    else {
                                        currentLineLength += word.length + 1;
                                    }
                                }
                                maxLinesNeeded = Math.max(maxLinesNeeded, lines);
                            }
                        }
                        calculatedHeight = 20;
                        if (hasTextContent && maxLinesNeeded > 1) {
                            // Each line needs about 16 pixels, with base padding
                            calculatedHeight = Math.max(20, Math.min(maxLinesNeeded * 16 + 8, 120));
                        }
                        worksheet.getRow(row).height = calculatedHeight;
                    }
                    filename = "results_" + activeTab + "_" + new Date().toISOString().split("T")[0] + ".xlsx";
                    return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                case 1:
                    buffer = _b.sent();
                    blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = filename;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    return [2 /*return*/];
            }
        });
    }); }, [columns, dataElementGroups, finalData]);
    var tableProps = react_1.useMemo(function () { return ({
        scroll: { y: "calc(100vh - 420px)", x: "max-content" },
        rowKey: "id",
        bordered: true,
        sticky: true,
        tableLayout: "auto",
        dataSource: finalData,
        pagination: false,
        size: "small"
    }); }, [finalData]);
    var completenessTableProps = react_1.useMemo(function () { return ({
        scroll: { y: "calc(100vh - 420px)", x: "max-content" },
        rowKey: "id",
        bordered: true,
        sticky: true,
        tableLayout: "auto",
        dataSource: completeness,
        pagination: false,
        size: "small"
    }); }, [finalData]);
    var performanceOverviewTableProps = react_1.useMemo(function () { return ({
        scroll: { y: "calc(100vh - 420px)", x: "max-content" },
        rowKey: "value",
        bordered: true,
        sticky: true,
        tableLayout: "auto",
        dataSource: dataElementGroups,
        pagination: false,
        size: "small"
    }); }, [dataElementGroups]);
    var items = react_1.useMemo(function () { return [
        {
            key: "target",
            label: "Targets",
            children: (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10 },
                react_1["default"].createElement(antd_1.Flex, { justify: "end" },
                    react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.DownloadOutlined, null), onClick: function () { return exportToExcel("target"); }, type: "primary" }, "Download Excel")),
                react_1["default"].createElement(antd_1.Table, __assign({}, tableProps, { columns: columns.get("target") }))))
        },
        {
            key: "performance",
            label: "Performance",
            children: (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10 },
                react_1["default"].createElement(PerformanceLegend, null),
                react_1["default"].createElement(antd_1.Flex, null,
                    react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.DownloadOutlined, null), onClick: function () { return exportToExcel("performance"); }, type: "primary" }, "Download Excel")),
                react_1["default"].createElement(antd_1.Table, __assign({}, tableProps, { columns: columns.get("performance") }))))
        },
        {
            key: "performance-overview",
            label: "Performance overview",
            children: (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10 },
                react_1["default"].createElement(PerformanceLegend, null),
                react_1["default"].createElement(antd_1.Flex, null,
                    react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.DownloadOutlined, null), onClick: function () {
                            return exportToExcel("performance-overview");
                        }, type: "primary" }, "Download Excel")),
                react_1["default"].createElement(antd_1.Table, __assign({}, performanceOverviewTableProps, { columns: columns.get("performance-overview") }))))
        },
        {
            key: "completeness",
            label: "Completeness",
            children: (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10 },
                react_1["default"].createElement(antd_1.Flex, { justify: "end" },
                    react_1["default"].createElement(antd_1.Button, { icon: react_1["default"].createElement(icons_1.DownloadOutlined, null), onClick: function () { return exportToExcel("completeness"); }, type: "primary" }, "Download Excel")),
                react_1["default"].createElement(antd_1.Table, __assign({}, completenessTableProps, { columns: columns.get("completeness") }))))
        },
    ]; }, [columns, tableProps, performanceOverviewTableProps, exportToExcel]);
    return (react_1["default"].createElement(antd_1.Tabs, { activeKey: tab || "target", items: items, onChange: onChange }));
}
exports.Results = Results;
