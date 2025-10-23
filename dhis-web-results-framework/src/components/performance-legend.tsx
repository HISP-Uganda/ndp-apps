import React from "react";
import { PERFORMANCE_COLORS, performanceLegendItems } from "../utils";
import { Flex } from "antd";

const PerformanceLegend = React.memo(
    ({ legendItems }: { legendItems: typeof performanceLegendItems }) => {
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
    },
);

PerformanceLegend.displayName = "PerformanceLegend";

export default PerformanceLegend;
