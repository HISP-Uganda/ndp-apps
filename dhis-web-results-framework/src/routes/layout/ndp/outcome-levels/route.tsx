import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import Filter from "../../../../components/Filter";
import { GoalValidator, Option } from "../../../../types";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";
import { queryDataElements } from "../../../../query-options";
import { uniqBy } from "lodash";

export const OutcomeLevelRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "outcome-levels",
    component: Component,
    validateSearch: GoalValidator,
});

function Component() {
    const search = OutcomeLevelRoute.useSearch();
    const { categories, programs } = RootRoute.useLoaderData();
    const navigate = OutcomeLevelRoute.useNavigate();
    const { programGoals, allOptionsMap } = RootRoute.useLoaderData();
    const programGoal = programGoals.find(
        (pg) =>
            search.program !== undefined && pg.code.includes(search.program),
    );
    const [objectives, setObjectives] = React.useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        async function loadObjectives() {
            const result = await queryDataElements({
                ...search,
                attributeValue: "outcome",
                ndpVersion: search.v,
            });

            if (isMounted) setObjectives(result);
        }
        loadObjectives();
        return () => {
            isMounted = false;
        };
    }, [search.program]);

    useEffect(() => {
        if (search.categoryOptions === undefined) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    categoryOptions: categories.get(search.category),
                }),
            });
        }
    }, []);

    return (
        <Flex vertical gap={10} style={{ padding: 10, height: "100%" }}>
            <Filter
                data={{
                    objective: search.objective,
                    program: search.program,
                }}
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
                        options: programs.map(({ name, code }) => ({
                            value: code,
                            label: name,
                        })),
                        label: "NDP Programme",
                    },
                    {
                        key: "objective",
                        options: uniqBy(
                            objectives.map(({ GuoVDNEBAXA }) => ({
                                value: GuoVDNEBAXA,
                                label:
                                    allOptionsMap.get(GuoVDNEBAXA) ||
                                    GuoVDNEBAXA,
                            })),
                            "value",
                        ),
                        label: "Program Objective",
                    },
                ]}
            />

            {search.program && (
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
