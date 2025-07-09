import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { LayoutRoute } from "../route";

export const NDPRoute = createRoute({
    getParentRoute: () => LayoutRoute,
    path: "/ndp",
    component: Component,
});

function Component() {
    return <Outlet />;
}
