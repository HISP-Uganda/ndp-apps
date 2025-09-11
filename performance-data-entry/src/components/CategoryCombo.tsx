import { UploadOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Modal, Table, TableProps, Upload } from "antd";
import React, { useState } from "react";
import { ICategoryOption, IDataElement, IDataSet } from "../types";
import { generateGroupedColumns } from "./data-entry";

export default function CategoryCombo({
    dataSet,
    fields,
    ou,
    pe,
    targetYear,
    baselineYear,
}: {
    dataSet: IDataSet;
    fields: IDataElement[];
    ou: string;
    pe: string;
    targetYear: string;
    baselineYear: string;
}) {
    const explanationColumns: TableProps<ICategoryOption>["columns"] = [
        { title: "Dimension", dataIndex: "name", key: "name" },
        { title: "Value", dataIndex: "id", key: "id" },
        {
            title: "Attachment",
            key: "attachment",
            render: () => (
                <Upload>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
            ),
        },
        {
            title: "Explanation",
            key: "explanation",
            render: () => <Input.TextArea rows={6} />,
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    const onClick = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = generateGroupedColumns({
        dataSet,
        dataElements: fields,
        pe,
        ou,
        onClick,
        targetYear,
        baselineYear,
    });
    return (
        <Flex vertical gap={8}>
            <Table
                columns={columns}
                dataSource={fields}
                pagination={false}
                bordered
                size="small"
                rowKey="id"
            />
            <Flex>
                <Button type="primary" onClick={() => {}}>
                    Submit data and lock
                </Button>
            </Flex>

            <Modal
                title="Basic Modal"
                closable={{ "aria-label": "Custom Close Button" }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"80%"}
            >
                <Table
                    columns={explanationColumns}
                    dataSource={dataSet.categoryCombo.categories.flatMap(
                        (cat) => cat.categoryOptions,
                    )}
                    pagination={false}
                    bordered
                    size="small"
                    rowKey="id"
                />
            </Modal>
        </Flex>
    );
}
