import { createRoute, Outlet } from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex, Select, Splitter, Tree, TreeDataNode } from "antd";
import { initialQueryOptions } from "../query-options";
import { RootRoute } from "./__root";
import { NDPValidator } from "../types";

const treeData: TreeDataNode[] = [
    {
        title: "NDP Results",
        key: "0",
        selectable: false,
        checkable: false,
        children: [
            {
                title: "High Level Results",
                selectable: false,
                key: "0-0",
                children: [
                    {
                        title: "Vision 20240 Targets",
                        key: "vision2040",
                    },
                    {
                        title: "Goal",
                        key: "goal",
                    },
                    {
                        title: "Objective",
                        key: "resultsFrameworkObjective",
                    },
                    {
                        title: "Outcome Level",
                        key: "objective",
                    },
                ],
            },
            {
                title: "Sub-Programme Results",
                key: "0-1",
                selectable: false,
                children: [
                    {
                        title: "Intermediate Outcomes",
                        key: "sub-programme",
                    },
                    {
                        title: "Output Level",
                        key: "output",
                    },
                    {
                        title: "Action Level",
                        key: "sub-intervention4action",
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
        children: [
            {
                title: "Project Performance",
                key: "project-performance",
            },
            {
                title: "Policy Actions",
                key: "policy-actions",
            },
        ],
    },
    {
        title: "Data Governance",
        key: "2",
        selectable: false,
        checkable: false,
        children: [
            {
                title: "Indicator Dictionary",
                key: "2-0",
            },
            {
                title: "Workflow & Guidelines",
                key: "2-1",
            },
            {
                title: "FAQs",
                key: "2-2",
            },
        ],
    },
    {
        title: "Library",
        key: "3",
    },
];

export const PathlessLayoutRoute = createRoute({
    getParentRoute: () => RootRoute,
    id: "pathlessLayout",
    component: PathlessLayoutComponent,
    validateSearch: NDPValidator,
});

function PathlessLayoutComponent() {
    const { engine } = PathlessLayoutRoute.useRouteContext();
    const navigate = PathlessLayoutRoute.useNavigate();
    const { v } = PathlessLayoutRoute.useSearch();
    const {
        data: { ndpVersions },
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
    return (
        <Splitter
            style={{
                height: "calc(100vh - 48px)",
            }}
        >
            <Splitter.Panel
                defaultSize="15%"
                min="15%"
                max="30%"
                style={{ padding: "10px" }}
            >
                <Flex vertical gap={20}>
                    <Select
                        options={ndpVersions.map(({ name, code }) => ({
                            label: name,
                            value: code,
                        }))}
                        style={{ width: "100%" }}
                        onChange={(value) => {
                            navigate({
                                search: (prev) => ({ ...prev, v: value }),
                            });
                        }}
                        value={v}
                    />
                    <Tree
                        showLine
                        defaultExpandAll
                        treeData={treeData}
                        multiple={false}
                    />
                </Flex>
            </Splitter.Panel>
            <Splitter.Panel>
                <Outlet />
            </Splitter.Panel>
        </Splitter>
    );
}
