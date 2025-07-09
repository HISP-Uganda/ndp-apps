import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import { NDPRoute } from "../route";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { useSuspenseQuery } from "@tanstack/react-query";
import Filter from "../../../../components/Filter";

export const SubProgramOutcomeRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "sub-program-outcomes",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                "sub-programme",
                v,
            ),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = SubProgramOutcomeRoute.useRouteContext();
    const { v, deg, degs, ou, pe, program } =
        SubProgramOutcomeRoute.useSearch();
    const { data } = useSuspenseQuery(
        dataElementGroupSetsWithProgramsQueryOptions(
            engine,
            "sub-programme",
            v,
        ),
    );
    const navigate = SubProgramOutcomeRoute.useNavigate();

    useEffect(() => {
        if (degs === undefined) {
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
                        label: "Program",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
