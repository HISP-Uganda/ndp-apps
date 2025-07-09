import { createRoute } from "@tanstack/react-router";
import React from "react";
import { WorkflowRoute } from "./route";

export const WorkFlowIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => WorkflowRoute,
    component: Component,
});

function Component() {
    return <div>Index</div>;
}
