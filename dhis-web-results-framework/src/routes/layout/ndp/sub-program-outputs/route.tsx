import { createRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import React, { useEffect } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex } from "antd";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";

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
                v === "NDPIII" ? "sub-intervention" : "intervention",
                v,
            ),
        );
        return data;
    },
    validateSearch: GoalValidator,
});

function Component() {
    const { engine } = SubProgramOutputRoute.useRouteContext();
    const { v, deg, degs, ou, pe, program, category, categoryOptions } =
        SubProgramOutputRoute.useSearch();
    const { categories } = useLoaderData({ from: "__root__" });
    const { data } = useSuspenseQuery(
        dataElementGroupSetsWithProgramsQueryOptions(
            engine,
            v === "NDPIII" ? "sub-intervention" : "intervention",
            v,
        ),
    );
    const navigate = SubProgramOutputRoute.useNavigate();

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

    const [objectives, setObjectives] = React.useState(
        data.dataElementGroupSets,
    );

    useEffect(() => {
        const selectedObjective = data.dataElementGroupSets.filter((degSet) =>
            degSet.attributeValues.some(
                (av) =>
                    av.attribute.id === "UBWSASWdyfi" && av.value === program,
            ),
        );
        setObjectives(() => selectedObjective);
    }, [program]);

    return (
        <Flex vertical gap={10} style={{ padding: 10, height: "100%" }}>
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
                        label: "NDP Programme",
                    },
                    {
                        key: "degs",
                        options: objectives.map(({ name, id }) => ({
                            value: id,
                            label: name,
                        })),
                        label: "Program Intervention",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
