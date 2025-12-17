import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import Filter from "../../../../components/Filter";
import { GoalValidator } from "../../../../types";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";
import { queryDataElements } from "../../../../query-options";
import { uniqBy } from "lodash";

export const SubProgramOutcomeRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "sub-program-outcomes",
    component: Component,
    validateSearch: GoalValidator,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const search = SubProgramOutcomeRoute.useSearch();
    const options = NDPRoute.useLoaderData();
    const { categories } = RootRoute.useLoaderData();

    const navigate = SubProgramOutcomeRoute.useNavigate();
    const { programGoals, programs, allOptionsMap } = RootRoute.useLoaderData();
    const [objectives, setObjectives] = React.useState<any[]>([]);
    const { objective, ou, pe, program, category, categoryOptions, v } = search;

    const programGoal = programGoals.find(
        (pg) => program !== undefined && pg.code.includes(program),
    );

    useEffect(() => {
        let isMounted = true;
        async function loadObjectives() {
            const result = await queryDataElements({
                ...search,
                attributeValue: "intermediateOutcome",
                ndpVersion: v,
            });

            if (isMounted) setObjectives(result);
        }
        loadObjectives();
        return () => {
            isMounted = false;
        };
    }, [search.program]);

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
                data={{ objective, ou, pe, program }}
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
