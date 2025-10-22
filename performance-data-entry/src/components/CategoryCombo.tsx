import { UploadOutlined } from "@ant-design/icons";
import { useDataEngine, useConfig } from "@dhis2/app-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Flex,
    Input,
    message,
    Modal,
    Table,
    TableProps,
    Typography,
    Upload,
} from "antd";
import React, { useMemo, useState } from "react";
import { dataValuesQueryOptions, useSaveDataValue } from "../query-options";
import {
    DataElementDataValue,
    ICategoryOption,
    IDataElement,
    IDataSet,
    Search,
} from "../types";
import { generateGroupedColumns } from "./data-entry";
import Spinner from "./Spinner";
import { fromPairs } from "lodash";

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
    const { baseUrl } = useConfig();
    const [currentData, setCurrentData] = useState<DataElementDataValue | null>(
        null,
    );
    const [dataValue, setDataValue] = useState<{
        value?: string;
        de: string;
        pe: string;
        ou: string;
        co: string;
        cc: string;
        cp: string;
        comment?: string;
    } | null>(null);

    const saveDataValue = useSaveDataValue(true);

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
                if (
                    coc1?.name.includes("Target") ||
                    coc1?.name.includes("Planned") ||
                    coc1?.name.includes("Approved")
                ) {
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
            render:  (_, record) => {
                const coc1 = dataSet.categoryCombo.categoryOptionCombos.find(
                    (c) =>
                        c.categoryOptions.some(
                            (opt) => opt.name === record.name,
                        ),
                );
                let period = pe;
                if (
                    coc1?.name.includes("Target") ||
                    coc1?.name.includes("Planned") ||
                    coc1?.name.includes("Approved")
                ) {
                    period = targetYear;
                } else if (coc1?.name.includes("Baseline")) {
                    period = baselineYear;
                }
                const val =
                    currentData?.dataValue[
                        `${ou}_${pe}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}`
                    ];

                const attachments =
                    currentData?.dataValue[
                        `${ou}_${pe}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}_comment`
                    ];
                // const { attachment } = JSON.parse(
                //     attachments ?? '{"explanation": "", "attachment": []}',
                // );

								// console.log("attachments", attachments, attachment);

                // const response = await engine.query(
                //     fromPairs(
                //         attachment ?? [].map((id) => [
                //             id,
                //             {
                //                 resource: `events/${id}`,
                //                 params: {
                //                     event: id,
                //                 },
                //             },
                //         ]),
                //     ),
                // );

                // console.log("response", response);

                return (
                    <Upload
                        action={async (file) => {
                            const formData = new FormData();
                            formData.append("file", file);
                            console.log("uploading file", file);

                            const uploadResponse = await fetch(
                                `${baseUrl}/api/fileResources`,
                                {
                                    method: "POST",
                                    body: formData,
                                    credentials: "include",
                                },
                            );

                            if (!uploadResponse.ok) {
                                throw new Error("Upload failed");
                            }

                            const uploadData = await uploadResponse.json();
                            const fileResourceId =
                                uploadData.response.fileResource.id;

                            const response2: any = await engine.mutate({
                                resource: "events",
                                type: "create",
                                data: {
                                    program: "j1relEmr69u",
                                    programStage: "evywplQ17kH",
                                    orgUnit: ou,
                                    status: "ACTIVE",
                                    eventDate: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    dataValues: [
                                        {
                                            dataElement: "qeGJBGmsr0d",
                                            value: fileResourceId,
                                        },
                                    ],
                                },
                            });
                            const response3 = await saveComment(
                                dataValue?.comment || "",
                                response2?.response?.importSummaries?.[0]
                                    .reference,
                            );
                            console.log("comment saved", response3);
                            return "";
                        }}
                        // defaultFileList={attachment.map((index) => ({
                        //     uid: index.toString(),
                        //     name: `Attachment-${index + 1}`,
                        //     status: "done",
                        // }))}
                    >
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
            render: (_, record) => {
                const coc1 = dataSet.categoryCombo.categoryOptionCombos.find(
                    (c) =>
                        c.categoryOptions.some(
                            (opt) => opt.name === record.name,
                        ),
                );
                let period = pe;
                if (
                    coc1?.name.includes("Target") ||
                    coc1?.name.includes("Planned") ||
                    coc1?.name.includes("Approved")
                ) {
                    period = targetYear;
                } else if (coc1?.name.includes("Baseline")) {
                    period = baselineYear;
                }
                let val =
                    currentData?.dataValue[
                        `${ou}_${pe}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}_comment`
                    ];

                if (val) {
                    val = JSON.parse(val)["explanation"];
                }
                return (
                    <Input.TextArea
                        rows={6}
                        onBlur={(e) => saveComment(e.target.value)}
                        defaultValue={val}
                    />
                );
            },
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

    const onClick = (
        data: DataElementDataValue,
        rowData: {
            value: string;
            de: string;
            pe: string;
            ou: string;
            co: string;
            cc: string;
            cp: string;
            comment?: string;
        },
    ) => {
        setCurrentData(() => data);
        setDataValue(() => rowData);
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

    const saveComment = async (comment: string, attachment: string = "") => {
        const previous = JSON.parse(
            dataValue?.comment ?? '{"explanation": "", "attachment": []}',
        );
        if (!currentData) return;
        let comments = JSON.stringify(previous);

        if (attachment) {
            comments = JSON.stringify({
                explanation: comment,
                attachment: [...previous.attachment, attachment],
            });
        }
        const coc = currentData.categoryCombo.categoryOptionCombos[0];
        const newDataValue: DataElementDataValue = {
            ...currentData,
            dataValue: {
                ...currentData.dataValue,
                [`${ou}_${pe}_${coc.id}_${coc.id}_comment`]: comments,
            },
        };

        try {
            if (dataValue) {
                await saveDataValue.mutateAsync({
                    engine,
                    dataValue: {
                        ...dataValue,
                        comment: comments,
                    },
                });
                message.success("Data saved successfully", 2);
            }
        } catch (error) {
            message.error(
                `Failed to save data. Please try again. ${error.message}`,
                4,
            );
            // setCurrentValue(previousValue);
            console.error("Save error:", error);
        } finally {
            // setIsLoading(false);
            // setIsEditing(false);
        }
        queryClient.setQueryData(
            [
                "data-values",
                search.orgUnit,
                search.dataSet,
                search.pe,
                search.baseline,
                search.targetYear,
            ],
            (oldData: any) => {
                if (!oldData) return oldData;
                const updatedDataValues = oldData.dataValues.map(
                    (dv: DataElementDataValue) =>
                        dv.id === newDataValue.id ? newDataValue : dv,
                );
                return {
                    ...oldData,
                    dataValues: updatedDataValues,
                };
            },
        );
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

    if (isLoading) return <Spinner />;
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
