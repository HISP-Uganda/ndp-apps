import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute, Outlet } from "@tanstack/react-router";
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
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsQueryOptions(engine, "goal", v),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = GoalRoute.useRouteContext();
    const { v, deg, degs, ou, pe } = GoalRoute.useSearch();
    const { data } = useSuspenseQuery(
        dataElementGroupSetsQueryOptions(engine, "goal", v),
    );
    const navigate = GoalRoute.useNavigate();

    useEffect(() => {
        if (degs === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    degs: data?.[0]?.id ?? "",
                    quarters: false,
                }),
            });
        }
    }, [v]);

    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Filter
                data={{ deg, degs, ou, pe }}
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
                        key: "degs",
                        options: convertToDataElementGroupSetsOptions(data),
                        label: "Goal",
                    },
                    {
                        key: "deg",
                        options: convertToDataElementGroupsOptions(degs, data),
                        label: "Key Result Area",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
