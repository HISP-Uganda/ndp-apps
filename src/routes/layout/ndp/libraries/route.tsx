import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const LibraryRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "libraries",
    component: Component,
});

function Component() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
