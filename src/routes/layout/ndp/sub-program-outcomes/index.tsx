import { createRoute } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { SubProgramOutcomeRoute } from "./route";
import { useSuspenseQuery } from "@tanstack/react-query";
import { analyticsQueryOptions } from "../../../../query-options";
import { Results } from "../../../../components/results";

export const SubProgramOutcomeIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramOutcomeRoute,
    component: Component,
});

function Component() {
    const { engine } = SubProgramOutcomeIndexRoute.useRouteContext();
    const { ou, deg, pe, tab, program } =
        SubProgramOutcomeIndexRoute.useSearch();
    const navigate = SubProgramOutcomeIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramOutcomeRoute.useLoaderData();
    const [dataElementGroups, setDataElementGroups] = React.useState<string[]>(
        () => {
            if (program !== undefined && dataElementGroupSets.length > 0) {
                return dataElementGroupSets.flatMap((d) => {
                    if (
                        d.attributeValues.filter((a) => a.value === program)
                            .length > 0
                    ) {
                        return d.dataElementGroups.map((g) => g.id);
                    }
                    return [];
                });
            }
            return [];
        },
    );

    useEffect(() => {
        if (program !== undefined && dataElementGroupSets.length > 0) {
            setDataElementGroups(() =>
                dataElementGroupSets.flatMap((d) => {
                    if (
                        d.attributeValues.filter((a) => a.value === program)
                            .length > 0
                    ) {
                        return d.dataElementGroups.map((g) => g.id);
                    }
                    return [];
                }),
            );
        }
    }, [program]);

    const data = useSuspenseQuery(
        analyticsQueryOptions(engine, {
            deg: dataElementGroups.map((de) => `DE_GROUP-${de}`).join(";"),
            pe,
            ou,
            program,
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
