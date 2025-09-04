import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";

export const FAQRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "faqs",
    component: FAQComponent,
});

function FAQComponent() {
    return (
        <Flex>
            <Outlet />
        </Flex>
    );
}
