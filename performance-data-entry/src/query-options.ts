import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import { DHIS2OrgUnit } from "./types";
import { convertToAntdTree } from "./utils";

export const initialQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
) => {
    return queryOptions({
        queryKey: ["initial-query-options"],
        queryFn: async () => {
            const response = await engine.query({
                orgUnits: {
                    resource: "me",
                    params: {
                        fields: "organisationUnits[id],dataSets",
                    },
                },
            });
            const {
                orgUnits: { organisationUnits },
            } = response as unknown as {
                orgUnits: {
                    organisationUnits: DHIS2OrgUnit[];
                    dataSets: string[];
                };
            };

            const nextQuery = organisationUnits.reduce<Record<string, any>>(
                (acc, unit) => {
                    acc[unit.id] = {
                        resource: `organisationUnits/${unit.id}`,
                        params: {
                            fields: "id,name,leaf,parent",
                            includeDescendants: true,
                            paging: false,
                        },
                    };
                    return acc;
                },
                {},
            );

            const unitsResponse = (await engine.query(nextQuery)) as Record<
                string,
                { organisationUnits: DHIS2OrgUnit[] }
            >;

            const allUnits = Object.values(unitsResponse).flatMap(
                (res) => res.organisationUnits,
            );
            return {
                organisationTree: convertToAntdTree(allUnits),
            };
        },
    });
};
