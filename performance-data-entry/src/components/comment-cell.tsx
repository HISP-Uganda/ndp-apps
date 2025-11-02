import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Modal, Space, Table, TableProps } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useState } from "react";
import { db } from "../db";
import { IndexRoute } from "../routes";
import { ICategoryOption, IDataSet } from "../types";
import CommentCellDisplay from "./comment-cell-display";
import FileUpload from "./file-upload";
import { isEmpty } from "lodash";

export default function CommentCell({
    cc,
    coc,
    aoc,
    co,
    de,
    ou,
    pe,
    cp,
    dataSet,
    baselineYear,
    targetYear,
    disabled,
}: {
    coc: string;
    aoc: string;
    co: string;
    cc: string;
    cp: string;
    de: string;
    ou: string;
    pe: string;
    dataSet: IDataSet;
    baselineYear: string;
    targetYear: string;
    disabled: boolean;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { engine } = IndexRoute.useRouteContext();

    const value = useLiveQuery(async () => {
        return await db.dataValues.get({
            dataElement: de,
            period: pe,
            orgUnit: ou,
            categoryOptionCombo: coc,
            attributeOptionCombo: aoc,
        });
    }, [de, aoc, coc, ou, pe]);

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const explanationColumns: TableProps<ICategoryOption>["columns"] = [
        { title: "Dimension", dataIndex: "name", key: "name", width: 100 },
        {
            title: "Value",
            key: "id",
            width: 60,
            render: (text, record, index) => {
                const { id: aoc } =
                    dataSet.categoryCombo.categoryOptionCombos.find((c) =>
                        c.categoryOptions.some((opt) => opt.id === record.id),
                    )!;
                return (
                    <CommentCellDisplay
                        coc={coc}
                        aoc={aoc}
                        de={de}
                        ou={ou}
                        pe={pe}
                        co={co}
                        cc={cc}
                        cp={cp}
                        disabled={index < 1 || disabled}
                    />
                );
            },
        },
        {
            title: "Attachment",
            key: "attachment",
            width: "calc((100% - 160px)/2)",
            render: (_, record, index) => {
                const { id: aoc } =
                    dataSet.categoryCombo.categoryOptionCombos.find((c) =>
                        c.categoryOptions.some((opt) => opt.id === record.id),
                    )!;
                return (
                    <FileUpload
                        engine={engine}
                        baselineYear={baselineYear}
                        dataSet={dataSet}
                        ou={ou}
                        pe={pe}
                        coc={coc}
                        aoc={aoc}
                        record={record}
                        de={de}
                        targetYear={targetYear}
                        cc={cc}
                        cp={cp}
                        co={co}
                        disabled={index < 1 || disabled}
                    />
                );
            },
        },
        {
            title: "Explanation",
            key: "explanation",
            width: "calc((100% - 160px)/2)",
            render: (_, record, index) => {
                const { id: aoc } =
                    dataSet.categoryCombo.categoryOptionCombos.find((c) =>
                        c.categoryOptions.some((opt) => opt.id === record.id),
                    )!;
                return (
                    <CommentCellDisplay
                        coc={coc}
                        aoc={aoc}
                        de={de}
                        ou={ou}
                        pe={pe}
                        isComment
                        co={co}
                        cc={cc}
                        cp={cp}
                        disabled={index < 1 || disabled}
                    />
                );
            },
        },
    ];
    return (
        <Flex vertical>
            <Space.Compact
                style={{
                    width: "100%",
                }}
                onClick={() => {
                    if (!isEmpty(value?.value)) {
                        setIsModalOpen(true);
                    }
                }}
            >
                <Input
                    value={
                        isEmpty(value?.explanation)
                            ? ""
                            : "Explanation available"
                    }
                />
                <Button
                    type="primary"
                    danger={isEmpty(value?.explanation)}
                    icon={<PaperClipOutlined />}
                    style={{
                        width: "48px",
                    }}
                />
            </Space.Compact>

            <Modal
                title="Explanations and Attachments"
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
                    scroll={{ y: "calc(100vh - 400px)" }}
                    bordered
                    tableLayout="auto"
                    size="small"
                    rowKey="id"
                />
            </Modal>
        </Flex>
    );
}
