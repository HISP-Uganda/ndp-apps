import { createRoute } from "@tanstack/react-router";
import React from "react";
import { LibraryRoute } from "./route";

export const LibraryIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => LibraryRoute,
    component: Component,
});

function Component() {
    return <div>Index</div>;
}
