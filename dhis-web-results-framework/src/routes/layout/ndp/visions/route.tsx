import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";

export const VisionRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "visions",
    component: Component,
   
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = VisionRoute.useRouteContext();
    const { v, objective, category, categoryOptions } = VisionRoute.useSearch();
    const { categories } = useLoaderData({ from: "__root__" });
    const navigate = VisionRoute.useNavigate();

    useEffect(() => {
        // if (objective === undefined) {
        //     navigate({
        //         search: (prev) => {
        //             return {
        //                 ...prev,
        //                 objective: data?.[0]?.id ?? "",
        //             };
        //         },
        //     });
        // }

        if (categoryOptions === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    categoryOptions: categories.get(category),
                }),
            });
        }
    }, []);

    return (
        <Flex vertical gap={10} style={{ padding: 10, height: "100%" }}>
            <Outlet />
        </Flex>
    );
}
