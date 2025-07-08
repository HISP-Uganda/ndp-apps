import React from "react";
import { QueryClient } from "@tanstack/react-query";
import {
    createHashHistory,
    createRouter,
    ErrorComponent,
} from "@tanstack/react-router";
import { Flex, Spin } from "antd";
import { IndexRoute } from "./routes/index";
import { NDPRoute } from "./routes/layout.ndp.route";
import { RootRoute } from "./routes/__root";
import { NDPItemRoute } from "./routes/layout.ndp.$item";
import { PathlessLayoutRoute } from "./routes/layout.route";
import { NDPIndexRoute } from "./routes/layout.ndp.index";

const routeTree = RootRoute.addChildren([
    IndexRoute,
    PathlessLayoutRoute.addChildren([
        NDPRoute.addChildren([NDPIndexRoute, NDPItemRoute]),
    ]),
]);
export const router = createRouter({
    routeTree,
    defaultPendingComponent: () => (
        <Flex justify="center" align="center" style={{ height: "100%" }}>
            <Spin />
        </Flex>
    ),
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    history: createHashHistory(),
    context: { queryClient: new QueryClient(), engine: undefined! },

    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
});
