import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Modal, Table, type TableProps } from "antd";
import { orderBy } from "lodash";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { voteProgramOutcomesQueryOptions } from "../../../../query-options";
import { PERFORMANCE_COLORS } from "../../../../utils";
import { RootRoute } from "../../../__root";
import { VoteProgramPerformanceRoute } from "./route";
export const VoteProgramPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VoteProgramPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const [modal, contextHolder] = Modal.useModal();

    const { programs } = RootRoute.useLoaderData();
    const { engine } = VoteProgramPerformanceRoute.useRouteContext();
    const {
        v,
        ou = "",
        pe,
        quarters,
    } = VoteProgramPerformanceRoute.useSearch();
    const { data } = useSuspenseQuery(
        voteProgramOutcomesQueryOptions({
            engine,
            ndpVersion: v,
            ou,
            pe,
            quarters,
            programs,
            finalGrouping: "UBWSASWdyfi",
        }),
    );
    const [processedData, setProcessedData] = React.useState(data);

    React.useEffect(() => {
        setProcessedData(data);
    }, [data]);

    const handleChange: TableProps<(typeof processedData)[number]>["onChange"] = (
        _pagination,
        _filters,
        sorter,
    ) => {
        if (!Array.isArray(sorter)) {
            const { field, order } = sorter;
            if (field && order) {
                setProcessedData((prev) => {
                    return orderBy(
                        prev,
                        [String(field)],
                        [order === "ascend" ? "asc" : "desc"],
                    );
                });
            } else {
                setProcessedData(() => data);
            }
        }
    };
    const columns: TableProps<(typeof processedData)[number]>["columns"] =
        React.useMemo(() => {
            return [
                {
                    title: `Code`,
                    dataIndex: "UBWSASWdyfi",
                    key: "UBWSASWdyfi",
                    width: 70,
                    align: "center",
                    sorter: true,
                },
                {
                    title: `Programme`,
                    dataIndex: "program",
                    key: "program",
                    render: (text: string, record) => {
                        return (
                            <div>
                                {text.replace(/\d+/g, "").trim()}
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
                    sorter: true,
                },
                {
                    title: `No of Indicators`,
                    dataIndex: "total",
                    key: "total",
                    width: 140,
                    align: "center",
                    render: (_, record) => record.total ?? "",
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
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
                    sorter: true,
                },
                {
                    title: `% ND`,
                    dataIndex: "percentNoData",
                    key: "percentNoData",
                    width: 73,
                    align: "center",
                    onHeaderCell: () => ({
                        style: {
                            backgroundColor: PERFORMANCE_COLORS.gray.bg,
                            color: PERFORMANCE_COLORS.gray.fg,
                        },
                    }),
                    sorter: true,
                },
            ];
        }, []);
    return (
        <Table
            columns={columns}
            dataSource={processedData}
            scroll={{ y: "calc(100vh - 300px)" }}
            rowKey="id"
            bordered={true}
            sticky={true}
            pagination={false}
            size="small"
            onChange={handleChange}
        />
    );
}
