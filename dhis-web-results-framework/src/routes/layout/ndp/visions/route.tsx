import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

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
    const { v, degs } = VisionRoute.useSearch();
    const navigate = VisionRoute.useNavigate();

    const { data } = useSuspenseQuery(
        dataElementGroupSetsQueryOptions(engine, "vision2040", v),
    );
    useEffect(() => {
        if (degs === undefined) {
            navigate({
                search: (prev) => {
                    console.log(prev);
                    return {
                        ...prev,
                        degs: data?.[0]?.id ?? "",
                    };
                },
            });
        }
    }, []);

    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Outlet />
        </Flex>
    );
}
