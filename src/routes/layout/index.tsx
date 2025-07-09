import { createRoute } from "@tanstack/react-router";
import React from "react";

import { LayoutRoute } from "./route";

export const LayoutIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => LayoutRoute,
    component: Component,
});

function Component() {
    return <div>Index</div>;
}
