import { Table, TableProps } from "antd";
import React from "react";
import { createColumns } from "../utils";
import { orderBy } from "lodash";

export default function Performance({
    props: [votes, data],
}: {
    props: Parameters<typeof createColumns>;
}) {
    const { columns, finalData } = createColumns(votes, data);

    const [processedData, setProcessedData] = React.useState(finalData);

    const handleChange: TableProps<(typeof finalData)[number]>["onChange"] = (
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
                setProcessedData(() => finalData);
            }
        }
    };

    return (
        <Table
            columns={columns}
            dataSource={processedData}
            scroll={{ y: "calc(100vh - 300px)" }}
            rowKey="id"
            bordered={true}
            pagination={false}
            size="small"
            onChange={handleChange}
        />
    );
}
