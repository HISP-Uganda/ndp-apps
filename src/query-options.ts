import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import { DataElementGroupSet, OrgUnit } from "./types";

const processDHIS2OrgUnit = ({ id, name, leaf, parent }: DHIS2OrgUnit) => {
    let current: OrgUnit = {
        id,
        title: name,
        isLeaf: leaf,
        value: id,
        key: id,
    };

    if (parent && parent.id) {
        current = {
            ...current,
            pId: parent.id,
        };
    }
    return current;
};

type DHIS2OrgUnit = {
    id: string;
    name: string;
    leaf: boolean;
    parent: { id: string };
};
export const initialQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    attributeValue: string[],
    optionSet: string,
    programOptionSet: string,
) => {
    return queryOptions({
        queryKey: ["initial-query-options"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append(
                "fields",
                "id,name,dataElementGroups[id,name,attributeValues],attributeValues",
            );
            params.append(
                "filter",
                `attributeValues.value:in:[${attributeValue.join(",")}]`,
            );
            params.append("paging", `false`);
            const response = await engine.query({
                orgUnits: {
                    resource: "me",
                    params: {
                        fields: "organisationUnits[id~rename(key),name~rename(title),leaf~rename(isLeaf)],dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf~rename(isLeaf)]",
                    },
                },

                options: {
                    resource: "optionSets",
                    params: {
                        filter: `id:in:[Az2bwwUIPWn]`,
                        fields: "id,options[id,name,code]",
                    },
                },
                ndpVersions: {
                    resource: `optionSets/${optionSet}/options`,
                },
                programs: {
                    resource: `optionSets/${programOptionSet}/options`,
                },
                dataElementGroupSets: {
                    resource: `dataElementGroupSets?${params.toString()}`,
                },
            });

            const {
                orgUnits: { dataViewOrganisationUnits, organisationUnits },
                options: { options },
                ndpVersions: { options: ndpVersions },
                programs: { options: programs },
                dataElementGroupSets: { dataElementGroupSets },
            } = response as unknown as {
                orgUnits: {
                    organisationUnits: DHIS2OrgUnit[];
                    dataViewOrganisationUnits: DHIS2OrgUnit[];
                };
                options: {
                    id: string;
                    options: { id: string; name: string; code: string }[];
                };
                ndpVersions: {
                    options: {
                        id: string;
                        name: string;
                        code: string;
                        created: string;
                    }[];
                };
                programs: {
                    options: { id: string; name: string; code: string }[];
                };
                dataElementGroupSets: {
                    dataElementGroupSets: DataElementGroupSet[];
                };
            };

            const units = organisationUnits.map(processDHIS2OrgUnit);

            return {
                dataElementGroupSets,
                options,
                programs,
                ndpVersions,
                ou: dataViewOrganisationUnits[0].id,
            };
        },
    });
};

export const optionSetQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    optionsSet: string,
) => {
    return queryOptions({
        queryKey: ["option-set", optionsSet],
        queryFn: async () => {
            const { options } = await engine.query({
                options: {
                    resource: `optionSets/${optionsSet}/options`,
                },
            });
            return options;
        },
    });
};
