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
