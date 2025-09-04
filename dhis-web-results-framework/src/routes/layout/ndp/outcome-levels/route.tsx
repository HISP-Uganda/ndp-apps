import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex } from "antd";
import Filter from "../../../../components/Filter";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { GoalValidator } from "../../../../types";
import { NDPRoute } from "../route";

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

    // useEffect(() => {
    //     if (degs === undefined) {
    //         navigate({
    //             search: (prev) => ({
    //                 ...prev,
    //                 program: data.options?.[0]?.code ?? "",
    //                 quarters: v === "NDPIII" ? false : true,
    //             }),
    //         });
    //     }
    // }, [v]);
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
                        label: "Programme",
                    },
                ]}
            />
            <Outlet />
        </Flex>
    );
}
