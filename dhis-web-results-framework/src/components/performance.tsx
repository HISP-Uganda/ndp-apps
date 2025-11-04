import { DownloadOutlined } from "@ant-design/icons";
import { Button, Flex, Table, TableProps } from "antd";
import { orderBy } from "lodash";
import React from "react";
import downloadExcelFromColumns from "../download-antd-table";
import downloadPdfFromColumns from "../download-pdf-from-columns";
import { createColumns } from "../utils";

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
        <Flex vertical gap="16px">
            <Flex justify="flex-end" gap={10}>
                <Button
                    onClick={() =>
                        downloadPdfFromColumns(
                            columns,
                            processedData,
                            "performance-report.pdf",
                            { orientation: "landscape" },
                        )
                    }
                    icon={<DownloadOutlined />}
                >
                    Download PDF
                </Button>
                <Button
                    onClick={() =>
                        downloadExcelFromColumns(
                            columns,
                            processedData,
                            "performance-report.xlsx",
                        )
                    }
                    icon={<DownloadOutlined />}
                >
                    Download Excel
                </Button>
            </Flex>
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
        </Flex>
    );
}
