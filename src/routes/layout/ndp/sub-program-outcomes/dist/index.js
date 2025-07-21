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
exports.SubProgramOutcomeIndexRoute = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_1 = require("react");
var results_1 = require("../../../../components/results");
var data_hooks_1 = require("../../../../hooks/data-hooks");
var route_1 = require("./route");
exports.SubProgramOutcomeIndexRoute = react_router_1.createRoute({
    path: "/",
    getParentRoute: function () { return route_1.SubProgramOutcomeRoute; },
    component: Component
});
function Component() {
    var engine = exports.SubProgramOutcomeIndexRoute.useRouteContext().engine;
    var _a = exports.SubProgramOutcomeIndexRoute.useSearch(), ou = _a.ou, deg = _a.deg, pe = _a.pe, tab = _a.tab, program = _a.program, degs = _a.degs;
    var navigate = exports.SubProgramOutcomeIndexRoute.useNavigate();
    var dataElementGroupSets = route_1.SubProgramOutcomeRoute.useLoaderData().dataElementGroupSets;
    var dataElementGroups = data_hooks_1.useDataElementGroups({ deg: deg, pe: pe, ou: ou, program: program, degs: degs }, dataElementGroupSets);
    var data = data_hooks_1.useAnalyticsQuery(engine, dataElementGroups, {
        deg: deg,
        pe: pe,
        ou: ou,
        program: program,
        degs: degs
    });
    var onChange = function (key) {
        navigate({
            search: function (prev) { return (__assign(__assign({}, prev), { tab: key })); }
        });
    };
    var resultsProps = react_1.useMemo(function () { return ({
        data: __assign(__assign({}, data.data), dataElementGroups),
        dataElementGroupSets: dataElementGroupSets,
        onChange: onChange,
        tab: tab,
        deg: deg,
        ou: ou,
        pe: pe,
        prefixColumns: [
            {
                title: "Programme Objectives",
                dataIndex: "dataElementGroupSet"
            },
            {
                title: "Outcomes",
                dataIndex: "dataElementGroup"
            },
        ]
    }); }, [data.data, dataElementGroupSets, onChange, tab, deg, ou, pe, degs]);
    return react_1["default"].createElement(results_1.Results, __assign({}, resultsProps));
}
