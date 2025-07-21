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
exports.OutcomeLevelIndexRoute = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_1 = require("react");
var results_1 = require("../../../../components/results");
var data_hooks_1 = require("../../../../hooks/data-hooks");
var route_1 = require("./route");
exports.OutcomeLevelIndexRoute = react_router_1.createRoute({
    path: "/",
    getParentRoute: function () { return route_1.OutcomeLevelRoute; },
    component: Component
});
var extractDataElementGroupsByProgram = function (dataElementGroupSets, program) {
    if (program === undefined || dataElementGroupSets.length === 0) {
        return [];
    }
    return dataElementGroupSets.flatMap(function (d) {
        var hasProgram = d.attributeValues.some(function (a) { return a.value === program; });
        if (hasProgram) {
            return d.dataElementGroups.map(function (g) { return g.id; });
        }
        return [];
    });
};
function Component() {
    var engine = exports.OutcomeLevelIndexRoute.useRouteContext().engine;
    var _a = exports.OutcomeLevelIndexRoute.useSearch(), ou = _a.ou, deg = _a.deg, pe = _a.pe, tab = _a.tab, program = _a.program, degs = _a.degs;
    var navigate = exports.OutcomeLevelIndexRoute.useNavigate();
    var dataElementGroupSets = route_1.OutcomeLevelRoute.useLoaderData().dataElementGroupSets;
    var dataElementGroups = data_hooks_1.useDataElementGroups({ deg: deg, pe: pe, ou: ou, program: program, degs: degs }, dataElementGroupSets);
    var data = data_hooks_1.useAnalyticsQuery(engine, dataElementGroups, {
        deg: deg,
        pe: pe,
        ou: ou,
        program: program,
        degs: degs
    });
    var onChange = react_1.useCallback(function (key) {
        navigate({
            search: function (prev) { return (__assign(__assign({}, prev), { tab: key })); }
        });
    }, [navigate]);
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
