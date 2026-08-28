import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";
import {
    MinusSquareOutlined,
    PlusSquareOutlined,
} from "@ant-design/icons";
import { createRoute, Outlet } from "@tanstack/react-router";
import { Card, Collapse, Flex, Form, Select, Typography } from "antd";
import React, { useEffect } from "react";
import PerformanceLegend from "../../../../components/performance-legend";
import { VoteSchema } from "../../../../types";
import { performanceLegendItems } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { NDPRoute } from "../route";

export const VoteOutputPerformanceRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "vote-output-performance",
    component: Component,

    validateSearch: VoteSchema,
});

function Component() {
    const { configurations, votes, categories } = RootRoute.useLoaderData();
    const navigate = VoteOutputPerformanceRoute.useNavigate();
    const { v, ou, pe, categoryOptions, category } =
        VoteOutputPerformanceRoute.useSearch();
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
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
            style={{ padding: 10, height: "100%", flex: 1 }}
            gap={10}
        >
            <Card
                size="small"
                style={{
                    width: "50%",
                    maxWidth: "50%",
                    backgroundColor: "#BBD1EE",
                    borderColor: "#729fcf",
                    borderRadius: "3px",
                }}
                styles={{ body: { padding: "12px" } }}
            >
                <Collapse
                    bordered={false}
                    activeKey={isFiltersOpen ? ["filters"] : []}
                    onChange={(keys) =>
                        setIsFiltersOpen(
                            Array.isArray(keys)
                                ? keys.includes("filters")
                                : keys === "filters",
                        )
                    }
                    expandIcon={({ isActive }) =>
                        isActive ? (
                            <MinusSquareOutlined style={{ fontSize: "20px" }} />
                        ) : (
                            <PlusSquareOutlined style={{ fontSize: "20px" }} />
                        )
                    }
                    expandIconPosition="end"
                    items={[
                        {
                            key: "filters",
                            label: (
                                <Typography.Text strong style={{ fontSize: "14px" }}>
                                    Advanced report filters
                                </Typography.Text>
                            ),
                            children: (
                                <>
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
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
            <Typography.Title level={4} style={{ margin: 0 }}>
                {votes.find((vote) => vote.id === ou)?.name} Output Performance
            </Typography.Title>
            <PerformanceLegend legendItems={performanceLegendItems} />
            <Outlet />
        </Flex>
    );
}
