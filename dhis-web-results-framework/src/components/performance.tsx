import { Table } from "antd";
import React from "react";
import { createColumns } from "../utils";

export default function Performance({
    props: [votes, data],
}: {
    props: Parameters<typeof createColumns>;
}) {
    const {columns, finalData} = createColumns(votes, data);
    return (
        <Table
            columns={columns}
            dataSource={finalData}
            scroll={{ y: "calc(100vh - 300px)" }}
            rowKey="id"
            bordered={true}
            sticky={true}
            pagination={false}
            size="small"
        />
    );
}
