import { createRoute } from "@tanstack/react-router";
import React from "react";
import { IndicatorDictionaryRoute } from "./route";

export const IndicatorDictionaryIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => IndicatorDictionaryRoute,
    component: Component,
});

function Component() {
    return <div>Index</div>;
}
