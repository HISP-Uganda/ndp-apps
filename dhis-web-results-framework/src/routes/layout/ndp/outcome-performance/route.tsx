import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import { createRoute, Outlet } from "@tanstack/react-router";
import { Flex, Form, Select } from "antd";
import React, { useEffect } from "react";
import PerformanceLegend from "../../../../components/performance-legend";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { PerformanceSchema } from "../../../../types";
import { LIST_ITEM_STYLE, performanceLegendItems } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";

export const OutcomePerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "outcome-performance",
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
    validateSearch: PerformanceSchema,
});

function Component() {
    const { configurations, categories } = RootRoute.useLoaderData();
    const navigate = OutcomePerformanceRoute.useNavigate();
    const { v, pe, category, categoryOptions } =
        OutcomePerformanceRoute.useSearch();
    const config = configurations[v ?? ""]["data"];

    const periods = config["financialYears"].map((year: string) =>
        createFixedPeriodFromPeriodId({
            calendar: "gregory",
            periodId: year,
        }),
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
        <Flex
            vertical
            style={{ padding: 10, flex: 1, height: "100%" }}
            gap={10}
        >
            <Flex style={LIST_ITEM_STYLE}>
                <Form.Item
                    label="Select Period"
                    style={{ padding: 0, margin: 0 }}
                >
                    <Select
                        options={periods.map(({ name, id }) => ({
                            label: name,
                            value: id,
                        }))}
                        style={{ width: 300 }}
                        value={pe}
                        onChange={(value) =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    pe: value,
                                }),
                            })
                        }
                    />
                </Form.Item>
            </Flex>

            <PerformanceLegend legendItems={performanceLegendItems} />
            <Outlet />
        </Flex>
    );
}
