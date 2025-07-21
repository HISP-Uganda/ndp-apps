"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var multi_calendar_dates_1 = require("@dhis2/multi-calendar-dates");
var antd_1 = require("antd");
var dayjs_1 = require("dayjs");
var react_1 = require("react");
var utils_1 = require("../utils");
var Text = antd_1.Typography.Text;
var DEFAULT_PERIOD_TYPE = "FYJUL";
var CURRENT_YEAR = dayjs_1["default"]().year();
var MIN_YEAR = 1900;
var FIXED_PERIOD_TYPE_OPTIONS = utils_1.createOptions2(["Financial-Year (Start July)"], ["FYJUL"]);
var getFixedPeriod = function (period) {
    return multi_calendar_dates_1.getFixedPeriodByDate({
        periodType: "FYJUL",
        date: dayjs_1["default"](period, "YYYY-MM").format("YYYY-MM-DD"),
        calendar: "iso8601"
    });
};
var LIST_CONTAINER_STYLE = {
    backgroundColor: "white",
    padding: 5,
    minHeight: 280,
    height: 280,
    maxHeight: 280,
    border: "1px solid #d9d9d9",
    overflowY: "auto"
};
var PeriodItem = react_1["default"].memo(function (_a) {
    var period = _a.period, onClick = _a.onClick;
    var handleClick = react_1.useCallback(function () {
        onClick(period);
    }, [period, onClick]);
    return (react_1["default"].createElement(Text, { key: period.id, style: { cursor: "pointer", padding: "2px 4px" }, onClick: handleClick }, period.name));
});
PeriodItem.displayName = "PeriodItem";
function PeriodSelector(_a) {
    var onChange = _a.onChange, selectedPeriods = _a.selectedPeriods;
    var _b = react_1.useState(CURRENT_YEAR), year = _b[0], setYear = _b[1];
    var _c = react_1.useState(DEFAULT_PERIOD_TYPE), fixedPeriodType = _c[0], setFixedPeriodType = _c[1];
    var initialPeriods = react_1.useMemo(function () {
        if (!(selectedPeriods === null || selectedPeriods === void 0 ? void 0 : selectedPeriods.length))
            return [];
        return selectedPeriods.map(getFixedPeriod);
    }, [selectedPeriods]);
    var _d = react_1.useState(initialPeriods), periods = _d[0], setPeriods = _d[1];
    var availableFixedPeriods = react_1.useMemo(function () {
        var currentYear = year !== null && year !== void 0 ? year : CURRENT_YEAR;
        var generatedPeriods = multi_calendar_dates_1.generateFixedPeriods({
            year: currentYear,
            calendar: "iso8601",
            periodType: fixedPeriodType,
            locale: "en"
        });
        var selectedIds = new Set(periods.map(function (p) { return p.id; }));
        return generatedPeriods.filter(function (p) { return !selectedIds.has(p.id); });
    }, [fixedPeriodType, year, periods]);
    var selectedPeriodTypeOption = react_1.useMemo(function () {
        var _a;
        return (_a = FIXED_PERIOD_TYPE_OPTIONS.find(function (_a) {
            var value = _a.value;
            return value === fixedPeriodType;
        })) === null || _a === void 0 ? void 0 : _a.value;
    }, [fixedPeriodType]);
    var handlePeriodTypeChange = react_1.useCallback(function (value) {
        setFixedPeriodType(value || DEFAULT_PERIOD_TYPE);
    }, []);
    var handleYearChange = react_1.useCallback(function (value) {
        setYear(value);
    }, []);
    var handleAddPeriod = react_1.useCallback(function (period) {
        setPeriods(function (prev) { return __spreadArrays(prev, [period]); });
    }, []);
    var handleRemovePeriod = react_1.useCallback(function (period) {
        setPeriods(function (prev) { return prev.filter(function (p) { return p.id !== period.id; }); });
    }, []);
    var handleSubmit = react_1.useCallback(function () {
        var periodIds = periods.map(function (p) { return p.id; });
        onChange(periodIds);
    }, [periods, onChange]);
    var handleClearAll = react_1.useCallback(function () {
        setPeriods([]);
    }, []);
    var handleSelectAll = react_1.useCallback(function () {
        setPeriods(function (prev) {
            var currentIds = new Set(prev.map(function (p) { return p.id; }));
            var newPeriods = availableFixedPeriods.filter(function (p) { return !currentIds.has(p.id); });
            return __spreadArrays(prev, newPeriods);
        });
    }, [availableFixedPeriods]);
    return (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10 },
        react_1["default"].createElement(antd_1.Flex, { align: "center", gap: 10 },
            react_1["default"].createElement(Text, null, "Period Type"),
            react_1["default"].createElement(antd_1.Select, { options: FIXED_PERIOD_TYPE_OPTIONS, allowClear: true, onChange: handlePeriodTypeChange, style: { flex: 1 }, value: selectedPeriodTypeOption, placeholder: "Select period type", disabled: true })),
        react_1["default"].createElement(antd_1.Flex, { gap: 10 },
            react_1["default"].createElement(antd_1.Flex, { vertical: true, flex: 1, gap: 10 },
                react_1["default"].createElement(antd_1.Flex, { justify: "space-between", align: "center" },
                    react_1["default"].createElement(Text, null,
                        "Available Periods (",
                        availableFixedPeriods.length,
                        ")"),
                    availableFixedPeriods.length > 0 && (react_1["default"].createElement(antd_1.Button, { size: "small", onClick: handleSelectAll }, "Select All"))),
                react_1["default"].createElement(antd_1.Flex, { vertical: true, style: LIST_CONTAINER_STYLE }, availableFixedPeriods.length === 0 ? (react_1["default"].createElement(Text, { type: "secondary", style: { textAlign: "center", padding: 20 } }, "No available periods")) : (availableFixedPeriods.map(function (period) { return (react_1["default"].createElement(PeriodItem, { key: period.id, period: period, onClick: handleAddPeriod })); }))),
                react_1["default"].createElement(antd_1.Flex, { align: "center", gap: 10 },
                    react_1["default"].createElement(Text, null, "Year"),
                    react_1["default"].createElement(antd_1.InputNumber, { min: MIN_YEAR, max: CURRENT_YEAR + 10, value: year, onChange: handleYearChange, placeholder: "Enter year", style: { width: 120 } }))),
            react_1["default"].createElement(antd_1.Flex, { align: "center", justify: "center", vertical: true, gap: 10 },
                react_1["default"].createElement(Text, { type: "secondary" }, "Transfer"),
                react_1["default"].createElement(Text, null, "\u2192"),
                react_1["default"].createElement(Text, null, "\u2190")),
            react_1["default"].createElement(antd_1.Flex, { vertical: true, flex: 1, gap: 10 },
                react_1["default"].createElement(antd_1.Flex, { justify: "space-between", align: "center" },
                    react_1["default"].createElement(Text, null,
                        "Selected Periods (",
                        periods.length,
                        ")"),
                    periods.length > 0 && (react_1["default"].createElement(antd_1.Button, { size: "small", onClick: handleClearAll }, "Clear All"))),
                react_1["default"].createElement(antd_1.Flex, { vertical: true, style: LIST_CONTAINER_STYLE }, periods.length === 0 ? (react_1["default"].createElement(Text, { type: "secondary", style: { textAlign: "center", padding: 20 } }, "No periods selected")) : (periods.map(function (period) { return (react_1["default"].createElement(PeriodItem, { key: period.id, period: period, onClick: handleRemovePeriod })); }))),
                react_1["default"].createElement(antd_1.Flex, { gap: 10 },
                    react_1["default"].createElement(antd_1.Button, { type: "primary", onClick: handleSubmit, disabled: periods.length === 0, style: { flex: 1 } },
                        "Apply (",
                        periods.length,
                        ")"))))));
}
exports["default"] = PeriodSelector;
