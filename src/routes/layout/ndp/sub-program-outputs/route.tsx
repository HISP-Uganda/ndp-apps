import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";
import { GoalValidator } from "../../../../types";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import Filter from "../../../../components/Filter";
import { useSuspenseQuery } from "@tanstack/react-query";

export const SubProgramOutputRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "sub-program-outputs",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                "sub-intervention",
                v,
            ),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = SubProgramOutputRoute.useRouteContext();
    const { v, deg, degs, ou, pe, program } = SubProgramOutputRoute.useSearch();
    const { data } = useSuspenseQuery(
        dataElementGroupSetsWithProgramsQueryOptions(
            engine,
            "sub-intervention",
            v,
        ),
    );
    const navigate = SubProgramOutputRoute.useNavigate();

    useEffect(() => {
        if (program === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    program: data.options?.[0]?.code ?? "",
                }),
            });
        }
    }, []);
    return (
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Filter
                data={{ deg, degs, ou, pe, program }}
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
                        key: "program",
                        options: data.options.map(({ name, code }) => ({
                            value: code,
                            label: name,
                        })),
                        label: "Program",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
