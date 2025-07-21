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
exports.__esModule = true;
exports.LayoutRoute = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var antd_1 = require("antd");
var query_options_1 = require("../../query-options");
var types_1 = require("../../types");
var __root_1 = require("../__root");
exports.LayoutRoute = react_router_1.createRoute({
    getParentRoute: function () { return __root_1.RootRoute; },
    id: "layout",
    component: Component,
    validateSearch: types_1.NDPValidator
});
function Component() {
    var engine = exports.LayoutRoute.useRouteContext().engine;
    var navigate = exports.LayoutRoute.useNavigate();
    var v = exports.LayoutRoute.useSearch().v;
    var voteLevelLabel = v === "NDPIII" ? "Sub-Programme Results" : "Vote Level Results";
    var treeData = [
        {
            title: "NDP Results",
            key: "0",
            selectable: false,
            checkable: false,
            disabled: true,
            children: [
                {
                    title: "High Level Results",
                    selectable: false,
                    checkable: false,
                    disabled: true,
                    key: "0-0",
                    children: [
                        {
                            title: "Vision 2040 Targets",
                            key: "vision2040",
                            to: "/ndp/visions"
                        },
                        {
                            title: "Goal",
                            key: "goal",
                            to: "/ndp/goals"
                        },
                        {
                            title: "Objective",
                            key: "resultsFrameworkObjective",
                            to: "/ndp/objectives"
                        },
                        {
                            title: "Outcome Level",
                            key: "objective",
                            to: "/ndp/outcome-levels"
                        },
                    ]
                },
                {
                    title: voteLevelLabel,
                    key: "0-1",
                    selectable: false,
                    checkable: false,
                    disabled: true,
                    children: [
                        {
                            title: "Intermediate Outcomes",
                            key: "sub-programme",
                            to: "/ndp/sub-program-outcomes"
                        },
                        {
                            title: "Output Level",
                            key: "output",
                            to: "/ndp/sub-program-outputs"
                        },
                        {
                            title: "Action Level",
                            key: "sub-intervention4action",
                            to: "/ndp/sub-program-actions"
                        },
                    ]
                },
            ]
        },
        {
            title: "Tracking",
            key: "1",
            selectable: false,
            checkable: false,
            disabled: true,
            children: [
                {
                    title: "Project Performance",
                    key: "project-performance",
                    to: "/ndp/sub-program-outcomes"
                },
                {
                    title: "Policy Actions",
                    key: "policy-actions",
                    to: "/ndp/policy-actions"
                },
            ]
        },
        {
            title: "Data Governance",
            key: "2",
            selectable: false,
            checkable: false,
            disabled: true,
            children: [
                {
                    title: "Indicator Dictionary",
                    key: "2-0",
                    to: "/ndp/indicator-dictionaries"
                },
                {
                    title: "Workflow & Guidelines",
                    key: "2-1",
                    to: "/ndp/workflows"
                },
                {
                    title: "FAQs",
                    key: "2-2",
                    to: "/ndp/faqs"
                },
            ]
        },
        {
            title: "Library",
            key: "3",
            to: "/ndp/libraries"
        },
    ];
    var _a = react_query_1.useSuspenseQuery(query_options_1.initialQueryOptions(engine, [
        "vision2040",
        "goal",
        "resultsFrameworkObjective",
        "objective",
        "sub-programme",
        "sub-intervention4action",
        "sub-intervention",
    ], "uV4fZlNvUsw", "nZffnMQwoWr")).data, ndpVersions = _a.ndpVersions, ou = _a.ou;
    var onSelect = function (selectedKeys, _a) {
        var node = _a.node;
        if (selectedKeys.length > 0 && node.to) {
            navigate({
                to: node.to,
                search: function (prev) {
                    return __assign(__assign({}, prev), { v: v,
                        ou: ou, degs: undefined, deg: undefined, program: undefined });
                }
            });
        }
    };
    return (react_1["default"].createElement(antd_1.Splitter, { style: {
            height: "calc(100vh - 48px)"
        } },
        react_1["default"].createElement(antd_1.Splitter.Panel, { defaultSize: "15%", min: "15%", max: "30%", style: { padding: "10px" } },
            react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 20 },
                react_1["default"].createElement(antd_1.Select, { options: ndpVersions.map(function (_a) {
                        var name = _a.name, code = _a.code;
                        return ({
                            label: name,
                            value: code
                        });
                    }), style: { width: "100%" }, onChange: function (value) {
                        navigate({
                            search: function (prev) { return (__assign(__assign({}, prev), { v: value, ou: ou, degs: undefined, deg: undefined, program: undefined })); }
                        });
                    }, value: v }),
                react_1["default"].createElement(antd_1.Tree, { showLine: true, defaultExpandAll: true, treeData: treeData, multiple: false, onSelect: onSelect }))),
        react_1["default"].createElement(antd_1.Splitter.Panel, null,
            react_1["default"].createElement(react_router_1.Outlet, null))));
}
