import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex, Typography } from "antd";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";
import { RootRoute } from "../../../__root";

export const OutcomeLevelRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "outcome-levels",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                "objective",
                v,
            ),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = OutcomeLevelRoute.useRouteContext();
    const { v, deg, degs, ou, pe, program } = OutcomeLevelRoute.useSearch();
    const { data } = useSuspenseQuery(
        dataElementGroupSetsWithProgramsQueryOptions(engine, "objective", v),
    );
    const navigate = OutcomeLevelRoute.useNavigate();

    const { programGoals } = RootRoute.useLoaderData();

    const programGoal = programGoals.find(
        (pg) => program !== undefined && pg.code.includes(program),
    );
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
                        label: "NDP Programme",
                    },
                    {
                        key: "degs",
                        options: data.dataElementGroupSets.map(
                            ({ name, id }) => ({
                                value: id,
                                label: name,
                            }),
                        ),
                        label: "Program Objective",
                    },
                ]}
            />

            {program && (
                <Flex gap={10} align="center">
                    {programGoal && (
                        <Typography.Title
                            level={5}
                            type="warning"
                            style={{ margin: 0 }}
                        >
                            Program Goal:
                        </Typography.Title>
                    )}
                    <Typography.Title
                        level={5}
                        style={{ margin: 0, flex: 1, color: "gray" }}
                    >
                        {programGoal?.name ?? "Program goal not found"}
                    </Typography.Title>
                </Flex>
            )}
            <Outlet />
        </Flex>
    );
}
