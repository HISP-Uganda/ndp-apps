import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { Results } from "../../../../components/results";
import { analyticsQueryOptions } from "../../../../query-options";
import { GoalRoute } from "./route";

export const GoalIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => GoalRoute,
    component: Component,
});

function Component() {
    const { engine } = GoalIndexRoute.useRouteContext();
    const { ou, deg, degs, pe, tab } = GoalIndexRoute.useSearch();
    const navigate = GoalIndexRoute.useNavigate();
    const dataElementGroupSets = GoalRoute.useLoaderData();
    const [dataElementGroups, setDataElementGroups] = React.useState<string[]>(
        () => {
            if (degs !== undefined && dataElementGroupSets.length > 0) {
                return dataElementGroupSets.flatMap((d) => {
                    if (d.id === degs) {
                        return d.dataElementGroups.map((g) => g.id);
                    }
                    return [];
                });
            } else if (dataElementGroupSets.length > 0) {
                return dataElementGroupSets.flatMap((d) =>
                    d.dataElementGroups.map((g) => g.id),
                );
            }
            return [];
        },
    );

    useEffect(() => {
        if (degs !== undefined && dataElementGroupSets.length > 0) {
            setDataElementGroups(() =>
                dataElementGroupSets.flatMap((d) => {
                    if (d.id === degs) {
                        return d.dataElementGroups.map((g) => g.id);
                    }
                    return [];
                }),
            );
        } else if (dataElementGroupSets.length > 0) {
            setDataElementGroups(() =>
                dataElementGroupSets.flatMap((d) =>
                    d.dataElementGroups.map((g) => g.id),
                ),
            );
        }
    }, [degs]);

    useEffect(() => {
        if (deg !== undefined) {
            setDataElementGroups([deg]);
        } else if (degs !== undefined && dataElementGroupSets.length > 0) {
            setDataElementGroups(() =>
                dataElementGroupSets.flatMap((d) => {
                    if (d.id === degs) {
                        return d.dataElementGroups.map((g) => g.id);
                    }
                    return [];
                }),
            );
        } else if (dataElementGroupSets.length > 0) {
            setDataElementGroups(() =>
                dataElementGroupSets.flatMap((d) =>
                    d.dataElementGroups.map((g) => g.id),
                ),
            );
        }
    }, [deg]);

    const data = useSuspenseQuery(
        analyticsQueryOptions(engine, {
            deg: dataElementGroups.map((de) => `DE_GROUP-${de}`).join(";"),
            pe,
            ou,
        }),
    );

    const onChange = (key: string) => {
        navigate({
            search: (prev) => ({
                ...prev,
                tab: key,
            }),
        });
    };

    return (
        <Results
            data={data.data}
            dataElementGroupSets={dataElementGroupSets}
            onChange={onChange}
            tab={tab}
            deg={deg}
            ou={ou}
            pe={pe}
        />
    );
}
