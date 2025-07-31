import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
    Flex,
    Select,
    SelectProps,
    Splitter,
    Tree,
    TreeDataNode,
    TreeProps,
} from "antd";
import { initialQueryOptions } from "../../query-options";
import { NDPValidator, To } from "../../types";
import { RootRoute } from "../__root";

interface NDPTree extends TreeDataNode {
    to?: To;
    children?: NDPTree[];
}

export const LayoutRoute = createRoute({
    getParentRoute: () => RootRoute,
    id: "layout",
    component: Component,
    validateSearch: NDPValidator,
});

function Component() {
    const { engine } = LayoutRoute.useRouteContext();
    const navigate = LayoutRoute.useNavigate();
    const { v } = LayoutRoute.useSearch();

    const voteLevelLabel =
        v === "NDPIII" ? "Sub-Programme Results" : "Vote Level Results";

    const treeData: NDPTree[] = [
        {
            title: "NDP RESULTS",
            key: "0",
            selectable: false,
            checkable: false,
            // disabled: true,
            style: { fontSize: "20px", margin: "20px 0 20px 0" },
            children: [
                {
                    title: "High Level Results",
                    selectable: false,
                    checkable: false,
                    // disabled: true,
                    style: { fontSize: "20px" },

                    key: "0-0",
                    children: [
                        {
                            title: "Vision 2040 Targets",
                            key: "vision2040",
                            to: "/ndp/visions",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                        {
                            title: "Goal",
                            key: "goal",
                            to: "/ndp/goals",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                        {
                            title: "Objective",
                            key: "resultsFrameworkObjective",
                            to: "/ndp/objectives",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                        {
                            title: "Outcome Level",
                            key: "objective",
                            to: "/ndp/outcome-levels",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                    ],
                },
                {
                    title: voteLevelLabel,
                    key: "0-1",
                    selectable: false,
                    checkable: false,
                    // disabled: true,
                    style: { fontSize: "20px" },

                    children: [
                        {
                            title: "Intermediate Outcomes",
                            key: "sub-programme",
                            to: "/ndp/sub-program-outcomes",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                        {
                            title: "Output Level",
                            key: "output",
                            to: "/ndp/sub-program-outputs",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                        {
                            title: "Action Level",
                            key: "sub-intervention4action",
                            to: "/ndp/sub-program-actions",
                            style: { color: "#2B6998", fontSize: "20px" },
                        },
                    ],
                },
            ],
        },
        {
            title: "Tracking",
            key: "1",
            selectable: false,
            checkable: false,
            // disabled: true,
            style: { fontSize: "20px", margin: "20px 0 20px 0" },

            children: [
                {
                    title: "Project Performance",
                    key: "project-performance",
                    to: "/ndp/sub-program-outcomes",
                    style: { color: "#2B6998", fontSize: "20px" },
                },
                {
                    title: "Policy Actions",
                    key: "policy-actions",
                    to: "/ndp/policy-actions",
                    style: { color: "#2B6998", fontSize: "20px" },
                },
            ],
        },
        {
            title: "Data Governance",
            key: "2",
            selectable: false,
            checkable: false,
            // disabled: true,
            style: { fontSize: "20px", margin: "20px 0 20px 0" },

            children: [
                {
                    title: "Indicator Dictionary",
                    key: "2-0",
                    to: "/ndp/indicator-dictionaries",
                    style: { color: "#2B6998", fontSize: "20px" },
                },
                {
                    title: "Workflow & Guidelines",
                    key: "2-1",
                    to: "/ndp/workflows",
                    style: { color: "#2B6998", fontSize: "20px" },
                },
                {
                    title: "FAQs",
                    key: "2-2",
                    to: "/ndp/faqs",
                    style: { color: "#2B6998", fontSize: "20px" },
                },
            ],
        },
        {
            title: "Library",
            key: "3",
            to: "/ndp/libraries",
            style: { fontSize: "20px" },
        },
    ];
    const {
        data: { ndpVersions, ou },
    } = useSuspenseQuery(
        initialQueryOptions(
            engine,
            [
                "vision2040",
                "goal",
                "resultsFrameworkObjective",
                "objective",
                "sub-programme",
                "sub-intervention4action",
                "sub-intervention",
            ],
            "uV4fZlNvUsw",
            "nZffnMQwoWr",
        ),
    );

    const onSelect: TreeProps<NDPTree>["onSelect"] = (
        selectedKeys,
        { node },
    ) => {
        if (selectedKeys.length > 0 && node.to) {
            navigate({
                to: node.to as Parameters<typeof navigate>[0]["to"],
                search: (prev) => {
                    return {
                        ...prev,
                        v,
                        ou,
                        degs: undefined,
                        deg: undefined,
                        program: undefined,
                    };
                },
            });
        }
    };
    return (
        <Splitter
            style={{
                height: "calc(100vh - 48px)",
            }}
        >
            <Splitter.Panel
                defaultSize="18%"
                min="18%"
                max="30%"
                style={{ padding: "10px", backgroundColor: "#F3F3F3" }}
            >
                <Flex vertical gap={20}>
                    <Select
                        options={ndpVersions.flatMap(({ name, code }) => {
                            const options: SelectProps["options"] = [
                                {
                                    label: name,
                                    value: code,
                                },
                            ];
                            return options;
                        })}
                        style={{ width: "100%" }}
                        onChange={(value) => {
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    v: value,
                                    ou,
                                    degs: undefined,
                                    deg: undefined,
                                    program: undefined,
                                }),
                            });
                        }}

                        value={v}
                    />
                    <Tree
                        showLine
                        defaultExpandAll
                        treeData={treeData}
                        multiple={false}
                        onSelect={onSelect}
                    />
                </Flex>
            </Splitter.Panel>
            <Splitter.Panel>
                <Outlet />
            </Splitter.Panel>
        </Splitter>
    );
}
