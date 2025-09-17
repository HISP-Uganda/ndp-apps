import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex, Typography } from "antd";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";
import { RootRoute } from "../../../__root";

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
    errorComponent: () => <div>{null}</div>,
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
