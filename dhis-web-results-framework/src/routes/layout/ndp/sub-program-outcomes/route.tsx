import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

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
    const { v, deg, degs, ou, pe, program, category, categoryOptions } =
        SubProgramOutcomeRoute.useSearch();
    const { categories } = useLoaderData({ from: "__root__" });
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                    }}
                >
                    {programGoal && (
                        <h3 style={{ margin: 0, color: "#1677FF" }}>
                            Program Goal:
                        </h3>
                    )}
                    <h3 style={{ margin: 0, flex: 1 }}>
                        {programGoal?.name ?? "Program goal not found"}
                    </h3>
                </div>
            )}
            <Outlet />
        </Flex>
    );
}
