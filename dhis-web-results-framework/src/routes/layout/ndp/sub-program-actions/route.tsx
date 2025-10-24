import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex, Spin } from "antd";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";
import Spinner from "../../../../components/Spinner";

export const SubProgramActionRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "sub-program-actions",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = await queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                v === "NDPIII"
                    ? "sub-intervention4action"
                    : "intervention4actions",
                v,
            ),
        );
        return data;
    },
    validateSearch: GoalValidator,
    pendingComponent: Spinner,
});

function Component() {
    const { engine } = SubProgramActionRoute.useRouteContext();
    const { v, deg, degs, ou, pe, program, category, categoryOptions } =
        SubProgramActionRoute.useSearch();
    const { categories } = useLoaderData({ from: "__root__" });
    const { data } = useSuspenseQuery(
        dataElementGroupSetsWithProgramsQueryOptions(
            engine,
            v === "NDPIII" ? "sub-intervention4action" : "intervention4actions",
            v,
        ),
    );
    const navigate = SubProgramActionRoute.useNavigate();

    useEffect(() => {
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
                data={{ deg, degs, ou, pe, program }}
                onChange={(val, previous) => {
                    if (previous) {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...val,
                                [previous]: undefined,
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
                        key: "program",
                        options: data.options.map(({ name, code }) => ({
                            value: code,
                            label: name,
                        })),
                        label: "Programme",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
