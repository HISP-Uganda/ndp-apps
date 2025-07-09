import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const IndicatorDictionaryRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "indicator-dictionaries",
    component: Component,
});

function Component() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
