import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dataElementGroupSetsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import Filter from "../../../../components/Filter";
import {
    convertToDataElementGroupSetsOptions,
    convertToDataElementGroupsOptions,
} from "../../../../utils";

export const ObjectiveRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "objectives",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    validateSearch: GoalValidator,
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsQueryOptions(
                engine,
                "resultsFrameworkObjective",
                v,
            ),
        );
        return data;
    },
});

function Component() {
    const { engine } = ObjectiveRoute.useRouteContext();
    const { v, deg, degs, ou, pe } = ObjectiveRoute.useSearch();
    const { data } = useSuspenseQuery(
        dataElementGroupSetsQueryOptions(
            engine,
            "resultsFrameworkObjective",
            v,
        ),
    );
    const navigate = ObjectiveRoute.useNavigate();

    useEffect(() => {
        if (degs === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    degs: data?.[0]?.id ?? "",
                }),
            });
        }
    }, []);

    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Filter
                data={{ deg, degs, ou, pe }}
                onChange={(val, next) => {
                    if (next) {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...val,
                                [next]: undefined,
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
                        label: "Objective",
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
