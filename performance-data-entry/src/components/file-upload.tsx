import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { Button, message, Upload, UploadFile, UploadProps } from "antd";
import React, { useState } from "react";

import { UploadOutlined } from "@ant-design/icons";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { attachmentsQueryOptions } from "../query-options";
import { DataElementDataValue, ICategoryOption, IDataSet } from "../types";

export default function FileUpload({
    engine,
    ou,
    saveComment,
    dataValue,
    record,
    pe,
    targetYear,
    baselineYear,
    currentData,
    dataSet,
}: {
    engine: ReturnType<typeof useDataEngine>;
    ou: string;
    saveComment: (comment: string, eventId: string) => Promise<void>;
    dataValue?: { value: string; comment?: string };
    record: ICategoryOption;
    pe: string;
    targetYear: string;
    baselineYear: string;
    currentData: DataElementDataValue | null;
    dataSet: IDataSet;
}) {
	const queryClient = useQueryClient()
    const { baseUrl } = useConfig();
    const coc1 = dataSet.categoryCombo.categoryOptionCombos.find((c) =>
        c.categoryOptions.some((opt) => opt.name === record.name),
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
            `${ou}_${period}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}`
        ];
    const attachments =
        currentData?.dataValue[
            `${ou}_${period}_${coc1?.id}_${currentData.categoryCombo.categoryOptionCombos[0].id}_comment`
        ];

    const { data } = useSuspenseQuery(
        attachmentsQueryOptions(baseUrl, engine, attachments ?? ""),
    );

    const [fileList, setFileList] = useState<UploadFile[]>(data);
    const [uploading, setUploading] = useState(false);

    const handleChange: UploadProps["onChange"] = ({ fileList }) => {
        setFileList(fileList);
    };

    const uploadSingleFile = (file: UploadFile) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("file", file.originFileObj as File);
            xhr.open("POST", `${baseUrl}/api/fileResources`);
            xhr.withCredentials = true;
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round(
                        (event.loaded / event.total) * 100,
                    );
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === file.uid
                                ? { ...f, percent, status: "uploading" }
                                : f,
                        ),
                    );
                }
            };
            xhr.onload = () => {
                if (
                    xhr.status === 200 ||
                    xhr.status === 201 ||
                    xhr.status === 202
                ) {
                    try {
                        const uploaded = JSON.parse(xhr.responseText);
                        setFileList((prev) =>
                            prev.map((f) =>
                                f.uid === file.uid
                                    ? {
                                          ...f,
                                          status: "done",
                                          percent: 100,
                                          url: uploaded.url,
                                          name: uploaded.name || f.name,
                                      }
                                    : f,
                            ),
                        );
                        resolve(uploaded);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    setFileList((prev) =>
                        prev.map((f) =>
                            f.uid === file.uid ? { ...f, status: "error" } : f,
                        ),
                    );
                    reject(new Error(`Upload failed for ${file.name}`));
                }
            };

            xhr.onerror = () => {
                setFileList((prev) =>
                    prev.map((f) =>
                        f.uid === file.uid ? { ...f, status: "error" } : f,
                    ),
                );
                reject(new Error(`Upload error for ${file.name}`));
            };

            xhr.send(formData);
        });
    };
    const handleUpload = async () => {
        const newFiles = fileList.filter((f) => !f.url && f.originFileObj);
        if (newFiles.length === 0) {
            message.info("No new files to upload.");
            return;
        }
        setUploading(true);

        for (const file of newFiles) {
            try {
                const response: any = await uploadSingleFile(file);
                const fileResourceId = response.response.fileResource.id;
                const response2: any = await engine.mutate({
                    resource: "events",
                    type: "create",
                    data: {
                        program: "j1relEmr69u",
                        programStage: "evywplQ17kH",
                        orgUnit: ou,
                        status: "ACTIVE",
                        eventDate: new Date().toISOString().split("T")[0],
                        dataValues: [
                            {
                                dataElement: "qeGJBGmsr0d",
                                value: fileResourceId,
                            },
                        ],
                    },
                });
                await saveComment(
                    dataValue?.comment || "",
                    response2?.response?.importSummaries?.[0].reference,
                );
                await queryClient.invalidateQueries();
            } catch (err) {
                console.error(err);
                message.error(`Failed to upload ${file.name}`);
            }
        }

        setUploading(false);
        message.success("All files processed.");
    };
    return (
        <>
            <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleChange}
                // onRemove={handleRemove}
                multiple
                listType="text"
            >
                <Button
                    icon={<UploadOutlined />}
                    disabled={
                        val === undefined ||
                        !(
                            coc1?.name.includes("Actual") ||
                            coc1?.name.includes("Spent")
                        )
                    }
                >
                    Click to Upload File
                </Button>
            </Upload>
            <Button
                type="primary"
                onClick={handleUpload}
                disabled={uploading || fileList.every((f) => f.url)}
                loading={uploading}
                style={{ marginTop: 16 }}
            >
                {uploading ? "Uploading..." : "Upload New Files"}
            </Button>
        </>
    );
}
