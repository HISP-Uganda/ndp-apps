import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { FaInfoCircle } from "react-icons/fa";
import { Flex, Modal, Table, Typography, type TableProps } from "antd";
import React from "react";
import Spinner from "../../../../components/Spinner";
import { voteProgramOutcomesQueryOptions } from "../../../../query-options";
import { PERFORMANCE_COLORS } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { VoteOutputPerformanceRoute } from "./route";
export const VoteOutputPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VoteOutputPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const [modal, contextHolder] = Modal.useModal();

    const { programs, votes } = RootRoute.useLoaderData();
    const { engine } = VoteOutputPerformanceRoute.useRouteContext();
    const { v, ou = "", pe, quarters } = VoteOutputPerformanceRoute.useSearch();
    const { data, isLoading, isError, error } = useSuspenseQuery(
        voteProgramOutcomesQueryOptions({
            engine,
            ndpVersion: v,
            ou,
            pe,
            quarters,
            searchKey: "aWsagpqErAq",
            searchValue: v === "NDPIII" ? "sub-intervention" : "intervention",
            programs,
            finalGrouping: "dataElementGroupId",
        }),
    );
    const columns: TableProps<(typeof data)[number]>["columns"] =
        React.useMemo(() => {
            return [
                {
                    title: `Code`,
                    dataIndex: "UBWSASWdyfi",
                    key: "UBWSASWdyfi",
                    width: "61px",
                    align: "center",
                },
                {
                    title: `Programme`,
                    dataIndex: "program",
                    key: "program",
                    render: (text: string, record) => {
                        return text.replace(/\d+/g, "").trim();
                    },
                },
                {
                    title: `Output Name`,
                    dataIndex: "dataElementGroupName",
                    key: "dataElementGroupName",

                    render: (text: string, record) => {
                        return (
                            <div>
                                {text}
                                &nbsp;
                                <FaInfoCircle
                                    style={{
                                        color: "#428BCA",
                                        fontSize: "22.4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        modal.info({
                                            title: "Indicator Dictionary",
                                            width: 600,
                                            centered: true,
                                            content: (
                                                <Table
                                                    columns={[
                                                        {
                                                            title: "Name",
                                                            dataIndex: "name",
                                                            key: "name",
                                                        },
                                                    ]}
                                                    dataSource={record.groups}
                                                    style={{
                                                        margin: 0,
                                                        padding: 0,
                                                    }}
                                                    pagination={false}
                                                    rowKey="code"
                                                    scroll={{ y: 700 }}
                                                    showHeader={false}
                                                    bordered
                                                />
                                            ),
                                        });
                                    }}
                                />
                                {contextHolder}
                            </div>
                        );
                    },
                },
                {
                    title: `No of Indicators`,
                    dataIndex: "total",
                    key: "total",
                    width: 140,
                    align: "center",
                    render: (_, record) => record.total ?? "",
                },
                {
                    title: `A`,
                    dataIndex: "achieved",
                    key: "achieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.green.bg,
                            color: PERFORMANCE_COLORS.green.fg,
                        },
                    }),
                },

                {
                    title: `M`,
                    dataIndex: "moderatelyAchieved",
                    key: "moderatelyAchieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.yellow.bg,
                            color: PERFORMANCE_COLORS.yellow.fg,
                        },
                    }),
                },
                {
                    title: `N`,
                    dataIndex: "notAchieved",
                    key: "notAchieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.red.bg,
                            color: PERFORMANCE_COLORS.red.fg,
                        },
                    }),
                },
                {
                    title: `ND`,
                    dataIndex: "noData",
                    key: "noData",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.gray.bg,
                            color: PERFORMANCE_COLORS.gray.fg,
                        },
                    }),
                },
                {
                    title: `% A`,
                    dataIndex: "percentAchieved",
                    key: "percentAchieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.green.bg,
                            color: PERFORMANCE_COLORS.green.fg,
                        },
                    }),
                },
                {
                    title: `% M`,
                    dataIndex: "percentModeratelyAchieved",
                    key: "percentModeratelyAchieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.yellow.bg,
                            color: PERFORMANCE_COLORS.yellow.fg,
                        },
                    }),
                },
                {
                    title: `% N`,
                    dataIndex: "percentNotAchieved",
                    key: "percentNotAchieved",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.red.bg,
                            color: PERFORMANCE_COLORS.red.fg,
                        },
                    }),
                },
                {
                    title: `% ND`,
                    dataIndex: "percentNoData",
                    key: "percentNoData",
                    width: 70,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.gray.bg,
                            color: PERFORMANCE_COLORS.gray.fg,
                        },
                    }),
                },
            ];
        }, []);
    if (isLoading) {
        return <Spinner message="Loading Output Performance data..." />;
    }

    if (isError) {
        return <div>{`Error: ${error}`}</div>;
    }

    return (
        <Table
            columns={columns}
            dataSource={data}
            scroll={{ y: "calc(100vh - 300px)", }}
            rowKey="dataElementId"
            bordered={true}
            sticky={true}
            pagination={false}
            size="small"
        />
    );
}
