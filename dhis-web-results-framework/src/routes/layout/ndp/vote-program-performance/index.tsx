import { createRoute } from "@tanstack/react-router";
import { Modal, Table, type TableProps } from "antd";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import Performance from "../../../../components/performance";
import { useAnalyticsQuery } from "../../../../hooks/data-hooks";
import { AnalyticsData } from "../../../../types";
import { VoteProgramPerformanceRoute } from "./route";

export const VoteProgramPerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VoteProgramPerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const search = VoteProgramPerformanceIndexRoute.useSearch();
    const { engine } = VoteProgramPerformanceIndexRoute.useRouteContext();
    const { data } = useAnalyticsQuery({
        engine,
        search: {
            ...search,
            pe: [search.pe ?? ""],
        },
        ndpVersion: search.v,
        queryByOu: true,
    });
    const [modal, contextHolder] = Modal.useModal();
    const handleChange: TableProps<AnalyticsData>["onChange"] = (
        _pagination,
        _filters,
        sorter,
    ) => {
        if (!Array.isArray(sorter)) {
            const { field, order } = sorter;
            // if (field && order) {
            //     setProcessedData((prev) => {
            //         return orderBy(
            //             prev,
            //             [String(field)],
            //             [order === "ascend" ? "asc" : "desc"],
            //         );
            //     });
            // } else {
            //     setProcessedData(() => data);
            // }
        }
    };
    const columns: TableProps<AnalyticsData>["columns"] = React.useMemo(() => {
        return [
            {
                title: `Code`,
                dataIndex: "UBWSASWdyfi",
                key: "UBWSASWdyfi",
                width: 80,
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
                            {record.program?.replace(/\d+/g, "").trim()}
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
                                        width: "70%",
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
        ];
    }, []);

    return (
        <Performance
            data={data}
            groupingBy="UBWSASWdyfi"
            initialColumns={columns}
            pe={search.pe ?? ""}
        />
    );
}
