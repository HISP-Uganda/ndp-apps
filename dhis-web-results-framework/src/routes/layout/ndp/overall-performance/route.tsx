import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import { createRoute, Outlet } from "@tanstack/react-router";
import { Flex, Form, Select } from "antd";
import React from "react";
import { dataElementGroupSetsWithProgramsQueryOptions } from "../../../../query-options";
import { PerformanceSchema } from "../../../../types";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";

export const OverallPerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "overall-performance",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),

    loader: async ({ context, deps: { v } }) => {
        const { engine, queryClient } = context;
        const outcome = await queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                "objective",
                v,
            ),
        );
        const output = await queryClient.ensureQueryData(
            dataElementGroupSetsWithProgramsQueryOptions(
                engine,
                v === "NDPIII" ? "sub-intervention" : "intervention",
                v,
            ),
        );
        return { outcome, output };
    },
    validateSearch: PerformanceSchema,
});

function Component() {
    const { configurations } = RootRoute.useLoaderData();
    const navigate = OverallPerformanceRoute.useNavigate();
    const { v, pe } = OverallPerformanceRoute.useSearch();
    const config = configurations[v ?? ""]["data"];

    const periods = config["financialYears"].map((year: string) =>
        createFixedPeriodFromPeriodId({
            calendar: "gregory",
            periodId: year,
        }),
    );
    return (
        <Flex vertical style={{ padding: 10 }}>
            <Form.Item label="Select Period">
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
                    allowClear
                    showSearch
                />
            </Form.Item>
            <Outlet />
        </Flex>
    );
}
