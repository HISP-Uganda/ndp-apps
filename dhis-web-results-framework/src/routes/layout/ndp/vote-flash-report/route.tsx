import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import { createRoute, Outlet } from "@tanstack/react-router";
import { Flex, Form, Select, Typography } from "antd";
import React from "react";
import PerformanceLegend from "../../../../components/performance-legend";
import { VoteSchema } from "../../../../types";
import { performanceLegendItems } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";

export const VoteFlashReportRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "vote-flash-report",
    component: Component,
    loaderDeps: ({ search }) => ({
        v: search.v,
    }),
    validateSearch: VoteSchema,
});

function Component() {
    const { configurations } = RootRoute.useLoaderData();
    const navigate = VoteFlashReportRoute.useNavigate();
    const { v, ou, pe } = VoteFlashReportRoute.useSearch();
    const config = configurations[v ?? ""]["data"];

    const { votes } = RootRoute.useLoaderData();

    const periods = config["financialYears"].map((year: string) =>
        createFixedPeriodFromPeriodId({
            calendar: "gregory",
            periodId: year,
        }),
    );
    return (
        <Flex
            vertical
            style={{ padding: 10, height: "100%", flex: 1 }}
            gap={10}
        >
            <Flex
                vertical
                style={{
                    width: "50%",
                    maxWidth: "50%",
                    backgroundColor: "#BBD1EE",
                    padding: 10,
                    border: "1px solid #729fcf",
                    borderRadius: "3px",
                }}
            >
                <Form.Item
                    label="Vote"
                    layout="horizontal"
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    labelAlign="left"
                    style={{ margin: 0, padding: 5 }}
                >
                    <Select
                        options={votes.map(({ name, id }) => ({
                            label: name,
                            value: id,
                        }))}
                        style={{ width: 400 }}
                        value={ou}
                        onChange={(value) =>
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    ou: value,
                                }),
                            })
                        }
                        filterOption={(input, option) =>
                            String(option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        showSearch
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    label="Period"
                    layout="horizontal"
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 22 }}
                    labelAlign="left"
                    style={{ margin: 0, padding: 5 }}
                >
                    <Select
                        options={periods.map(({ name, id }) => ({
                            label: name,
                            value: id,
                        }))}
                        style={{ width: 400 }}
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
            <Typography.Title level={3} style={{ margin: 0 }}>
                Vote Flash Report
            </Typography.Title>
            <Typography.Title level={5} style={{ margin: 0 }}>
                {votes.find((vote) => vote.id === ou)?.name}
            </Typography.Title>
            <PerformanceLegend legendItems={performanceLegendItems} />
            <Outlet />
        </Flex>
    );
}
