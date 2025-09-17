import { UploadOutlined } from "@ant-design/icons";
import {
    Button,
    Flex,
    Input,
    Modal,
    Table,
    TableProps,
    Typography,
    Upload,
} from "antd";
import React, { useMemo, useState } from "react";
import {
    DataElementDataValue,
    ICategoryOption,
    IDataElement,
    IDataSet,
    Search,
} from "../types";
import { generateGroupedColumns } from "./data-entry";
import { useQuery } from "@tanstack/react-query";
import { dataValuesQueryOptions } from "../query-options";
import { useDataEngine } from "@dhis2/app-runtime";
import { useQueryClient } from "@tanstack/react-query";

export default function CategoryCombo({
    dataSet,
    fields,
    ou,
    pe,
    targetYear,
    baselineYear,
    search,
    engine,
}: {
    dataSet: IDataSet;
    fields: IDataElement[];
    ou: string;
    pe: string;
    targetYear: string;
    baselineYear: string;
    search: Search;
    engine: ReturnType<typeof useDataEngine>;
}) {
    const queryClient = useQueryClient();
    const [currentData, setCurrentData] = useState<DataElementDataValue | null>(
        null,
    );
    const explanationColumns: TableProps<ICategoryOption>["columns"] = [
        { title: "Dimension", dataIndex: "name", key: "name" },
        {
            title: "Value",
            key: "id",
            render: (_, record) => {
                const coc1 = dataSet.categoryCombo.categoryOptionCombos.find(
                    (c) =>
                        c.categoryOptions.some(
                            (opt) => opt.name === record.name,
                        ),
                );

                let period = pe;
                if (coc1?.name === "Target") {
                    period = targetYear;
                } else if (coc1?.name === "Baseline") {
                    period = baselineYear;
                }
                return currentData?.dataValue[
                    `${ou}_${period}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}`
                ];
            },
        },
        {
            title: "Attachment",
            key: "attachment",
            render: (_, record) => {
                const coc1 = dataSet.categoryCombo.categoryOptionCombos.find(
                    (c) =>
                        c.categoryOptions.some(
                            (opt) => opt.name === record.name,
                        ),
                );
                let period = pe;
                if (coc1?.name.includes("Target")) {
                    period = targetYear;
                } else if (coc1?.name.includes("Baseline")) {
                    period = baselineYear;
                }
                const val =
                    currentData?.dataValue[
                        `${ou}_${pe}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}`
                    ];
                return (
                    <Upload>
                        <Button
                            icon={<UploadOutlined />}
                            disabled={!val || !coc1?.name.includes("Actual")}
                        >
                            Click to Upload
                        </Button>
                    </Upload>
                );
            },
        },
        {
            title: "Explanation",
            key: "explanation",
            render: () => <Input.TextArea rows={6} />,
        },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDataSetModalOpen, setIsDataSetModalOpen] = useState(false);

    const [modalValues, setModalValues] = useState<{
        title: string;
        body: string;
    }>({
        title: "Submit data and lock",
        body: "Are you finished with data entry and ready to submit?",
    });

    const onClick = (data: DataElementDataValue) => {
        setCurrentData(() => data);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const openDataSetCompleteModal = () => {
        if (data?.completeDataSetRegistrations ?? [].length > 0) {
            setModalValues({
                title: "Recall data and edit",
                body: "Are you sure to recall submitted data and do editing?",
            });
        } else {
            setModalValues({
                title: "Submit data and lock",
                body: "Are you finished with data entry and ready to submit?",
            });
        }
        setIsDataSetModalOpen(true);
    };

    const success = () => {
        Modal.success({
            title: "Success",
            content: "Data is now submitted",
        });
    };

    const errorModal = () => {
        Modal.error({
            title: "This is an error message",
            content: "Data submission failed",
        });
    };

    const handleDataSetOk = async () => {
        setIsDataSetModalOpen(false);
        try {
            if (data?.completeDataSetRegistrations ?? [].length > 0) {
                await engine.mutate({
                    resource: "completeDataSetRegistrations.json",
                    type: "delete",
                    id: "",
                    params: {
                        ds: dataSet.id,
                        pe,
                        ou,
                        cc: "NWhCUsy6l47",
                        cp: "HKtncMjp06U",
                        multiOu: false,
                    },
                });
            } else {
                await engine.mutate({
                    resource: "completeDataSetRegistrations.json",
                    type: "create",
                    data: {
                        completeDataSetRegistrations: [
                            {
                                dataSet: dataSet.id,
                                organisationUnit: ou,
                                period: pe,
                                attributeOptionCombo: "VHmIifPr01a",
                            },
                        ],
                    },
                });
            }
            success();
        } catch (error) {
            errorModal();
        } finally {
            queryClient.invalidateQueries({
                queryKey: [
                    "data-values",
                    search.orgUnit,
                    search.dataSet,
                    search.pe,
                    search.baseline,
                    search.targetYear,
                ],
            });
        }
    };

    const handleDataSetCancel = () => {
        setIsDataSetModalOpen(false);
    };

    const { data, isError, isLoading } = useQuery({
        ...dataValuesQueryOptions(engine, search, fields),
    });

    const columns = useMemo(
        () =>
            generateGroupedColumns({
                dataSet,
                dataElements: fields,
                pe,
                ou,
                onClick,
                targetYear,
                baselineYear,
                disabled: !!(data?.completeDataSetRegistrations ?? []).length,
                periodType: dataSet.periodType,
            }),
        [dataSet, fields, pe, ou, targetYear, baselineYear],
    );

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading data values</div>;
    return (
        <Flex vertical gap={8}>
            <Table
                columns={columns}
                dataSource={data?.dataValues || []}
                pagination={false}
                scroll={{ y: 55 * 11.6 }}
                bordered
                size="small"
                rowKey="id"
            />
            <Flex>
                <Button
                    onClick={openDataSetCompleteModal}
                    style={{
                        backgroundColor:
                            (data?.completeDataSetRegistrations ?? []).length >
                            0
                                ? "#D9534F"
                                : "#5CB85C",
                        color: "white",
                    }}
                >
                    {data?.completeDataSetRegistrations ?? [].length > 0
                        ? "Recall data and edit"
                        : "Submit data and lock"}
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
            <Modal
                title={modalValues.title}
                closable={{ "aria-label": "Custom Close Button" }}
                open={isDataSetModalOpen}
                onOk={handleDataSetOk}
                onCancel={handleDataSetCancel}
            >
                <Typography.Text>{modalValues.body}</Typography.Text>
            </Modal>
        </Flex>
    );
}
