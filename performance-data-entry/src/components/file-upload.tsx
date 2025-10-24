import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { Button, Upload } from "antd";
import React from "react";

import { UploadOutlined } from "@ant-design/icons";
import { DataElementDataValue, ICategoryOption, IDataSet } from "../types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { attachmentsQueryOptions } from "../query-options";

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
    return (
        <Upload
            customRequest={async ({ file }) => {
                const formData = new FormData();
                formData.append("file", file);
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
                const fileResourceId = uploadData.response.fileResource.id;

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
                const response3 = await saveComment(
                    dataValue?.comment || "",
                    response2?.response?.importSummaries?.[0].reference,
                );
            }}
            defaultFileList={data}
        >
            <Button
                icon={<UploadOutlined />}
                disabled={!val || !coc1?.name.includes("Actual")}
            >
                Click to Upload
            </Button>
        </Upload>
    );
}
