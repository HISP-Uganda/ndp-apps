import { createRoute, useLoaderData } from "@tanstack/react-router";
import { Tree } from "antd";
import React from "react";

import { RootRoute } from "./__root";
import { search } from "../types";

export const IndexRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/",
    component: IndexRouteComponent,
    validateSearch: search,
});

function IndexRouteComponent() {
    const { organisationTree } = useLoaderData({ from: "__root__" });
    const navigate = RootRoute.useNavigate();

    const handleSelect = (selectedKeys: React.Key[]) => {
        const selectedKey = selectedKeys[0];
        if (selectedKey) {
            navigate({
                search: (prev) => ({ ...prev, ou: selectedKey.toString() }),
            });
        }
    };

    return (
        <div>
            <Tree
                treeData={organisationTree}
                showLine
                onSelect={handleSelect}
            />
        </div>
    );
}
