import { createRoute, Navigate, useLoaderData } from "@tanstack/react-router";
import React from "react";

import { RootRoute } from "./__root";
import { maxBy } from "lodash";

export const IndexRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: "/",
    component: IndexRouteComponent,
});

function IndexRouteComponent() {
    const { ndpVersions } = useLoaderData({ from: "__root__" });

    const latestNDP = maxBy(ndpVersions, (version) => {
        return new Date(version.created).getTime();
    });
    return <Navigate to="/ndp" search={{ v: latestNDP?.code ?? "" }} />;
}
