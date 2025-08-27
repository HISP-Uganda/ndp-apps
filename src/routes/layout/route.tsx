import {
    createRoute,
    Link,
    Navigate,
    Outlet,
    useLoaderData,
    useLocation,
} from "@tanstack/react-router";
import React from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Flex, Select, SelectProps, Splitter, Tree, TreeDataNode } from "antd";

import { SettingOutlined } from "@ant-design/icons";
import { initialQueryOptions } from "../../query-options";
import { NDPValidator } from "../../types";
import { RootRoute } from "../__root";
import { isEmpty } from "lodash";

export const LayoutRoute = createRoute({
    getParentRoute: () => RootRoute,
    id: "layout",
    component: Component,
    validateSearch: NDPValidator,
});

function Component() {
    const { engine } = LayoutRoute.useRouteContext();
    const location = useLocation();
    const navigate = LayoutRoute.useNavigate();
    const { v } = LayoutRoute.useSearch();

    const { configurations } = useLoaderData({ from: "__root__" });
    if (
        isEmpty(configurations[v]) ||
        isEmpty(configurations[v].data) ||
        isEmpty(configurations[v].data.baseline) ||
        isEmpty(configurations[v].data.financialYears)
    ) {
        return <Navigate to="/settings" />;
    }

    const voteLevelLabel =
        v === "NDPIII" ? "Sub-Programme Results" : "Vote Level Results";

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

    const treeData: TreeDataNode[] = [
        {
            title: "NDP RESULTS",
            key: "0",
            selectable: false,
            checkable: false,
            children: [
                {
                    title: "High Level Results",
                    selectable: false,
                    checkable: false,
                    style: { fontSize: "20px" },
                    key: "0-0",
                    children: [
                        {
                            title: (
                                <Link
                                    to="/ndp/visions"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: undefined,
                                    })}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Vision 2040
                                </Link>
                            ),
                            key: "/ndp/visions",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/goals"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        degs: "All",
                                        deg: "All",
                                        program: undefined,
                                        pe: undefined,
                                    })}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Goal
                                </Link>
                            ),
                            key: "/ndp/goals",
                            // to: "/ndp/goals",
                            //
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/objectives"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        degs: "All",
                                        deg: "All",
                                        program: undefined,
                                        pe: undefined,
                                    })}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Objective
                                </Link>
                            ),
                            key: "/ndp/objectives",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/outcome-levels"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Outcome Level
                                </Link>
                            ),
                            key: "/ndp/outcome-levels",
                        },
                    ],
                },
                {
                    title: voteLevelLabel,
                    key: "0-1",
                    selectable: false,
                    checkable: false,
                    style: { fontSize: "20px" },

                    children: [
                        {
                            title: (
                                <Link
                                    to="/ndp/sub-program-outcomes"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Intermediate Outcomes
                                </Link>
                            ),
                            key: "/ndp/sub-program-outcomes",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/sub-program-outputs"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Output Level
                                </Link>
                            ),
                            key: "/ndp/sub-program-outputs",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/sub-program-actions"
                                    search={(prev) => ({
                                        ...prev,
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    style={{
                                        color: "#2B6998",
                                        fontSize: "20px",
                                    }}
                                >
                                    Action Level
                                </Link>
                            ),
                            key: "/ndp/sub-program-actions",
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
            style: { fontSize: "20px", margin: "20px 0 20px 0" },
            children: [
                {
                    title: (
                        <Link
                            to="/ndp/project-performances"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: "All",
                                deg: "All",
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            style={{
                                color: "#2B6998",
                                fontSize: "20px",
                            }}
                        >
                            Project Performance
                        </Link>
                    ),
                    key: "/ndp/project-performances",
                    // to: "/ndp/project-performances",
                },
                {
                    title: (
                        <Link
                            to="/ndp/policy-actions"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: "All",
                                deg: "All",
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            style={{
                                color: "#2B6998",
                                fontSize: "20px",
                            }}
                        >
                            Policy Actions
                        </Link>
                    ),
                    key: "/ndp/policy-actions",
                    // to: "/ndp/policy-actions",
                },
            ],
        },
        {
            title: "Data Governance",
            key: "2",
            selectable: false,
            checkable: false,
            style: { fontSize: "20px", margin: "20px 0 20px 0" },

            children: [
                {
                    title: (
                        <Link
                            to="/ndp/indicator-dictionaries"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: "All",
                                deg: "All",
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            style={{
                                color: "#2B6998",
                                fontSize: "20px",
                            }}
                        >
                            Indicator Dictionary
                        </Link>
                    ),
                    key: "/ndp/indicator-dictionaries",
                    // to: "/ndp/indicator-dictionaries",
                },
                {
                    title: (
                        <Link
                            to="/ndp/workflows"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: "All",
                                deg: "All",
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            style={{
                                color: "#2B6998",
                                fontSize: "20px",
                            }}
                        >
                            Workflow & Guidelines
                        </Link>
                    ),
                    key: "/ndp/workflows",
                    // to: "/ndp/workflows",
                },
                {
                    title: (
                        <Link
                            to="/ndp/faqs"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: "All",
                                deg: "All",
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            style={{
                                color: "#2B6998",
                                fontSize: "20px",
                            }}
                        >
                            FAQs
                        </Link>
                    ),
                    key: "/ndp/faqs",
                    // to: "/ndp/faqs",
                },
            ],
        },
        {
            title: (
                <Link
                    to="/ndp/libraries"
                    search={(prev) => ({
                        ...prev,
                        ou,
                        v,
                        degs: "All",
                        deg: "All",
                    })}
                    activeProps={{
                        style: {
                            color: "white",
                        },
                    }}
                    style={{
                        color: "#2B6998",
                        fontSize: "20px",
                    }}
                >
                    Library
                </Link>
            ),
            key: "/ndp/libraries",
            // to: "/ndp/libraries",
            style: { fontSize: "20px" },
        },
    ];

    // const onSelect: TreeProps<TreeDataNode>["onSelect"] = (
    //     selectedKeys,
    //     { node },
    // ) => {
    //     if (selectedKeys.length > 0 && node.to) {
    //         navigate({
    //             to: node.to as Parameters<typeof navigate>[0]["to"],
    //             search: (prev) => {
    //                 return {
    //                     ...prev,
    //                     v,
    //                     ou,
    //                     degs: undefined,
    //                     deg: undefined,
    //                     program: undefined,
    //                     pe: undefined,
    //                 };
    //             },
    //         });
    //     }
    // };
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
                    <Flex gap={12} align="center">
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
                                        pe: undefined,
                                    }),
                                });
                            }}
                            value={v}
                        />
                        <Link to="/settings">
                            <SettingOutlined
                                style={{ fontSize: "20px", cursor: "pointer" }}
                            />
                        </Link>
                    </Flex>

                    <Tree
                        showLine
                        defaultExpandAll
                        treeData={treeData}
                        multiple={false}
                        // onSelect={onSelect}
                        selectedKeys={[location.pathname]}
                    />
                </Flex>
            </Splitter.Panel>
            <Splitter.Panel>
                <Outlet />
            </Splitter.Panel>
        </Splitter>
    );
}
