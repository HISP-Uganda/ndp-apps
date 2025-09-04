import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { RootRoute } from "../__root";

export const SettingsRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/settings",
    component: Component,
});

function Component() {
    return <Outlet />;
}
