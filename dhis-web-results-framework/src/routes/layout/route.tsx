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
import {
    ConfigProvider,
    Flex,
    Select,
    SelectProps,
    Splitter,
    Tree,
    TreeDataNode,
} from "antd";

import { SettingOutlined } from "@ant-design/icons";
import { initialQueryOptions } from "../../query-options";
import { NDPValidator } from "../../types";
import { RootRoute } from "../__root";
import { isEmpty } from "lodash";
import { getDefaultPeriods } from "../../utils";

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

    const { lastFinancialYear, validPeriods, currentFinancialYear } =
        getDefaultPeriods(configurations[v].data.financialYears);

    const pe = [configurations[v].data.baseline, ...validPeriods];

    const visionPeriods = [
        configurations[v].data.baseline,
        lastFinancialYear,
        "2039July",
    ];
    const voteLevelLabel =
        v === "NDPIII" ? "Sub-Programme Results" : "Vote Level Performance";

    const {
        data: { ndpVersions, ou, votes },
    } = useSuspenseQuery(
        initialQueryOptions(engine, "uV4fZlNvUsw", "nZffnMQwoWr"),
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

                    key: "0-0",
                    children: [
                        {
                            title: (
                                <Link
                                    to="/ndp/visions"
                                    search={() => ({
                                        ou,
                                        v,
                                        program: undefined,
                                        degs: undefined,
                                        deg: undefined,
                                        pe: visionPeriods,
                                        requiresProgram: false,
                                        quarters: false,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
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
                                        whiteSpace: "nowrap",
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
                                        degs: undefined,
                                        deg: undefined,
                                        program: undefined,
                                        pe,
                                        requiresProgram: false,
                                        quarters: false,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
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
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Overall Goal
                                </Link>
                            ),
                            key: "/ndp/goals",
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
                                        deg: undefined,
                                        program: undefined,
                                        pe,
                                        requiresProgram: false,
                                        quarters: false,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
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

                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Strategic Objective
                                </Link>
                            ),
                            key: "/ndp/objectives",
                        },
                    ],
                },
                {
                    title: "Program Level Results",
                    selectable: false,
                    checkable: false,

                    key: "programme-level-results",
                    children: [
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
                                        pe,
                                        quarters: v === "NDPIV",
                                        requiresProgram: true,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",

                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Program Outcomes
                                </Link>
                            ),
                            key: "/ndp/outcome-levels",
                        },
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
                                        pe,
                                        quarters: v === "NDPIV",
                                        requiresProgram: true,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",

                                        whiteSpace: "nowrap",
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
                                        pe,
                                        quarters: v === "NDPIV",
                                        requiresProgram: true,
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        nonBaseline: undefined,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",
                                    }}
                                >
                                    Program Outputs
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
                                        pe,
                                        quarters: v === "NDPIV",
                                        requiresProgram: true,
                                        category: "kfnptfEdnYl",
                                        categoryOptions: undefined,
                                        nonBaseline: true,
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",
                                    }}
                                >
                                    Program Actions
                                </Link>
                            ),
                            key: "/ndp/sub-program-actions",
                        },
                    ],
                },
                {
                    title: voteLevelLabel,
                    key: "vote-level-results",
                    selectable: false,
                    checkable: false,

                    children: [
                        {
                            title: (
                                <Link
                                    to="/ndp/vote-program-performance"
                                    search={() => ({
                                        ou: votes[0].id,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",
                                    }}
                                >
                                    Programme Performance
                                </Link>
                            ),
                            key: "/ndp/vote-program-performance",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/vote-outcome-performance"
                                    search={() => ({
                                        ou: votes[0].id,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",
                                    }}
                                >
                                    Outcome Performance
                                </Link>
                            ),
                            key: "/ndp/vote-outcome-performance",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/vote-output-performance"
                                    search={(prev) => ({
                                        ou: votes[0].id,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                    })}
                                    activeProps={{
                                        style: {
                                            color: "white",
                                        },
                                    }}
                                    activeOptions={{
                                        exact: true,
                                        includeHash: false,
                                        includeSearch: false,
                                    }}
                                    style={{
                                        color: "#2B6998",
                                    }}
                                >
                                    Output Performance
                                </Link>
                            ),
                            key: "/ndp/vote-output-performance",
                        },
                    ],
                },
                {
                    title: "Performance Scorecards",
                    key: "scorecard",
                    selectable: false,
                    checkable: false,
                    children: [
                        {
                            title: (
                                <Link
                                    to="/ndp/overall-performance"
                                    search={() => ({
                                        ou,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
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

                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Overall Performance Scorecard
                                </Link>
                            ),
                            key: "/ndp/overall-performance",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/outcome-performance"
                                    search={() => ({
                                        ou,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        isSum: undefined,
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

                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Outcome Performance Scorecard
                                </Link>
                            ),
                            key: "/ndp/outcome-performance",
                        },
                        {
                            title: (
                                <Link
                                    to="/ndp/output-performance"
                                    search={() => ({
                                        ou,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                        category: "Duw5yep8Vae",
                                        categoryOptions: undefined,
                                        isSum: undefined,
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
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Output Performance Scorecard
                                </Link>
                            ),
                            key: "/ndp/output-performance",
                        },

                        {
                            title: (
                                <Link
                                    to="/ndp/budget-performance"
                                    search={() => ({
                                        ou,
                                        v,
                                        pe: currentFinancialYear,
                                        quarters: v === "NDPIV",
                                        category: "kfnptfEdnYl",
                                        categoryOptions: undefined,
                                        isSum: true,
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
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Budget Performance Scorecard
                                </Link>
                            ),
                            key: "/ndp/budget-performance",
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
                            activeOptions={{
                                exact: true,
                                includeHash: false,
                                includeSearch: false,
                            }}
                            style={{
                                color: "#2B6998",

                                whiteSpace: "nowrap",
                            }}
                        >
                            Project Performance
                        </Link>
                    ),
                    key: "/ndp/project-performances",
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
                            activeOptions={{
                                exact: true,
                                includeHash: false,
                                includeSearch: false,
                            }}
                            style={{
                                color: "#2B6998",
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
            children: [
                {
                    title: (
                        <Link
                            to="/ndp/indicator-dictionaries"
                            search={(prev) => ({
                                ...prev,
                                ou,
                                v,
                                degs: undefined,
                                deg: undefined,
                                program: undefined,
                                pe: undefined,
                                requiresProgram: undefined,
                                quarters: undefined,
                                category: undefined,
                                categoryOptions: undefined,
                                nonBaseline: undefined,
                            })}
                            activeProps={{
                                style: {
                                    color: "white",
                                },
                            }}
                            activeOptions={{
                                exact: true,
                                includeHash: false,
                                includeSearch: false,
                            }}
                            style={{
                                color: "#2B6998",
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
                            activeOptions={{
                                exact: true,
                                includeHash: false,
                                includeSearch: false,
                            }}
                            style={{
                                color: "#2B6998",
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
                            activeOptions={{
                                exact: true,
                                includeHash: false,
                                includeSearch: false,
                            }}
                            style={{
                                color: "#2B6998",
                            }}
                        >
                            FAQs
                        </Link>
                    ),
                    key: "/ndp/faqs",
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
                    activeOptions={{
                        exact: true,
                        includeHash: false,
                        includeSearch: false,
                    }}
                    style={{
                        color: "#2B6998",
                    }}
                >
                    Library
                </Link>
            ),
            key: "/ndp/libraries",
        },
    ];
    return (
        <Splitter
            style={{
                height: "calc(100vh - 48px)",
            }}
        >
            <Splitter.Panel
                defaultSize="20%"
                max="20%"
                min="20%"
                style={{ padding: "10px", backgroundColor: "#F3F3F3" }}
            >
                <Flex vertical gap={20}>
                    <Flex gap={12} align="center">
                        <ConfigProvider
                            theme={{
                                components: {
                                    Select: {
                                        optionFontSize: 17,
                                        optionSelectedColor: "#FF0000",
                                        colorText: "#FF0000",
                                    },
                                },
                            }}
                        >
                            <Select
                                options={ndpVersions.flatMap(
                                    ({ name, code }) => {
                                        const options: SelectProps["options"] =
                                            [
                                                {
                                                    label: name,
                                                    value: code,
                                                },
                                            ];
                                        return options;
                                    },
                                )}
                                style={{ width: "100%" }}
                                size="large"
                                onChange={(value) => {
                                    navigate({
                                        to: "/ndp",
                                        search: () => ({
                                            v: value,
                                        }),
                                    });
                                }}
                                value={v}
                            />
                        </ConfigProvider>

                        <Link to="/settings">
                            <SettingOutlined style={{ cursor: "pointer" }} />
                        </Link>
                    </Flex>

                    {/* <Flex style={{backgroundColor:"yellow"}}> */}
                    <Tree
                        showLine
                        defaultExpandAll
                        treeData={treeData}
                        multiple={false}
                        selectedKeys={[location.pathname]}
                        style={{ padding: 20, fontSize: 16 }}
                    />
                    {/* </Flex> */}
                </Flex>
            </Splitter.Panel>
            <Splitter.Panel>
                <Outlet />
            </Splitter.Panel>
        </Splitter>
    );
}
