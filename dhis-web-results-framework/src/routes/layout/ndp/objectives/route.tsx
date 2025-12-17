import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { Flex } from "antd";
import Filter from "../../../../components/Filter";
import {
    dataElementGroupSetsQueryOptions,
    queryDataElements,
} from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";
import { RootRoute } from "../../../__root";
import { uniqBy } from "lodash";

export const ObjectiveRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "objectives",
    component: Component,
    validateSearch: GoalValidator,
});

function Component() {
    const search = ObjectiveRoute.useSearch();
    const { categories, strategicObjectives, allOptionsMap } =
        RootRoute.useLoaderData();
    const navigate = ObjectiveRoute.useNavigate();

    const [objectives, setObjectives] = React.useState<any[]>([]);

    const { keyResultArea, objective, ou, pe, category, categoryOptions } =
        search;

    useEffect(() => {
        let isMounted = true;
        console.log("Loading Strategic Objectives", search);
        async function loadObjectives() {
            const result = await queryDataElements({
                ...search,
                attributeValue: "strategicObjective",
                ndpVersion: search.v,
            });
            if (isMounted) setObjectives(result);
        }
        loadObjectives();
        return () => {
            isMounted = false;
        };
    }, [search.objective]);

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
        <Flex vertical gap={10} style={{ padding: 10 }}>
            <Filter
                data={{ objective, ou, pe, keyResultArea }}
                onChange={(val, next) => {
                    if (next) {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...val,
                                [next]: "All",
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
                        options: strategicObjectives.map((obj) => ({
                            value: obj.code,
                            label: obj.name,
                        })),
                        label: "Strategic Objective",
                        defaultValue: "All",
                    },
                    {
                        key: "keyResultArea",
                        options: uniqBy(
                            objectives.map(({ JmZO4hoIlfT }) => ({
                                value: JmZO4hoIlfT,
                                label:
                                    allOptionsMap.get(JmZO4hoIlfT) ||
                                    JmZO4hoIlfT,
                            })),
                            "value",
                        ),
                        label: "Key Result Area",
                        defaultValue: "All",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
