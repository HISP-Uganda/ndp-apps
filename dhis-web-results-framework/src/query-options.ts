import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import { db } from "./db";
import {
    Analytics,
    DataElement,
    DataElementGroupSet,
    GoalSearch,
    Option,
    OptionSet,
    OrgUnit,
} from "./types";
import { flattenDataElements } from "./utils";

type DHIS2OrgUnit = {
    id: string;
    name: string;
    leaf: boolean;
    parent: { id: string };
};
export const initialQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    optionSet: string,
    programOptionSet: string,
) => {
    return queryOptions({
        queryKey: ["initial-query-options"],
        queryFn: async () => {
            const response = await engine.query({
                orgUnits: {
                    resource: "me",
                    params: {
                        fields: "organisationUnits[id,name,leaf],dataViewOrganisationUnits[id,name,leaf]",
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
                programGoals: {
                    resource: `optionSets/D5J653eYk73/options`,
                },
                categories: {
                    resource: "categories",
                    params: {
                        filter: "id:in:[Duw5yep8Vae,kfnptfEdnYl]",
                        fields: "id,categoryOptions[id]",
                    },
                },
            });

            const {
                orgUnits: { dataViewOrganisationUnits },
                options: { options },
                ndpVersions: { options: ndpVersions },
                programs: { options: programs },
                programGoals: { options: programGoals },
                categories: { categories },
            } = response as unknown as {
                orgUnits: {
                    organisationUnits: DHIS2OrgUnit[];
                    dataViewOrganisationUnits: DHIS2OrgUnit[];
                };
                options: OptionSet;
                ndpVersions: {
                    options: Option[];
                };
                programs: {
                    options: Option[];
                };
                programGoals: {
                    options: Option[];
                };
                categories: {
                    categories: Array<{
                        id: string;
                        categoryOptions: Array<{
                            id: string;
                        }>;
                    }>;
                };
            };

            const organisationUnits: OrgUnit[] = dataViewOrganisationUnits.map(
                ({ id, name, leaf }) => {
                    const current: OrgUnit = {
                        id,
                        title: name,
                        isLeaf: leaf,
                        value: id,
                        key: id,
                    };
                    return current;
                },
            );

            const configurations: Record<string, any> = {};
            for (const version of ndpVersions) {
                try {
                    const response = await engine.query({
                        data: {
                            resource: `dataStore/ndp-configurations/${version.code}`,
                        },
                    });
                    configurations[version.code] = response;
                } catch (error) {
                    try {
                        await engine.mutate({
                            resource: `dataStore/ndp-configurations/${version.code}`,
                            data: {
                                baseline: "",
                            },
                            type: "create",
                        });
                    } catch (error) {}
                }
            }
            await db.dataViewOrgUnits.bulkPut(organisationUnits);
            return {
                options,
                programs,
                ndpVersions,
                ou: dataViewOrganisationUnits[0].id,
                configurations,
                programGoals,
                categories: new Map(
                    categories.map((c) => [
                        c.id,
                        c.categoryOptions.map((co) => co.id),
                    ]),
                ),
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

export const dataElementGroupSetsQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    attributeValue: string,
    ndpVersion: string,
) => {
    return queryOptions({
        queryKey: ["data-element-groupSets", attributeValue, ndpVersion],
        queryFn: async () => {
            const response = await engine.query({
                dataElementGroupSets: {
                    resource: `dataElementGroupSets?filter=attributeValues.value:eq:${ndpVersion}&filter=attributeValues.value:eq:${attributeValue}&fields=id,name,displayName,dataElementGroups[id,name,attributeValues],attributeValues&paging=false`,
                },
            });
            const {
                dataElementGroupSets: { dataElementGroupSets },
            } = response as unknown as {
                dataElementGroupSets: {
                    dataElementGroupSets: DataElementGroupSet[];
                };
            };
            return dataElementGroupSets;
        },
    });
};

export const dataElementGroupSetsWithProgramsQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    attributeValue: string,
    ndpVersion: string,
) => {
    return queryOptions({
        queryKey: ["option-sets-programs", ndpVersion, attributeValue],
        queryFn: async () => {
            const response = await engine.query({
                optionSets: {
                    resource: `optionSets?filter=attributeValues.value:eq:${ndpVersion}&filter=attributeValues.value:eq:true&fields=options[id,name,code]`,
                },
                dataElementGroupSets: {
                    resource: `dataElementGroupSets?filter=attributeValues.value:eq:${ndpVersion}&filter=attributeValues.value:eq:${attributeValue}&fields=id,name,displayName,code,dataElementGroups[id,name,code,attributeValues],attributeValues&paging=false`,
                },
            });
            const {
                optionSets: {
                    optionSets: [{ options }],
                },
                dataElementGroupSets: { dataElementGroupSets },
            } = response as unknown as {
                optionSets: {
                    optionSets: Array<{
                        options: Array<{
                            id: string;
                            name: string;
                            code: string;
                        }>;
                    }>;
                };
                dataElementGroupSets: {
                    dataElementGroupSets: DataElementGroupSet[];
                };
            };
            return { options, dataElementGroupSets };
        },
    });
};

export const orgUnitQueryOptions = (
    orgUnit: string,
    engine: ReturnType<typeof useDataEngine>,
) => {
    return queryOptions({
        queryKey: ["organisations", orgUnit],
        queryFn: async () => {
            const response = await engine.query({
                organisationUnits: {
                    resource: `organisationUnits/${orgUnit}`,
                    params: {
                        fields: "children[id,name,leaf]",
                    },
                },
            });
            const {
                organisationUnits: { children },
            } = response as unknown as {
                organisationUnits: {
                    children: Array<{
                        id: string;
                        name: string;
                        leaf: boolean;
                    }>;
                };
            };

            if (children.length === 0) {
                return "No children found";
            }

            const organisationUnits = children.map(({ id, name, leaf }) => {
                const current: OrgUnit = {
                    id,
                    title: name,
                    isLeaf: leaf,
                    value: id,
                    key: id,
                    pId: orgUnit,
                };
                return current;
            });
            await db.dataViewOrgUnits.bulkPut(organisationUnits);
            return "Done";
        },
    });
};

export const analyticsQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    { deg, pe, ou, degs, category, categoryOptions }: GoalSearch,
) => {
    return queryOptions({
        queryKey: [
            "analytics",
            ...(pe ?? []),
            degs,
            deg,
            ou,
            category,
            ...(categoryOptions ?? []),
        ],
        queryFn: async () => {
            if (
                deg === undefined ||
                pe === undefined ||
                ou === undefined ||
                category === undefined ||
                categoryOptions === undefined
            ) {
                throw new Error(
                    "Organisation unit and/or period and/or dimension are missing",
                );
            }

            const params = new URLSearchParams({
                displayProperty: "NAME",
                includeMetadataDetails: "true",
            });
            [
                `${category}:${categoryOptions.join(";")}`,
                `pe:${pe.join(";")}`,
                `dx:${deg}`,
            ].forEach((dimension) => params.append("dimension", dimension));
            [`ou:${ou}`].forEach((filter) => params.append("filter", filter));
            const response = await engine.query({
                analytics: {
                    resource: `analytics?${params.toString()}`,
                },
            });
            const { analytics } = response as unknown as {
                analytics: Analytics;
            };

            const response2 = await engine.query({
                dataElements: {
                    resource: `dataElements.json`,
                    params: {
                        filter: `id:in:[${analytics.metaData.dimensions[
                            "dx"
                        ]?.join(",")}]`,
                        paging: "false",
                        fields: "id,name,attributeValues[attribute[id,name],value],dataElementGroups[id,name,attributeValues[attribute[id,name],value],groupSets[id,name,attributeValues[attribute[id,name],value]]]",
                    },
                },
            });
            const {
                dataElements: { dataElements },
            } = response2 as unknown as {
                dataElements: {
                    dataElements: DataElement[];
                };
            };
            const dataElementsMap = flattenDataElements(dataElements);
            return { analytics, dataElements: dataElementsMap };
        },
        enabled: deg !== undefined && pe !== undefined && ou !== undefined,
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const dataStoreQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    ndpVersions: Array<Option>,
) => {
    return queryOptions({
        queryKey: ["dataStore"],
        queryFn: async () => {
            const data: Record<string, any> = {};
            for (const version of ndpVersions) {
                try {
                    const response = await engine.query({
                        data: {
                            resource: `dataStore/ndp-configurations/${version.code}`,
                        },
                    });
                    data[version.code] = response;
                } catch (error) {
                    try {
                        await engine.mutate({
                            resource: `dataStore/ndp-configurations/${version.code}`,
                            data: {
                                baseline: "-",
                            },
                            type: "create",
                        });
                    } catch (error) {}
                }
            }
            return data;
        },
    });
};
