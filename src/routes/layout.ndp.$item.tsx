import React from "react";
import { createRoute } from "@tanstack/react-router";
import { z } from "zod";

import { NDPRoute } from "./layout.ndp.route";
import { GoalValidator } from "../types";
export const NDPItemRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "$item",
    params: {
        parse: ({ item }) => ({
            item: z.string().parse(item),
        }),
        stringify: ({ item }) => ({ item: `${item}` }),
    },
    component: ItemRouteComponent,
    validateSearch: GoalValidator,
});

function ItemRouteComponent() {
    return (
        <div>
            <h1>NDP Item</h1>
            <p>This is a placeholder for the NDP item details.</p>
        </div>
    );
}
