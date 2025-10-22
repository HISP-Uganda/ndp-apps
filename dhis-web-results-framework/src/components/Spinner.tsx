import React from "react";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";

export default function Spinner({ message }: { message?: string }) {
    return (
        <Flex
            justify="center"
            align="center"
            style={{ height: "100%", flex: 1 }}
            vertical
            gap={2}
        >
            <Spin indicator={<Loading3QuartersOutlined spin />} />
            {message}
        </Flex>
    );
}
