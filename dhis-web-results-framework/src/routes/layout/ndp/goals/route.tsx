import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { Flex } from "antd";
import React, { useEffect } from "react";
import Filter from "../../../../components/Filter";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";
import { RootRoute } from "../../../__root";

export const GoalRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "goals",
    component: Component,
    validateSearch: GoalValidator,
});

function Component() {
    const { v, ou, pe, categoryOptions, category, objective } =
        GoalRoute.useSearch();
    const { categories, programGoals, keyResultAreas } =
        RootRoute.useLoaderData();
    const navigate = GoalRoute.useNavigate();

    const overallGoal = programGoals.find((goal) => goal.code === "ndpIVGoal");

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
                data={{ ou, pe, objective }}
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
                        key: "objective",
                        options: keyResultAreas.map((kra) => ({
                            label: kra.name,
                            value: kra.code,
                        })),
                        label: "Key Result Area",
                        defaultValue: "All",
                    },
                ]}
            />

            {overallGoal && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                    }}
                >
                    {overallGoal && (
                        <h3 style={{ margin: 0, color: "#1677FF" }}>Overall Goal:</h3>
                    )}
                    <h3 style={{ margin: 0, flex: 1 }}>
                        {overallGoal?.name ?? "Overall goal not found"}
                    </h3>
                </div>
            )}

            <Outlet />
        </Flex>
    );
}
