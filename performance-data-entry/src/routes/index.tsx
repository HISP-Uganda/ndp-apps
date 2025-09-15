import { createRoute, useLoaderData } from "@tanstack/react-router";
import type { TreeDataNode } from "antd";
import { AutoComplete, Flex, Form, Input, Select, Splitter, Tree } from "antd";
import React, { useEffect, useMemo } from "react";
import DataEntryTable from "../components/DataEntryTable";
import PeriodPicker from "../components/period-picker";
import { IDataSet, PeriodType, search } from "../types";
import { getPathToNode } from "../utils";
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
    const { organisationTree, orgUnitDataSets, configuration } = useLoaderData({
        from: "__root__",
    });

    const { orgUnit, dataSet, pe, expanded, minPeriod, maxPeriod } =
        IndexRoute.useSearch();
    const dataSets = orgUnit ? orgUnitDataSets[orgUnit] || [] : [];
    const currentDataSet = dataSets.find((ds) => ds.id === dataSet);
    const navigate = RootRoute.useNavigate();

    const searchOptions = useMemo(() => {
        const allNodes: { value: string; label: string }[] = [];

        const collectAllNodes = (nodes: TreeDataNode[]) => {
            nodes.forEach((node) => {
                allNodes.push({
                    value: String(node.key),
                    label: String(node.title),
                });
                if (node.children) {
                    collectAllNodes(node.children);
                }
            });
        };

        collectAllNodes(organisationTree);
        return allNodes;
    }, [organisationTree]);

    const onSelectOrgUnit = (value: string) => {
        const pathToNode = getPathToNode(organisationTree, value);
        if (pathToNode) {
            navigate({
                search: (prev) => ({
                    ...prev,
                    expanded: pathToNode.slice(0, -1).join("-"), // Expand all parent nodes
                }),
            });
        }
        navigate({
            search: (prev) => ({
                ...prev,
                orgUnit: value,
                dataSet: undefined,
                pe: undefined,
            }),
        });
    };

    const [defaultPeriods, setDefaultPeriods] = React.useState<string[]>([]);

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

    useEffect(() => {
        if (organisationTree.length === 1 && organisationTree[0].isLeaf) {
            const orgUnit = organisationTree[0].key;
            navigate({
                search: (prev) => ({
                    ...prev,
                    orgUnit,
                    dataSet: undefined,
                    pe: undefined,
                }),
            });
        }
    }, [organisationTree]);

    const handleDataSetChange = (
        value: string,
        option: IDataSet | IDataSet[],
    ) => {
        const dataSet = Array.isArray(option) ? option[0] : option;
        const dataSetNames = dataSet.name.split(" - ");
        const conf = configuration.find(
            (b) => b.key === dataSetNames[1].replaceAll(" ", ""),
        );
        const baseline = conf?.baseline.split(" ").join("") ?? "2023July";

        setDefaultPeriods(conf?.financialYears || []);

        navigate({
            search: (prev) => ({
                ...prev,
                dataSet: value,
                baseline,
                pe: undefined,
                minPeriod: conf?.financialYears.at(0) ?? "2025July",
                maxPeriod: conf?.financialYears.at(-1) ?? "2029July",
            }),
        });
    };

    const onPeriodChange = (val: string | undefined) => {
        let targetYear: string | undefined = val;

        if (val?.includes("Q")) {
            const [year, quarter] = val.split("Q");
            const prev =
                quarter === "1" || quarter === "2"
                    ? String(Number(year) - 1)
                    : year;
            targetYear = `${prev}July`;
        }
        navigate({
            search: (prev) => ({
                ...prev,
                pe: val,
                targetYear,
            }),
        });
    };

    return (
        <Splitter
            style={{
                height: "calc(100vh - 48px)",
            }}
        >
            <Splitter.Panel defaultSize="20%" min="10%" max="30%">
                <Flex vertical gap={12} style={{ padding: 10 }}>
                    <AutoComplete
                        options={searchOptions}
                        placeholder="Search for organization unit..."
                        onSelect={onSelectOrgUnit}
                        allowClear
                        showSearch
                        filterOption={(inputValue, option) =>
                            option?.label
                                ?.toString()
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) ?? false
                        }
                        style={{ width: "100%" }}
                    />

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
                </Flex>
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
                            <Input value={dataSets[0]?.orgUnit} disabled />
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
                                showSearch
                                filterOption={(input, option) =>
                                    String(option?.name ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={handleDataSetChange}
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
                                onChange={onPeriodChange}
                                minPeriod={minPeriod}
                                period={pe}
                                maxPeriod={maxPeriod}
                                defaultPeriods={defaultPeriods}
                                dataSet={dataSet}
                            />
                        </Form.Item>
                    </Flex>
                </Flex>
                <DataEntryTable />
            </Splitter.Panel>
        </Splitter>
    );
}
