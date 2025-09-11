import { useDataEngine } from "@dhis2/app-runtime";
import { queryOptions } from "@tanstack/react-query";
import {
    DataSetValues,
    DHIS2OrgUnit,
    IDataElement,
    IDataSet,
    Search,
} from "./types";
import { convertToAntdTree } from "./utils";
import { db } from "./db";

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
                            fields: "id,name,leaf,parent,dataSets[id,name,displayName,periodType]",
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

            const orgUnitDataSets = allUnits.reduce<
                Record<
                    string,
                    Array<{
                        id: string;
                        name: string;
                        periodType: string;
                        orgUnit: string;
                    }>
                >
            >((acc, unit) => {
                if (unit.dataSets) {
                    acc[unit.id] = unit.dataSets.flatMap((ds) => {
                        if (ds.name.includes("IV")) {
                            return {
                                id: ds.id,
                                name: ds.name,
                                periodType: ds.periodType,
                                orgUnit: unit.name,
                            };
                        }
                        return [];
                    });
                } else {
                    acc[unit.id] = [];
                }
                return acc;
            }, {});
            return {
                organisationTree: convertToAntdTree(allUnits),
                orgUnitDataSets,
            };
        },
    });
};

export const dataSetValuesQueryOptions = (
    engine: ReturnType<typeof useDataEngine>,
    search: Search,
) => {
    return queryOptions({
        queryKey: ["data-values", search.orgUnit, search.dataSet, search.pe],
        queryFn: async () => {
            const { baseline, dataSet } = (await engine.query({
                baseline: {
                    resource: "dataStore/ndp-configurations",
                    params: {
                        fields: "baseline",
                        paging: false,
                    },
                },
                dataSet: {
                    resource: `dataSets/${search.dataSet}.json`,
                    params: {
                        fields: "name,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name]],categories[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,formName,valueType,optionSetValue,optionSet,code[options[id,name,code]],categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name]],categories[id,name,categoryOptions[id,name]]]]]",
                    },
                },
            })) as unknown as {
                dataSet: IDataSet;
                baseline: Array<{ key: string; baseline: string }>;
            };
            let targetYear = search.pe;
            const dataSetNames = dataSet.name.split(" - ");
            const baselineYear =
                baseline
                    .find((b) => b.key === dataSetNames[1])
                    ?.baseline.split(" ")
                    .join("") ?? "2023July";

            let query: Record<string, any> = {
                dataSetValues: {
                    resource: "dataValueSets",
                    params: {
                        orgUnit: search.orgUnit,
                        dataSet: search.dataSet,
                        period: search.pe,
                    },
                },
                baselineDataValues: {
                    resource: "dataValueSets",
                    params: {
                        orgUnit: search.orgUnit,
                        dataSet: search.dataSet,
                        period: baselineYear,
                    },
                },
            };

            if (search.pe?.includes("Q")) {
                const [year, quarter] = search.pe.split("Q");
                const prev =
                    quarter === "1" || quarter === "2"
                        ? String(Number(year) - 1)
                        : year;
                targetYear = `${prev}July`;
                query = {
                    ...query,
                    targetDataValues: {
                        resource: "dataValueSets",
                        params: {
                            orgUnit: search.orgUnit,
                            dataSet: search.dataSet,
                            period: targetYear,
                        },
                    },
                };
            }

            const { dataSetValues, baselineDataValues, targetDataValues } =
                (await engine.query(query)) as unknown as {
                    dataSetValues: DataSetValues;
                    baselineDataValues: DataSetValues;
                    targetDataValues: DataSetValues;
                };

            const groupedDataSetElements = dataSet.dataSetElements.reduce(
                (acc, el) => {
                    const de = el.dataElement;
                    if (!acc[de.categoryCombo.id]) {
                        acc[de.categoryCombo.id] = [];
                    }
                    acc[de.categoryCombo.id].push(de);
                    return acc;
                },
                {} as Record<string, IDataElement[]>,
            );

            const allDataValues: DataSetValues = {
                ...dataSetValues,
                dataValues: [
                    ...(dataSetValues?.dataValues ?? []),
                    ...(targetDataValues?.dataValues ?? []),
                    ...(baselineDataValues?.dataValues ?? []),
                ],
            };

            await db.dataValues.clear();
            await db.dataValues.bulkPut(allDataValues.dataValues);

            const dataValues = allDataValues.dataValues.reduce((acc, dv) => {
                const key = `${dv.dataElement}_${dv.attributeOptionCombo}_${dv.categoryOptionCombo}`;
                acc[key] = dv.value;
                return acc;
            }, {} as Record<string, string | undefined>);

            return {
                dataSetValues: allDataValues,
                dataSet,
                groupedDataSetElements,
                dataValues,
                baselineYear,
                targetYear,
            };
        },
        enabled: !!search.orgUnit && !!search.dataSet && !!search.pe,
        refetchOnWindowFocus: false,
    });
};
