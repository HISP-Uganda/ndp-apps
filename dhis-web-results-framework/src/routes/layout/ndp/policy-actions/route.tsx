import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const PolicyActionRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "policy-actions",
    component: Component,
});

function Component() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
