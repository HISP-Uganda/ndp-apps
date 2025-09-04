import { Tooltip } from "antd";
import React from "react";

export default function TruncatedText({
    text,
    maxLength = 50,
}: {
    text: string;
    maxLength?: number;
}) {
    if (!text || text.length <= maxLength) {
        return <span>{text}</span>;
    }
    const truncated = text.substring(0, maxLength) + "...";
    return (
        <Tooltip title={text} placement="right">
            <span style={{ cursor: "help" }}>{truncated}</span>
        </Tooltip>
    );
}
