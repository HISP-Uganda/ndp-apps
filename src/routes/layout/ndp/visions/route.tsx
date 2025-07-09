import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex } from "antd";
import { dataElementGroupSetsQueryOptions } from "../../../../query-options";
import { NDPRoute } from "../route";
import { GoalValidator } from "../../../../types";

export const VisionRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "visions",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsQueryOptions(engine, "vision2040", v),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = VisionRoute.useRouteContext();
    const { v } = VisionRoute.useSearch();
    useSuspenseQuery(dataElementGroupSetsQueryOptions(engine, "vision2040", v));

    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Outlet />
        </Flex>
    );
}
