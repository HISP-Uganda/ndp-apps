import { createRoute } from "@tanstack/react-router";
import { Modal, Table, type TableProps } from "antd";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import Performance from "../../../../components/performance";
import { useAnalyticsQuery } from "../../../../hooks/data-hooks";
import { AnalyticsData } from "../../../../types";
import { VoteOutcomePerformanceRoute } from "./route";
import { RootRoute } from "../../../__root";
export const VoteOutcomePerformanceIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VoteOutcomePerformanceRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { allOptionsMap } = RootRoute.useLoaderData();
    const search = VoteOutcomePerformanceIndexRoute.useSearch();
    const { engine } = VoteOutcomePerformanceIndexRoute.useRouteContext();
    const { data } = useAnalyticsQuery({
        engine,
        search: {
            ...search,
            pe: [search.pe ?? ""],
        },
        ndpVersion: search.v,
        attributeValue: "intermediateOutcome",
        queryByOu: true,
    });
    const [modal, contextHolder] = Modal.useModal();

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
                render: (text: string) => {
                    return text.replace(/\d+/g, "").trim();
                },
                sorter: true,
            },
            {
                title: `Outcome`,
                dataIndex: "YlPvYLC4VfO",
                key: "YlPvYLC4VfO",
                render: (text: string, record) => {
                    return (
                        <div>
                            {allOptionsMap?.get(text) || text}
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
            groupingBy="YlPvYLC4VfO"
            initialColumns={columns}
            pe={search.pe ?? ""}
        />
    );
}
