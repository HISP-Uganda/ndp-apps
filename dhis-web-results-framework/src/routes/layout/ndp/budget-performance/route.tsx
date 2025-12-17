import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import { createRoute, Outlet } from "@tanstack/react-router";
import { Flex, Form, Select } from "antd";
import React, { useEffect } from "react";
import PerformanceLegend from "../../../../components/performance-legend";
import { PerformanceSchema } from "../../../../types";
import { performanceLegendItems } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";

export const BudgetPerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "budget-performance",
    component: Component,
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
