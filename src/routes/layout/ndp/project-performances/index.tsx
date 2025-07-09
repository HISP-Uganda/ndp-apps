import { createRoute } from "@tanstack/react-router";
import React from "react";
import { ProjectPerformanceRoute } from "./route";

export const ProjectPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => ProjectPerformanceRoute,
    component: Component,
});

function Component() {
    return <div>Index</div>;
}
