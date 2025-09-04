import { createRoute } from "@tanstack/react-router";
import React from "react";
import { FAQRoute } from "./route";
import { Tabs, TabsProps } from "antd";

export const FAQIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => FAQRoute,
    component: Component,
});


const items: TabsProps["items"] = [
    {
        key: "1",
        label: "Tab 1",
        children: "Content of Tab Pane 1",
    },
    {
        key: "2",
        label: "Tab 2",
        children: "Content of Tab Pane 2",
    },
    {
        key: "3",
        label: "Tab 3",
        children: "Content of Tab Pane 3",
    },
];
function Component() {
    return <Tabs defaultActiveKey="1" items={items}  />;
}
