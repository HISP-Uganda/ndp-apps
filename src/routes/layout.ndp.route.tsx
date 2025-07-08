import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { PathlessLayoutRoute } from "./layout.route";

export const NDPRoute = createRoute({
    getParentRoute: () => PathlessLayoutRoute,
    path: "/ndp",
    component: NDPRouteComponent,
});

function NDPRouteComponent() {
    return <Outlet />;
}
