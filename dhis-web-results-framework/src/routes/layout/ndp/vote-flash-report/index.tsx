import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Flex } from "antd";
import React from "react";
import { voteFlashQueryOptions } from "../../../../query-options";
import { VoteFlashReportRoute } from "./route";

export const VoteFlashReportIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => VoteFlashReportRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = VoteFlashReportRoute.useRouteContext();
    const { v, ou = "", pe } = VoteFlashReportRoute.useSearch();
    const { data } = useSuspenseQuery(
        voteFlashQueryOptions({
            engine,
            ndpVersion: v,
            ou,
            pe,
        }),
    );
    const [processedData, setProcessedData] = React.useState(data);

    React.useEffect(() => {
        setProcessedData(data);
    }, [data]);

    return (
        <Flex vertical gap="16px">
            {/* <Flex justify="flex-end" gap={10}>
                <Button
                    onClick={() => {
                        generateVoteFlashReport(
                            {
                                voteCode: "015",
                                voteCodeDetail: "MIN-FIN",
                                voteName: "Ministry of Finance",
                                annualPeriod: "July 2025 – June 2026",
                                quarterlyPeriod: "July 2025 – September 2025",
                            },
                            exampleData,
                            "Vote_Flash_Report.pdf",
                        );
                    }}
                    icon={<DownloadOutlined />}
                >
                    Download PDF
                </Button>
                <Button onClick={() => {}} icon={<DownloadOutlined />}>
                    Download Excel
                </Button>
            </Flex>						 */}
        </Flex>
    );
}
