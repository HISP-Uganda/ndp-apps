import React from "react";
import { PERFORMANCE_COLORS } from "../utils";
import { Flex } from "antd";

const PerformanceLegend = React.memo(() => {
    const legendItems = [
        {
            bg: PERFORMANCE_COLORS.green.bg,
            color: "black",
            label: "Achieved (>= 100%)",
        },
        {
            bg: PERFORMANCE_COLORS.yellow.bg,
            color: "black",
            label: "Moderately achieved (75-99%)",
        },
        {
            bg: PERFORMANCE_COLORS.red.bg,
            color: "black",
            label: "Not achieved (< 75%)",
        },
        { bg: PERFORMANCE_COLORS.gray.bg, color: "black", label: "No Data" },
    ];

    return (
        <Flex justify="between" align="center" gap="4px">
            {legendItems.map((item, index) => (
                <div
                    key={index}
                    style={{
                        width: "100%",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: item.bg,
                        color: item.color,
                    }}
                >
                    {item.label}
                </div>
            ))}
        </Flex>
    );
});

PerformanceLegend.displayName = "PerformanceLegend";

export default PerformanceLegend;
