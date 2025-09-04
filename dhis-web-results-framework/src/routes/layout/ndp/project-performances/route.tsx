import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const ProjectPerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "project-performances",
    component: Component,
});

function Component() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
