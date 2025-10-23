import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import { chunk, groupBy, orderBy, uniqBy } from "lodash";
import { db } from "./db";
import {
    Analytics,
    DataElement,
    DataElementGroupSet,
    DataElementGroupSetResponse,
    DHIS2OrgUnit,
    FlattenedDataElement,
    GoalSearch,
    Option,
    OptionSet,
    OrgUnit,
} from "./types";
import {
    flattenDataElementGroupSetsResponse,
    flattenDataElements,
} from "./utils";

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
                central: {
                    resource: "organisationUnits/ONXWQ2EoOcP",
                    params: { level: 1, fields: "id,name,code", paging: false },
                },
            });

            const {
                orgUnits: { dataViewOrganisationUnits },
                options: { options },
                ndpVersions: { options: ndpVersions },
                programs: { options: programs },
                programGoals: { options: programGoals },
                categories: { categories },
                central,
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
                central: {
                    organisationUnits: Array<
                        Omit<DHIS2OrgUnit, "leaf" | "dataSets" | "parent">
                    >;
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
                votes: central.organisationUnits,
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
                        fields: "id,name,aggregationType,dataSetElements[dataSet[name,periodType,id,organisationUnits[code,displayName,id]]],attributeValues[attribute[id,name],value],dataElementGroups[id,name,attributeValues[attribute[id,name],value],groupSets[id,name,attributeValues[attribute[id,name],value]]]",
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

export const dataElementsFromGroupQueryOptions = ({
    engine,
    dataElementGroupSets,
    pe,
    quarters,
}: {
    engine: ReturnType<typeof useDataEngine>;
    dataElementGroupSets: DataElementGroupSet[];
    pe?: string;
    quarters?: boolean;
}) => {
    return queryOptions({
        queryKey: ["dataElementsFromGroup", dataElementGroupSets.length, pe],
        queryFn: async () => {
            if (pe === undefined) {
                throw new Error("Period is undefined");
            }
            if (!dataElementGroupSets.length) {
                return new Map();
            }
            let periodFilter = pe;
            if (quarters) {
                const year = Number(pe?.slice(0, 4));
                const q1 = `${year}Q3`;
                const q2 = `${year}Q4`;
                const q3 = `${year + 1}Q1`;
                const q4 = `${year + 1}Q2`;
                periodFilter = `${pe};${q1};${q2};${q3};${q4}`;
            }
            const dataElementGroups = dataElementGroupSets.flatMap(
                ({ dataElementGroups }) =>
                    dataElementGroups.map((deg) => `DE_GROUP-${deg.id}`),
            );

            if (!dataElementGroups.length) {
                return new Map();
            }

            const params = new URLSearchParams({
                includeMetadataDetails: "true",
            });
            params.append("dimension", `ou:ONXWQ2EoOcP;LEVEL-3`);
            params.append(
                "dimension",
                `Duw5yep8Vae:bqIaasqpTas;Px8Lqkxy2si;HKtncMjp06U`,
            );
            params.append("dimension", `pe:${periodFilter}`);

            const analyticsChunkSize = 100;

            let analyticsCombined: Analytics = {
                metaData: {
                    dimensions: {
                        dx: [],
                        ou: [],
                        pe: [],
                        Duw5yep8Vae: [],
                    },
                    items: {},
                },
                headers: [],
                rows: [],
                width: 4,
                height: 0,
                headerWidth: 4,
            };

            for (const degIds of chunk(dataElementGroups, analyticsChunkSize)) {
                const currentParams = new URLSearchParams(params);
                currentParams.append("dimension", `dx:${degIds.join(";")}`);
                const { analytics } = (await engine.query({
                    analytics: {
                        resource: `analytics??${currentParams.toString()}`,
                    },
                })) as { analytics: Analytics };

                analyticsCombined = {
                    ...analyticsCombined,
                    metaData: {
                        ...analyticsCombined.metaData,
                        dimensions: {
                            ...analyticsCombined.metaData.dimensions,
                            ...analytics.metaData.dimensions,
                            ou: [
                                ...new Set(
                                    analyticsCombined.metaData.dimensions[
                                        "ou"
                                    ].concat(
                                        analytics.metaData.dimensions["ou"],
                                    ),
                                ),
                            ],
                            dx: [
                                ...new Set(
                                    analyticsCombined.metaData.dimensions[
                                        "dx"
                                    ].concat(
                                        analytics.metaData.dimensions["dx"],
                                    ),
                                ),
                            ],
                            pe: [
                                ...new Set(
                                    analyticsCombined.metaData.dimensions[
                                        "pe"
                                    ].concat(
                                        analytics.metaData.dimensions["pe"],
                                    ),
                                ),
                            ],
                            Duw5yep8Vae: [
                                ...new Set(
                                    analyticsCombined.metaData.dimensions[
                                        "Duw5yep8Vae"
                                    ].concat(
                                        analytics.metaData.dimensions[
                                            "Duw5yep8Vae"
                                        ],
                                    ),
                                ),
                            ],
                        },
                        items: {
                            ...analyticsCombined.metaData.items,
                            ...analytics.metaData.items,
                        },
                    },
                    headers: uniqBy(
                        [...analyticsCombined.headers, ...analytics.headers],
                        "name",
                    ),
                    rows: analyticsCombined.rows.concat(analytics.rows),
                };
            }

            if (analyticsCombined.rows.length === 0) {
                return new Map();
            }
            const dataElementsByOu = new Map<string, string[]>();

            const dataElementQuery = await db.dataElements
                .where("dataElementGroupId")
                .anyOf(
                    dataElementGroups.map((id) => id.replace("DE_GROUP-", "")),
                )
                .toArray();

            dataElementQuery.forEach(({ id, organisationUnitId }) => {
                if (!dataElementsByOu.has(organisationUnitId)) {
                    dataElementsByOu.set(organisationUnitId, []);
                }
                dataElementsByOu.get(organisationUnitId)!.push(id);
            });

            const dxIndex = analyticsCombined.headers.findIndex(
                (header) => header.name === "dx",
            );
            const ouIndex = analyticsCombined.headers.findIndex(
                (header) => header.name === "ou",
            );
            const peIndex = analyticsCombined.headers.findIndex(
                (header) => header.name === "pe",
            );
            const Duw5yep8VaeIndex = analyticsCombined.headers.findIndex(
                (header) => header.name === "Duw5yep8Vae",
            );
            const valueIndex = analyticsCombined.headers.findIndex(
                (header) => header.name === "value",
            );

            const analyticsByKey = new Map<
                string,
                Array<{
                    dataElement: string;
                    value: string;
                    goalStatus: string;
                    period: string;
                }>
            >();

            analyticsCombined.rows.forEach((row) => {
                const key = `${row[ouIndex]}_${row[dxIndex]}`;
                if (!analyticsByKey.has(key)) {
                    analyticsByKey.set(key, []);
                }
                analyticsByKey.get(key)!.push({
                    dataElement: row[dxIndex],
                    value: row[valueIndex],
                    goalStatus: row[Duw5yep8VaeIndex],
                    period: row[peIndex],
                });
            });
            const percentFormatter = new Intl.NumberFormat("en-US", {
                style: "percent",
            });
            const data: Map<
                string,
                {
                    denominator: number;
                    achieved: number;
                    moderatelyAchieved: number;
                    notAchieved: number;
                    noData: number;
                    percentAchieved: string;
                    percentModeratelyAchieved: string;
                    percentNotAchieved: string;
                    percentNoData: string;
                }
            > = new Map();

            for (const ou of analyticsCombined.metaData.dimensions["ou"]) {
                const dataElementsForOrgUnit = dataElementsByOu.get(ou) || [];
                console.log(
                    `Data Elements for Org Unit ${ou}:`,
                    dataElementsForOrgUnit,
                );
                const grouped = dataElementsForOrgUnit.map((de) => {
                    // O(1) lookup instead of O(n) flatMap
                    const reportedDataElements =
                        analyticsByKey.get(`${ou}_${de}`) || [];

                    if (reportedDataElements.length === 0) {
                        return {
                            dataElement: de,
                            performance: 0,
                            status: "nd",
                        };
                    }

                    const target = reportedDataElements.find(
                        (v) => v.goalStatus === "Px8Lqkxy2si",
                    );
                    const actual = reportedDataElements.filter((v) => {
                        if (quarters) {
                            return (
                                v.goalStatus === "HKtncMjp06U" &&
                                v.period.includes("Q")
                            );
                        }
                        return v.goalStatus === "HKtncMjp06U";
                    });
                    const orderedActuals = orderBy(actual, "period", "desc");

                    if (target && orderedActuals.length > 0) {
                        const latestActual = Number(orderedActuals[0].value);
                        const targetValue = Number(target.value);
                        const performance = (latestActual / targetValue) * 100;
                        if (isNaN(performance) || !isFinite(performance)) {
                            return {
                                dataElement: de,
                                performance,
                                status: "nd",
                            };
                        }

                        if (performance >= 100) {
                            return {
                                dataElement: de,
                                performance,
                                status: "a",
                            };
                        }

                        if (performance >= 75 && performance < 100) {
                            return {
                                dataElement: de,
                                performance,
                                status: "m",
                            };
                        }

                        if (performance < 75) {
                            return {
                                dataElement: de,
                                performance,
                                status: "n",
                            };
                        }

                        return {
                            dataElement: de,
                            performance,
                            status: "nd",
                        };
                    }
                    return {
                        dataElement: de,
                        performance: 0,
                        status: "nd",
                    };
                });
                const groupedPerformance = groupBy(grouped, "status");
                const denominator = dataElementsForOrgUnit.length;
                const achieved = groupedPerformance["a"]
                    ? groupedPerformance["a"].length
                    : 0;
                const moderatelyAchieved = groupedPerformance["m"]
                    ? groupedPerformance["m"].length
                    : 0;
                const notAchieved = groupedPerformance["n"]
                    ? groupedPerformance["n"].length
                    : 0;
                const noData = groupedPerformance["nd"]
                    ? groupedPerformance["nd"].length
                    : 0;
                data.set(ou, {
                    denominator,
                    achieved,
                    moderatelyAchieved,
                    notAchieved,
                    noData,
                    percentAchieved: percentFormatter.format(
                        denominator !== 0 ? achieved / denominator : 0,
                    ),
                    percentModeratelyAchieved: percentFormatter.format(
                        denominator !== 0
                            ? moderatelyAchieved / denominator
                            : 0,
                    ),
                    percentNotAchieved: percentFormatter.format(
                        denominator !== 0 ? notAchieved / denominator : 0,
                    ),
                    percentNoData: percentFormatter.format(
                        denominator !== 0 ? noData / denominator : 0,
                    ),
                });
            }
            return data;
        },
        enabled: pe !== undefined,
        retry: false,
    });
};

export const ndpIndicatorsQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    ndpVersion: string,
) => {
    return queryOptions({
        queryKey: ["ndp-indicators", ndpVersion],
        queryFn: async () => {
            const doneCount = await db.dataElements
                .where("NDP")
                .equals(ndpVersion)
                .count();
            let dataElements: FlattenedDataElement[] = [];
            if (doneCount === 0) {
                const response = (await engine.query({
                    dataElementGroupSets: {
                        resource: `dataElementGroupSets?filter=attributeValues.value:eq:${ndpVersion}&fields=id,name,dataElementGroups[id,name,attributeValues[attribute[id,name],value],dataElements[id,name,attributeValues[attribute[id,name],value],dataSetElements[dataSet[organisationUnits[id]]]]],attributeValues[attribute[id,name],value]&paging=false`,
                    },
                })) as {
                    dataElementGroupSets: DataElementGroupSetResponse;
                };

                const data = flattenDataElementGroupSetsResponse(
                    response.dataElementGroupSets,
                );

                dataElements = data;

                await db.dataElements.bulkPut(data);
            }
            return "Not implemented yet";
        },
    });
};
