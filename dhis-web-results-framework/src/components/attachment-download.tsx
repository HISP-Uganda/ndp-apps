import { useConfig } from "@dhis2/app-runtime";
import { useQuery } from "@tanstack/react-query";
import { Typography, Upload } from "antd";
import React from "react";
import { attachmentsQueryOptions } from "../query-options";
import { RootRoute } from "../routes/__root";
import Spinner from "./Spinner";

export default function AttachmentDownload({
    attachment,
}: {
    attachment: string;
}) {
    const { engine } = RootRoute.useRouteContext();
    const { baseUrl } = useConfig();
    const { data, error, isLoading, isError, isSuccess } = useQuery(
        attachmentsQueryOptions(baseUrl, engine, attachment),
    );
    if (isError)
        return <Typography.Text>Failed to fetch downloads</Typography.Text>;
    if (isLoading) return <Spinner />;
    if (isSuccess) return (
        <Upload
            defaultFileList={data}
            showUploadList={{ showRemoveIcon: false }}
        ></Upload>
    );
    return null;
}
