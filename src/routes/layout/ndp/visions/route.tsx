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
    const { configurations } = useLoaderData({ from: "__root__" });

    const { data } = useSuspenseQuery(
        dataElementGroupSetsQueryOptions(engine, "vision2040", v),
    );

    useEffect(() => {
        if (degs === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    degs: data?.[0]?.id ?? "",
                    pe: [ configurations[v]?.data?.baseline, "2024July", "2039July"],
                    quarters: false,
                }),
            });
        }
    }, []);

    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Outlet />
        </Flex>
    );
}
