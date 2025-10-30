import { createRoute, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { Flex, Form, Select } from "antd";
import { NDPRoute } from "../route";
import { PerformanceSchema } from "../../../../types";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { RootRoute } from "../../../__root";
import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import PerformanceLegend from "../../../../components/performance-legend";
import { performanceLegendItems } from "../../../../utils";

export const BudgetPerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "budget-performance",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const data = queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                v === "NDPIII"
                    ? "sub-intervention4action"
                    : "intervention4actions",
                v,
            ),
        );
        return data;
    },
    validateSearch: PerformanceSchema,
});

function Component() {
    const { configurations, categories } = RootRoute.useLoaderData();
    const navigate = BudgetPerformanceRoute.useNavigate();
    const { v, pe, category, categoryOptions } =
        BudgetPerformanceRoute.useSearch();
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
            style={{
                padding: 10,
                height: "100%",
                flex: 1,
            }}
            gap={10}
        >
            <Form.Item label="Select Period" style={{ padding: 0, margin: 0 }}>
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
            <PerformanceLegend legendItems={performanceLegendItems} />
            <Flex style={{ flex: 1, overflow: "auto", height: "100%" }}>
                <Outlet />
            </Flex>
        </Flex>
    );
}
