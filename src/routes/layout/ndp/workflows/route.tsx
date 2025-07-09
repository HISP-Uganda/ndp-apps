import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const WorkflowRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "workflows",
    component: WorkflowRouteComponent,
});

function WorkflowRouteComponent() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
