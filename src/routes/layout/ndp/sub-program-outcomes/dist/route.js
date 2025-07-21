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
exports.__esModule = true;
exports.SubProgramOutcomeRoute = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_1 = require("react");
var antd_1 = require("antd");
var route_1 = require("../route");
var query_options_1 = require("../../../../query-options");
var types_1 = require("../../../../types");
var react_query_1 = require("@tanstack/react-query");
var Filter_1 = require("../../../../components/Filter");
exports.SubProgramOutcomeRoute = react_router_1.createRoute({
    getParentRoute: function () { return route_1.NDPRoute; },
    path: "sub-program-outcomes",
    component: Component,
    loaderDeps: function (_a) {
        var search = _a.search;
        return ({
            v: search.v
        });
    },
    loader: function (_a) {
        var context = _a.context, v = _a.deps.v;
        return __awaiter(void 0, void 0, void 0, function () {
            var engine, queryClient, data;
            return __generator(this, function (_b) {
                engine = context.engine, queryClient = context.queryClient;
                data = queryClient.ensureQueryData(query_options_1.dataElementGroupSetsWithProgramsQueryOptions(engine, "sub-programme", v));
                return [2 /*return*/, data];
            });
        });
    },
    validateSearch: types_1.GoalValidator
});
function Component() {
    var engine = exports.SubProgramOutcomeRoute.useRouteContext().engine;
    var _a = exports.SubProgramOutcomeRoute.useSearch(), v = _a.v, deg = _a.deg, degs = _a.degs, ou = _a.ou, pe = _a.pe, program = _a.program;
    var data = react_query_1.useSuspenseQuery(query_options_1.dataElementGroupSetsWithProgramsQueryOptions(engine, "sub-programme", v)).data;
    var navigate = exports.SubProgramOutcomeRoute.useNavigate();
    react_1.useEffect(function () {
        if (degs === undefined) {
            navigate({
                search: function (prev) {
                    var _a, _b, _c;
                    return (__assign(__assign({}, prev), { program: (_c = (_b = (_a = data.options) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.code) !== null && _c !== void 0 ? _c : "" }));
                }
            });
        }
    }, [v]);
    return (react_1["default"].createElement(antd_1.Flex, { vertical: true, gap: 10, style: { padding: 10 } },
        react_1["default"].createElement(Filter_1["default"], { data: { deg: deg, degs: degs, ou: ou, pe: pe, program: program }, onChange: function (val, previous) {
                if (previous) {
                    navigate({
                        search: function (prev) {
                            var _a;
                            return (__assign(__assign(__assign({}, prev), val), (_a = {}, _a[previous] = undefined, _a)));
                        }
                    });
                }
                else {
                    navigate({
                        search: function (prev) { return (__assign(__assign({}, prev), val)); }
                    });
                }
            }, options: [
                {
                    key: "program",
                    options: data.options.map(function (_a) {
                        var name = _a.name, code = _a.code;
                        return ({
                            value: code,
                            label: name
                        });
                    }),
                    label: "Program"
                },
            ] }),
        react_1["default"].createElement(react_router_1.Outlet, null)));
}
