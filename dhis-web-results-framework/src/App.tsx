import { useDataEngine } from "@dhis2/app-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ConfigProvider } from "antd";
import React, { FC } from "react";
import "./app.css";

import { router } from "./router";
const queryClient = new QueryClient();
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
const MyApp: FC = () => {
    const engine = useDataEngine();
    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 0,
                    // lineWidth: 2,
                },
                components: {
                    Table: {
                        borderColor: "#CAD5E5",
                        borderRadius: 0,
                        headerBg: "#BBD1EE",
                        headerBorderRadius: 0,
                    },
                    Tree: {
                        nodeSelectedBg: "#2B6998",
                        nodeSelectedColor: "#FFFFFF",
                    },
                    Tabs: {
                        cardBg: "#B4CDCD",
                        // horizontalItemMargin: "auto",
                        // inkBarColor: "#ff4d4f",
                        // itemActiveColor: "#ff4d4f",
                        // itemHoverColor: "#ff7875",
                        // itemSelectedColor: "#ff4d4f",
                    },
                    Select: {
                        optionFontSize: 17,
                        // optionSelectedColor: "#FF0000",
                        // colorText: "#FF0000",
                        // optionSelectedBg: "#3875D7",
                        // colorText: "#ffffff",
                    },
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} context={{ engine }} />
            </QueryClientProvider>
        </ConfigProvider>
    );
};

export default MyApp;
