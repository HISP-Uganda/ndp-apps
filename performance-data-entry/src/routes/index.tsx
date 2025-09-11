import { createRoute, useLoaderData } from "@tanstack/react-router";
import { Flex, Form, Input, Select, Splitter, Tree } from "antd";
import React from "react";

import DataEntryTable from "../components/DataEntryTable";
import PeriodPicker from "../components/period-picker";
import { PeriodType, search } from "../types";
import { RootRoute } from "./__root";

export const IndexRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/",
    component: IndexRouteComponent,
    validateSearch: search,
});

const getPeriodType = (
    dataSet: { id: string; name: string; periodType: string } | undefined,
) => {
    if (dataSet && dataSet.periodType === "FinancialJuly") {
        return "FYJUL";
    } else if (dataSet && dataSet.periodType) {
        return dataSet.periodType.toUpperCase() as PeriodType;
    }
    return undefined;
};

function IndexRouteComponent() {
    const { organisationTree, orgUnitDataSets } = useLoaderData({
        from: "__root__",
    });
    const { orgUnit = "", dataSet, pe, expanded = "" } = IndexRoute.useSearch();
    const dataSets = orgUnit ? orgUnitDataSets[orgUnit] || [] : [];
    const currentDataSet = dataSets.find((ds) => ds.id === dataSet);
    const navigate = RootRoute.useNavigate();

    const handleSelect = (selectedKeys: React.Key[]) => {
        const selectedKey = selectedKeys[0];
        if (selectedKey) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    orgUnit: selectedKey.toString(),
                    dataSet: undefined,
                    pe: undefined,
                }),
            });
        }
    };
    return (
        <Splitter
            style={{
                height: "calc(100vh - 48px)",
            }}
        >
            <Splitter.Panel defaultSize="20%" min="10%" max="30%">
                <Tree
                    treeData={organisationTree}
                    showLine
                    onSelect={handleSelect}
										selectedKeys={orgUnit ? [orgUnit] : []}
                    expandedKeys={expanded ? expanded.split("-") : []}
                    onExpand={(keys) => {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                expanded: keys.join("-"),
                            }),
                        });
                    }}
                />
            </Splitter.Panel>
            <Splitter.Panel style={{ padding: 10 }}>
                <Flex gap={10}>
                    <Flex
                        vertical
                        style={{
                            width: "50%",
                            maxWidth: "50%",
                            backgroundColor: "#d0eBd0",
                            padding: 10,
                            border: "1px solid #a4d2a3",
                            borderRadius: "3px",
                        }}
                    >
                        <Form.Item
                            label="Organisation Unit"
                            layout="horizontal"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            labelAlign="left"
                            required
                            style={{ margin: 0, padding: 5 }}
														
                        >
                            <Input value={dataSets[0]?.orgUnit} disabled/>
                        </Form.Item>

                        <Form.Item
                            label="Data Set"
                            layout="horizontal"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            labelAlign="left"
                            required
                            style={{ margin: 0, padding: 5 }}
                        >
                            <Select
                                options={dataSets}
                                fieldNames={{ label: "name", value: "id" }}
                                value={dataSet}
                                allowClear
                                onChange={(val) =>
                                    navigate({
                                        search: (prev) => ({
                                            ...prev,
                                            dataSet: val,
                                            pe: undefined,
                                        }),
                                    })
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="Period"
                            layout="horizontal"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            labelAlign="left"
                            required
                            style={{ margin: 0, padding: 5 }}
                        >
                            <PeriodPicker
                                periodType={getPeriodType(currentDataSet)}
                                onChange={(val) =>
                                    navigate({
                                        search: (prev) => ({
                                            ...prev,
                                            pe: val,
                                        }),
                                    })
                                }
                                startingYear={new Date().getFullYear()}
                                period={pe}
                            />
                        </Form.Item>
                    </Flex>
                </Flex>
                <DataEntryTable />
            </Splitter.Panel>
        </Splitter>
    );
}
