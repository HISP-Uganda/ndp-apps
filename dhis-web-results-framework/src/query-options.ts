import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import { chunk, groupBy, orderBy, sum, uniqBy } from "lodash";
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
    ScorecardData,
} from "./types";
import {
    convertAnalyticsToObjects,
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
                        fields: "id,categoryOptions[id,name]",
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
                            name: string;
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

            const allAreLeaves = organisationUnits.every((ou) => ou.isLeaf);

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
                categoryOptions: new Map(
                    categories
                        .flatMap((c) => c.categoryOptions)
                        .map((co) => [co.id, co.name]),
                ),
                votes: central.organisationUnits.filter((ou) => {
                    if (allAreLeaves) {
                        return dataViewOrganisationUnits.some(
                            (dvou) => dvou.id === ou.id,
                        );
                    }
                    return true;
                }),
                allAreLeaves,
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
                        fields: "id,name,code,aggregationType,dataSetElements[dataSet[name,periodType,id,organisationUnits[code,displayName,id]]],attributeValues[attribute[id,name],value],dataElementGroups[id,name,code,attributeValues[attribute[id,name],value],groupSets[id,name,attributeValues[attribute[id,name],value]]]",
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
    category,
    categoryOptions,
    isSum,
    votes,
}: {
    engine: ReturnType<typeof useDataEngine>;
    dataElementGroupSets: DataElementGroupSet[];
    pe?: string;
    quarters?: boolean;
    category?: string;
    categoryOptions?: string[];
    isSum?: boolean;
    votes: Array<Omit<DHIS2OrgUnit, "leaf" | "dataSets" | "parent">>;
}) => {
    return queryOptions({
        queryKey: [
            "dataElementsFromGroup",
            dataElementGroupSets.length,
            pe,
            category,
            ...(categoryOptions ?? []),
        ],
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
            params.append(
                "dimension",
                `ou:${votes.map((v) => v.id).join(";")}`,
            );
            params.append(
                "dimension",
                `${category}:${categoryOptions?.join(";")}`,
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
                                    (
                                        analyticsCombined.metaData.dimensions?.[
                                            "ou"
                                        ] ?? []
                                    ).concat(
                                        analytics.metaData.dimensions["ou"],
                                    ),
                                ),
                            ],
                            dx: [
                                ...new Set(
                                    (
                                        analyticsCombined.metaData.dimensions[
                                            "dx"
                                        ] ?? []
                                    ).concat(
                                        analytics.metaData.dimensions["dx"],
                                    ),
                                ),
                            ],
                            pe: [
                                ...new Set(
                                    (
                                        analyticsCombined.metaData.dimensions[
                                            "pe"
                                        ] ?? []
                                    ).concat(
                                        analytics.metaData.dimensions["pe"],
                                    ),
                                ),
                            ],
                            [category!]: [
                                ...new Set(
                                    (
                                        analyticsCombined.metaData.dimensions[
                                            category!
                                        ] ?? []
                                    ).concat(
                                        analytics.metaData.dimensions[
                                            category!
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
                (header) => header.name === category,
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

            const data: ScorecardData = new Map();

            for (const ou of analyticsCombined.metaData.dimensions["ou"]) {
                const dataElementsForOrgUnit = dataElementsByOu.get(ou) || [];
                const grouped = dataElementsForOrgUnit.map((de) => {
                    const reportedDataElements =
                        analyticsByKey.get(`${ou}_${de}`) || [];

                    if (reportedDataElements.length === 0) {
                        return {
                            dataElement: de,
                            performance: 0,
                            status: "nd",
                        };
                    }

                    const baseline = orderBy(
                        reportedDataElements.filter(
                            (v) =>
                                categoryOptions &&
                                v.goalStatus === categoryOptions.at(-3),
                        ),
                        "period",
                        "desc",
                    );

                    const target = orderBy(
                        reportedDataElements.filter(
                            (v) =>
                                categoryOptions &&
                                v.goalStatus === categoryOptions.at(-2),
                        ),
                        "period",
                        "desc",
                    );
                    const actual = orderBy(
                        reportedDataElements.filter((v) => {
                            return (
                                categoryOptions &&
                                v.goalStatus === categoryOptions.at(-1)
                            );
                        }),
                        "period",
                        "desc",
                    );

                    if (target && actual.length > 0) {
                        const actualTotal = isSum
                            ? sum(actual.map((a) => Number(a.value)))
                            : Number(actual[0]?.value ?? 0);
                        const targetTotal = isSum
                            ? sum(target.map((t) => Number(t.value)))
                            : Number(target[0]?.value ?? 0);
                        const baselineTotal = isSum
                            ? sum(baseline.map((t) => Number(t.value)))
                            : Number(baseline[0]?.value ?? 0);
                        const performanceRation = actualTotal / targetTotal;
                        const performance = performanceRation * 100;
                        if (isNaN(performance) || !isFinite(performance)) {
                            return {
                                dataElement: de,
                                performance,
                                status: "nd",
                                target: targetTotal,
                                actual: actualTotal,
                                baseline: baselineTotal,
                            };
                        }
                        if (performance >= 100) {
                            return {
                                dataElement: de,
                                performance,
                                status: "a",
                                target: targetTotal,
                                actual: actualTotal,
                                baseline: baselineTotal,
                            };
                        }

                        if (performance >= 75 && performance < 100) {
                            return {
                                dataElement: de,
                                performance,
                                status: "m",
                                target: targetTotal,
                                actual: actualTotal,
                                baseline: baselineTotal,
                            };
                        }

                        if (performance < 75) {
                            return {
                                dataElement: de,
                                performance,
                                status: "n",
                                target: targetTotal,
                                actual: actualTotal,
                                baseline: baselineTotal,
                            };
                        }

                        return {
                            dataElement: de,
                            performance,
                            status: "nd",
                            target: targetTotal,
                            actual: actualTotal,
                            baseline: baselineTotal,
                        };
                    }
                    return {
                        dataElement: de,
                        performance: 0,
                        status: "nd",
                        target: 0,
                        actual: 0,
                        baseline: 0,
                    };
                });

                const sumActual = sum(grouped.map((g) => g.actual || 0));
                const sumTarget = sum(grouped.map((g) => g.target || 0));
                const baselineTotal = sum(grouped.map((g) => g.baseline || 0));
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

                const percentAchieved =
                    denominator !== 0 ? achieved / denominator : 0;
                const percentModeratelyAchieved =
                    denominator !== 0 ? moderatelyAchieved / denominator : 0;
                const percentNotAchieved =
                    denominator !== 0 ? notAchieved / denominator : 0;
                const percentNoData =
                    denominator !== 0 ? noData / denominator : 0;

                const achievedWeighted = percentAchieved * (1 / 2);
                const moderatelyAchievedWeighted =
                    percentModeratelyAchieved * (7 / 20);
                const notAchievedWeighted = percentNotAchieved * (3 / 20);
                const noDataWeighted = percentNoData * (0 / 200);

                const totalWeighted =
                    achievedWeighted +
                    moderatelyAchievedWeighted +
                    notAchievedWeighted +
                    noDataWeighted;
                data.set(ou, {
                    denominator,
                    achieved,
                    moderatelyAchieved,
                    notAchieved,
                    noData,
                    percentAchieved,
                    percentModeratelyAchieved,
                    percentNotAchieved,
                    percentNoData,
                    achievedWeighted,
                    moderatelyAchievedWeighted,
                    notAchievedWeighted,
                    noDataWeighted,
                    totalWeighted,
                    actual: sumActual,
                    target: sumTarget,
                    baseline: baselineTotal,
                    performance: sumTarget === 0 ? 0 : sumActual / sumTarget,
                });
            }
            return data;
        },
        enabled:
            pe !== undefined &&
            category !== undefined &&
            categoryOptions !== undefined &&
            dataElementGroupSets.length > 0 &&
            categoryOptions.length > 0,
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
                        resource: `dataElementGroupSets?filter=attributeValues.value:eq:${ndpVersion}&fields=id,name,code,dataElementGroups[id,name,code,attributeValues[attribute[id,name],value],dataElements[id,name,code,attributeValues[attribute[id,name],value],dataSetElements[dataSet[id,organisationUnits[id]]]]],attributeValues[attribute[id,name],value]&paging=false`,
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

export const voteProgramOutcomesQueryOptions = ({
    engine,
    ndpVersion,
    ou,
    pe,
    quarters,
    searchKey,
    searchValue,
    programs,
    finalGrouping,
}: {
    engine: ReturnType<typeof useDataEngine>;
    ndpVersion: string;
    ou: string;
    pe?: string;
    quarters?: boolean;
    searchKey?: string;
    searchValue?: string;
    programs: Option[];
    finalGrouping: string;
}) => {
    return queryOptions({
        queryKey: [
            "vote-program-outcomes",
            ndpVersion,
            ou,
            quarters,
            pe,
            searchKey,
            searchValue,
            finalGrouping,
            programs.map((p) => p.code).join(","),
        ],
        queryFn: async () => {
            const percentFormatter = new Intl.NumberFormat("en-US", {
                style: "percent",
            });
            let dataElements = await db.dataElements
                .where({ NDP: ndpVersion, organisationUnitId: ou })
                .toArray();

            if (searchKey && searchValue) {
							console.log('Filtering data elements by', searchKey, searchValue);
                dataElements = uniqBy(
                    dataElements.filter((de) => de[searchKey] === searchValue),
                    "id",
                );
            } else {
							console.log('No search key/value provided, using all data elements for org unit', ou);
                dataElements = uniqBy(dataElements, "id");
            }

            const allDataElementGroups = groupBy(
                dataElements,
                "dataElementGroupId",
            );

            let periodFilter = pe;
            if (quarters) {
                const year = Number(pe?.slice(0, 4));
                const q1 = `${year}Q3`;
                const q2 = `${year}Q4`;
                const q3 = `${year + 1}Q1`;
                const q4 = `${year + 1}Q2`;
                periodFilter = `${pe};${q1};${q2};${q3};${q4}`;
            }

            const params = new URLSearchParams({
                includeMetadataDetails: "true",
            });
            params.append("filter", `ou:${ou}`);
            params.append(
                "dimension",
                `Duw5yep8Vae:bqIaasqpTas;Px8Lqkxy2si;HKtncMjp06U`,
            );
            params.append("dimension", `pe:${periodFilter}`);
            params.append(
                "dimension",
                `dx:${Object.keys(allDataElementGroups)
                    .map((de) => `DE_GROUP-${de}`)
                    .join(";")}`,
            );

            const { analytics } = (await engine.query({
                analytics: {
                    resource: `analytics??${params.toString()}`,
                },
            })) as { analytics: Analytics };

            const values = convertAnalyticsToObjects(analytics);

            const allProcessed = dataElements.map((de) => {
                const matched = values.filter((v) => v.dx === de.id);
                const target = matched.find(
                    (v) => v.Duw5yep8Vae === "Px8Lqkxy2si",
                );
                const actual = matched.filter((v) => {
                    if (quarters) {
                        return (
                            v.Duw5yep8Vae === "HKtncMjp06U" &&
                            v.pe.includes("Q")
                        );
                    }
                    return v.Duw5yep8Vae === "HKtncMjp06U";
                });
                const orderedActuals = orderBy(actual, "pe", "desc");

                if (target && orderedActuals.length > 0) {
                    const latestActual = Number(orderedActuals[0].value);
                    const targetValue = Number(target.value);
                    const performance = (latestActual / targetValue) * 100;
                    if (isNaN(performance) || !isFinite(performance)) {
                        return {
                            ...de,
                            performance,
                            status: "nd",
                        };
                    }

                    if (performance >= 100) {
                        return {
                            ...de,
                            performance,
                            status: "a",
                        };
                    }

                    if (performance >= 75 && performance < 100) {
                        return {
                            ...de,
                            performance,
                            status: "m",
                        };
                    }

                    if (performance < 75) {
                        return {
                            ...de,
                            performance,
                            status: "n",
                        };
                    }

                    return {
                        ...de,
                        performance,
                        status: "nd",
                    };
                }
                return {
                    ...de,
                    performance: 0,
                    status: "nd",
                };
            });
            const processed = Object.values(
                groupBy(allProcessed, finalGrouping),
            ).map((groups) => {
                const total = groups.length;
                const current = groups[0];
                const groupedPerformance = groupBy(groups, "status");
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

                return {
                    ...current,
                    achieved,
                    moderatelyAchieved,
                    notAchieved,
                    noData,
                    percentAchieved: percentFormatter.format(achieved / total),
                    percentModeratelyAchieved: percentFormatter.format(
                        moderatelyAchieved / total,
                    ),
                    percentNotAchieved: percentFormatter.format(
                        notAchieved / total,
                    ),
                    percentNoData: percentFormatter.format(noData / total),
                    total,
                    program: programs?.find(
                        (p) => p.code === current["UBWSASWdyfi"],
                    )?.name,
                    groups,
                };
            });
            return processed;
        },
        enabled: ou !== undefined && ou !== "" && pe !== undefined && pe !== "",
    });
};
