import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { Flex } from "antd";
import React, { useEffect } from "react";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import {
    convertToDataElementGroupSetsOptions,
    convertToDataElementGroupsOptions,
} from "../../../../utils";
import { NDPRoute } from "../route";

export const GoalRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "goals",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = await queryClient.ensureQueryData(
            dataElementGroupSetsQueryOptions(engine, "goal", v),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = GoalRoute.useRouteContext();
    const { v, deg, degs, ou, pe, categoryOptions, category } =
        GoalRoute.useSearch();
    const { categories } = useLoaderData({ from: "__root__" });
    const { data } = useSuspenseQuery(
        dataElementGroupSetsQueryOptions(engine, "goal", v),
    );
    const navigate = GoalRoute.useNavigate();

    useEffect(() => {
        if (degs === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    degs: data?.[0]?.id,
                    deg: "All",
                    quarters: false,
                }),
            });
        }
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
            <Filter
                data={{ deg, degs, ou, pe }}
                onChange={(val, previous) => {
                    if (previous) {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...val,
                                [previous]: "All",
                            }),
                        });
                    } else {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...val,
                            }),
                        });
                    }
                }}
                options={[
                    {
                        key: "degs",
                        options: convertToDataElementGroupSetsOptions(data),
                        label: "Overall Goal",
                        defaultValue: "All",
                    },
                    {
                        key: "deg",
                        options: convertToDataElementGroupsOptions(degs, data),
                        label: "Key Result Area",
                        defaultValue: "All",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
