"use strict";
exports.__esModule = true;
exports.NDPRoute = void 0;
var react_router_1 = require("@tanstack/react-router");
var react_1 = require("react");
var route_1 = require("../route");
exports.NDPRoute = react_router_1.createRoute({
    getParentRoute: function () { return route_1.LayoutRoute; },
    path: "/ndp",
    component: Component
});
function Component() {
    return react_1["default"].createElement(react_router_1.Outlet, null);
}
