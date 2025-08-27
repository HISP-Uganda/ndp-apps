import { createRoute } from "@tanstack/react-router";
import React from "react";
import { PolicyActionRoute } from "./route";

export const PolicyActionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => PolicyActionRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    return <div>Index</div>;
}
