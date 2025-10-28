import { SelectProps, TableProps } from "antd";
import dayjs from "dayjs";
import { fromPairs, groupBy, uniq, uniqBy } from "lodash";
import {
    Analytics,
    DataElement,
    DataElementGroupSet,
    DataElementGroupSetResponse,
    DHIS2OrgUnit,
    FlattenedDataElement,
    GoalSearch,
    MapPredicate,
    ScorecardData,
} from "./types";
import { useDataEngine } from "@dhis2/app-runtime";

export const prepareVisionData = ({
    data,
    dataElements,
}: {
    data: Analytics;
    dataElements: Map<string, Record<string, string>>;
}): Array<Record<string, string | undefined>> | undefined => {
    return data.metaData.dimensions["dx"]?.map((x) => {
        const current: Map<string, string> = new Map();
        data.metaData.dimensions["pe"]?.forEach((pe) => {
            data.metaData.dimensions["Duw5yep8Vae"].forEach((dim) => {
                const search = data.rows.find(
                    (row) => row[0] === x && row[3] === pe && row[2] === dim,
                );
                current.set(`${pe}${dim}`, search?.[4] ?? "");
            });
        });

        return {
            id: x,
            ...dataElements.get(x),
            name: data.metaData.items[x].name,
            code: data.metaData.items[x].code,
            ...Object.fromEntries(current),
        };
    });
};

export const programOnly = new Set([
    "project-performance",
    "policy-actions",
    "output",
]);
export const programAndDegs = new Set([
    "objective",
    "sub-programme",
    "sub-intervention4action",
]);
export const onlyDegs = new Set(["goal", "resultsFrameworkObjective"]);

export const flattenDataElements = (dataElements: DataElement[]) => {
    return new Map(
        dataElements.map(
            ({
                id,
                name,
                aggregationType,
                dataElementGroups,
                attributeValues,
                dataSetElements,
            }) => {
                const [
                    {
                        dataSet: {
                            periodType,
                            organisationUnits: [{ code, displayName }],
                        },
                    },
                ] = dataSetElements;
                const obj: Map<string, string> = new Map();
                obj.set(id, name);
                obj.set("id", id);
                obj.set("dataSetPeriodType", periodType);
                obj.set("dataSetOrganisationUnitCode", code);
                obj.set("dataSetOrganisationUnitName", displayName);
                obj.set("aggregationType", aggregationType);
                attributeValues.forEach(
                    ({ value, attribute: { id, name } }) => {
                        obj.set(id, value);
                        obj.set(name, value);
                    },
                );
                dataElementGroups.forEach(
                    ({ id, name, groupSets, attributeValues }) => {
                        obj.set(id, name);
                        attributeValues.forEach(
                            ({ value, attribute: { id, name } }) => {
                                obj.set(id, value);
                                obj.set(name, value);
                            },
                        );
                        groupSets.forEach(({ id, name, attributeValues }) => {
                            obj.set(id, name);
                            attributeValues.forEach(
                                ({ value, attribute: { id, name } }) => {
                                    obj.set(id, value);
                                    obj.set(name, value);
                                },
                            );
                        });
                    },
                );
                return [id, Object.fromEntries(obj)];
            },
        ),
    );
};

export const flattenDataElementGroupSets = (
    dataElementGroupSets: DataElementGroupSet[],
) => {
    const allDataElements = dataElementGroupSets.flatMap(
        ({ attributeValues, id, name, dataElementGroups }) => {
            const degs = {
                ...fromPairs(
                    attributeValues.map(({ value, attribute: { id } }) => [
                        id,
                        value,
                    ]),
                ),
                ...fromPairs(
                    attributeValues.map(({ value, attribute: { name } }) => [
                        name,
                        value,
                    ]),
                ),
                degsName: name,
                degsId: id,
            };
            return dataElementGroups.flatMap(
                ({ id, attributeValues, name, dataElements }) => {
                    const deg = {
                        ...fromPairs(
                            attributeValues.map(
                                ({ value, attribute: { id } }) => [id, value],
                            ),
                        ),
                        ...fromPairs(
                            attributeValues.map(
                                ({ value, attribute: { name } }) => [
                                    name,
                                    value,
                                ],
                            ),
                        ),
                        degName: name,
                        degId: id,
                    };
                    return dataElements.map(
                        ({ attributeValues, id, name }) => ({
                            id,
                            name,
                            ...fromPairs(
                                attributeValues.map(
                                    ({ value, attribute: { id } }) => [
                                        id,
                                        value,
                                    ],
                                ),
                            ),
                            ...fromPairs(
                                attributeValues.map(
                                    ({ value, attribute: { name } }) => [
                                        name,
                                        value,
                                    ],
                                ),
                            ),
                            ...degs,
                            ...deg,
                        }),
                    );
                },
            );
        },
    );

    return new Map<string, Record<string, string>>(
        Object.entries(groupBy(allDataElements, "id")).map(([id, val]) => [
            id,
            Object.assign({}, ...val),
        ]),
    );
};

export const convertToDataElementGroupSetsOptions = (
    dataElementGroupSets: DataElementGroupSet[],
): SelectProps["options"] => {
    return dataElementGroupSets.map(({ id, name }) => ({
        value: id,
        label: name,
    }));
};
export const convertToDataElementGroupsOptions = (
    dataElementGroupSet: string | undefined,
    dataElementGroupSets: DataElementGroupSet[],
): SelectProps["options"] => {
    return dataElementGroupSets.flatMap(({ dataElementGroups, id }) => {
        if (
            // dataElementGroupSet !== undefined &&
            // dataElementGroupSet !== "All" &&
            dataElementGroupSet !== id
        ) {
            return [];
        }
        return dataElementGroups.map(({ id, name }) => ({
            value: id,
            label: name,
        }));
    });
};

export const convertToDataElementsOptions = (
    dataElementGroupSets: DataElementGroupSet[],
): SelectProps["options"] => {
    return dataElementGroupSets.flatMap(({ dataElementGroups }) =>
        dataElementGroups.flatMap(({ dataElements }) =>
            dataElements.map(({ id, name }) => ({
                value: id,
                label: name,
            })),
        ),
    );
};

export const createOptions2 = (labels: string[], values: string[]) => {
    if (labels.length === values.length) {
        return labels.map((label, index) => {
            return {
                label,
                value: values[index],
            };
        });
    }
    return [];
};

export const fixedPeriods = [
    "DAILY",
    "WEEKLY",
    "WEEKLYWED",
    "WEEKLYTHU",
    "WEEKLYSAT",
    "WEEKLYSUN",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "QUARTERLYNOV",
    "SIXMONTHLY",
    "SIXMONTHLYAPR",
    "SIXMONTHLYNOV",
    "YEARLY",
    "FYNOV",
    "FYOCT",
    "FYJUL",
    "FYAPR",
];

export const makeDataElementData = (data: {
    analytics: Analytics;
    dataElements: Map<string, { [k: string]: string }>;
    targetId: string;
    actualId: string;
    baselineId: string;
    category: string;
}) => {
    const {
        rows,
        metaData: { items, dimensions },
    } = data.analytics;

    const allData: Map<string, string> = new Map(
        rows.map((row) => {
            return [
                row.slice(0, row.length - 1).join(""),
                String(row[row.length - 1]),
            ];
        }),
    );
    return dimensions.dx.map((a) => {
        const current: Map<string, any> = new Map();
        const dataElementDetails = data.dataElements.get(a);
        dimensions["pe"]?.forEach((pe) => {
            const baseline = Number(allData.get(`${a}${data.baselineId}${pe}`));

            const categoryValues = dimensions[data.category]?.map((cat) =>
                Number(allData.get(`${a}${cat}${pe}`)),
            );

            let target = categoryValues.at(-2) ?? NaN;
            let actual = categoryValues.at(-1) ?? NaN;
            let year = pe.slice(0, 4);
            if (pe.indexOf("Q") > -1) {
                const quarter = pe.slice(-1);
                if (quarter === "1" || quarter === "2") {
                    year = String(Number(year) - 1);
                }
                target = Number(allData.get(`${a}${data.targetId}${year}July`));
            }
            const ratio = calculatePerformanceRatio(actual, target);
            const { performance, style } = findBackground(
                ratio,
                dataElementDetails?.["descending indicator type"],
            );
            if (isNaN(ratio)) {
                current.set(`${pe}performance`, "-");
            } else {
                current.set(`${pe}performance`, formatPercentage(ratio / 100));
            }
            current.set(`${pe}style`, style);
            current.set(`${pe}performance-group`, performance);
            current.set(`${pe}target`, isNaN(target) ? "-" : target);
            current.set(`${pe}actual`, isNaN(actual) ? "-" : actual);
            current.set(`${pe}baseline`, isNaN(baseline) ? "-" : baseline);
            current.set(`${pe}${data.targetId}`, isNaN(target) ? "-" : target);
            current.set(`${pe}${data.actualId}`, isNaN(actual) ? "-" : actual);
            current.set(
                `${pe}${data.baselineId}`,
                isNaN(baseline) ? "-" : baseline,
            );
        });
        return {
            id: a,
            dx: items[a].name,
            code: items[a].code,
            ...Object.fromEntries(current),
            ...dataElementDetails,
        };
    });
};

export const extractDataElementGroups = (
    dataElementGroupSets: DataElementGroupSet[],
    degs?: string,
): string[] => {
    if (dataElementGroupSets.length === 0) return [];

    if (degs !== undefined && degs !== "All") {
        const targetGroupSet = dataElementGroupSets.find((d) => d.id === degs);
        return targetGroupSet?.dataElementGroups.map((g) => g.id) ?? [];
    }
    return dataElementGroupSets.flatMap((d) =>
        d.dataElementGroups.map((g) => g.id),
    );
};

export const extractDataElementGroupsByProgram = (
    dataElementGroupSets: DataElementGroupSet[],
    program?: string,
    groupSet?: string,
): { groupSets: string[]; dataElementGroups: string[] } => {
    if (program === undefined || dataElementGroupSets.length === 0) {
        return {
            groupSets: [],
            dataElementGroups: [],
        };
    }

    let groupSets: string[] = [];

    if (groupSet) {
        groupSets = [groupSet];
    } else {
        groupSets = dataElementGroupSets.flatMap((d) => {
            const hasProgram =
                d.attributeValues?.some((a) => a.value === program) ?? false;

            if (hasProgram) {
                return d.id;
            }
            return [];
        });
    }

    const dataElementGroups = dataElementGroupSets.flatMap((d) => {
        if (groupSet && groupSet === d.id) {
            return d.dataElementGroups.map((g) => g.id);
        }
        const hasProgram =
            d.attributeValues?.some((a) => a.value === program) ?? false;

        if (groupSet === undefined && hasProgram) {
            return d.dataElementGroups.map((g) => g.id);
        }

        return [];
    });

    return {
        groupSets,
        dataElementGroups,
    };
};

export const resolveDataElementGroups = (
    searchParams: GoalSearch,
    dataElementGroupSets: DataElementGroupSet[],
): { groupSets: string[]; dataElementGroups: string[] } => {
    const { deg, degs, program, requiresProgram } = searchParams;
    if (requiresProgram && program === undefined) {
        return {
            groupSets: [],
            dataElementGroups: [],
        };
    }

    if (deg !== undefined && deg !== "All") {
        return {
            groupSets: [degs ?? ""],
            dataElementGroups: [deg],
        };
    }

    if (program !== undefined) {
        const values = extractDataElementGroupsByProgram(
            dataElementGroupSets,
            program,
            degs,
        );
        return values;
    }
    const dataElementGroups = extractDataElementGroups(
        dataElementGroupSets,
        degs,
    );

    return {
        groupSets: dataElementGroupSets.map((d) => d.id),
        dataElementGroups,
    };
};
export const buildQueryParams = (
    { dataElementGroups }: { groupSets: string[]; dataElementGroups: string[] },
    searchParams: GoalSearch,
) => {
    const { pe, ou, program, category, categoryOptions, degs } = searchParams;

    return {
        deg: dataElementGroups.map((de) => `DE_GROUP-${de}`).join(";"),
        pe,
        ou,
        category,
        categoryOptions,
        degs,
        ...(ou && { ou }),
        ...(program && { program }),
    };
};

export const validateDataElementGroupSets = (
    dataElementGroupSets: any,
): dataElementGroupSets is DataElementGroupSet[] => {
    return (
        Array.isArray(dataElementGroupSets) &&
        dataElementGroupSets.every(
            (set) =>
                set &&
                typeof set.id === "string" &&
                Array.isArray(set.dataElementGroups),
        )
    );
};

export const debounceNavigation = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300,
): T => {
    let timeoutId: NodeJS.Timeout;

    return ((...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    }) as T;
};
export const selectSearchParams = <K extends keyof GoalSearch>(
    searchParams: GoalSearch,
    keys: K[],
): Pick<GoalSearch, K> => {
    return keys.reduce((acc, key) => {
        acc[key] = searchParams[key];
        return acc;
    }, {} as Pick<GoalSearch, K>);
};

export function filterMapFunctional<K, V>(
    map: Map<K, V>,
    predicate: MapPredicate<K, V>,
) {
    return Array.from(map)
        .filter(([key, value]) => predicate(key, value))
        .map(([, value]) => value);
}

export const calculatePerformanceRatio = (
    actual: number,
    target: number,
): number => {
    if (isNaN(actual) || isNaN(target) || target === 0) return NaN;
    return (actual * 100) / target;
};

export const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
    }).format(value);
};

export const PERFORMANCE_COLORS = {
    red: { bg: "#EF4444", fg: "black", end: 75 },
    yellow: { bg: "#FBBF24", fg: "black", start: 75, end: 99 },
    gray: { bg: "#AAAAAA", fg: "black", start: 75, end: 99 },
    green: { bg: "#10B981", fg: "black", start: 100 },
} as const;

export const headerColors = {
    n: { backgroundColor: "#EF4444", color: "black" },
    m: { backgroundColor: "#FBBF24", color: "black" },
    x: { backgroundColor: "#AAAAAA", color: "black" },
    a: { backgroundColor: "#10B981", color: "black" },
} as const;
export const findBackground = (
    value: number,
    isDescending: string | undefined,
) => {
    if (isNaN(value)) {
        return {
            style: {
                backgroundColor: PERFORMANCE_COLORS.gray.bg,
                color: PERFORMANCE_COLORS.gray.fg,
            },
            performance: "x",
        };
    }
    const { red, yellow, green } = PERFORMANCE_COLORS;
    if (isDescending && isDescending === "true") {
        if (value < red.end) {
            return {
                style: { backgroundColor: green.bg, color: green.fg },
                performance: "a",
            };
        }
        if (value >= yellow.start && value < yellow.end) {
            return {
                style: { backgroundColor: yellow.bg, color: yellow.fg },
                performance: "m",
            };
        }
        if (value >= green.start) {
            return {
                style: { backgroundColor: red.bg, color: red.fg },
                performance: "n",
            };
        }
    } else {
        if (value < red.end) {
            return {
                style: { backgroundColor: red.bg, color: red.fg },
                performance: "n",
            };
        }
        if (value >= yellow.start && value < yellow.end) {
            return {
                style: { backgroundColor: yellow.bg, color: yellow.fg },
                performance: "m",
            };
        }
        if (value >= green.start) {
            return {
                style: { backgroundColor: green.bg, color: green.fg },
                performance: "a",
            };
        }
    }
    return {
        style: {
            backgroundColor: PERFORMANCE_COLORS.gray.bg,
            color: PERFORMANCE_COLORS.gray.fg,
        },
        performance: "x",
    };
};

export const derivePeriods = (periods?: string[]) => {
    if (!periods) return [];
    return periods.flatMap((p) => {
        return [p].concat(
            [3, 4, 1, 2].map((q) => {
                if (q === 1 || q === 2) {
                    return `${Number(p.slice(0, 4)) + 1}Q${q}`;
                }
                return `${p.slice(0, 4)}Q${q}`;
            }),
        );
    });
};

export const baselinePeriods = {
    NDPIII: "2017July",
    NDPIV: "2023July",
};

export function textPxWidth(
    text: string,
    font = "14px Cambria, Georgia, serif",
): number {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return Math.ceil(text.length * 8); // fallback
    ctx.font = font;
    const m = ctx.measureText(text);
    return Math.ceil(m.width);
}

export const getDefaultPeriods = (financialYears: string[]) => {
    const financialPeriods = financialYears.sort();

    const firstFinancialYear = financialPeriods.at(0);
    const lastFinancialYear = financialPeriods.at(-1);

    if (firstFinancialYear && lastFinancialYear) {
        const currentMonth = dayjs().month();
        let currentFinancialYear = dayjs().format("YYYY[July]");
        let previousFinancialYear = dayjs()
            .subtract(1, "year")
            .format("YYYY[July]");

        if (currentMonth < 6) {
            currentFinancialYear = dayjs()
                .subtract(1, "year")
                .format("YYYY[July]");
            previousFinancialYear = dayjs()
                .subtract(2, "year")
                .format("YYYY[July]");
        }
        if (firstFinancialYear === currentFinancialYear) {
            return {
                firstFinancialYear,
                lastFinancialYear,
                validPeriods: [currentFinancialYear],
                currentFinancialYear:
                    currentFinancialYear > lastFinancialYear
                        ? lastFinancialYear
                        : currentFinancialYear,
            };
        } else if (firstFinancialYear < currentFinancialYear) {
            return {
                firstFinancialYear,
                lastFinancialYear,
                validPeriods: financialPeriods.slice(-2),
                currentFinancialYear:
                    currentFinancialYear > lastFinancialYear
                        ? lastFinancialYear
                        : currentFinancialYear,
            };
        }

        return {
            firstFinancialYear,
            lastFinancialYear,
            validPeriods: [previousFinancialYear, currentFinancialYear],
            currentFinancialYear:
                currentFinancialYear > lastFinancialYear
                    ? lastFinancialYear
                    : currentFinancialYear,
        };
    } else {
        return {
            firstFinancialYear: "",
            lastFinancialYear: "",
            validPeriods: [],
            currentFinancialYear: "",
        };
    }
};

export const createColumns = (
    votes: Array<Omit<DHIS2OrgUnit, "leaf" | "dataSets" | "parent">>,
    data?: ScorecardData,
) => {
    const finalData = votes.map((vote) => {
        const dataForVote = data?.get(vote.id);
        return {
            ...vote,
            ...dataForVote,
        };
    });
    const columns: TableProps<(typeof finalData)[number]>["columns"] = [
        {
            title: "Vote",
            dataIndex: "vote",
            key: "vote",
            width: 60,
            align: "center",
            render: (_, record) => record.code?.replace("V", ""),
        },
        {
            title: "Institution",
            dataIndex: "name",
            key: "name",
            filterSearch: true,
            filters: votes.map((v) => ({ text: v.name, value: v.name })),
            onFilter: (value, record) =>
                record.name.indexOf(value as string) === 0,
        },
        {
            title: `No of Indicators`,
            dataIndex: "No Data",
            key: "No Data",
            width: 140,
            align: "center",
            render: (_, record) => data?.get(record.id)?.denominator ?? "",
        },
        {
            title: `A`,
            dataIndex: "achieved",
            key: "achieved",
            width: 70,
            align: "center",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.green.bg,
                    color: PERFORMANCE_COLORS.green.fg,
                },
            }),
        },
        {
            title: `M`,
            dataIndex: "moderatelyAchieved",
            key: "moderatelyAchieved",
            width: 70,
            align: "center",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.yellow.bg,
                    color: PERFORMANCE_COLORS.yellow.fg,
                },
            }),
        },
        {
            title: `N`,
            dataIndex: "notAchieved",
            key: "notAchieved",
            width: 70,
            align: "center",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.red.bg,
                    color: PERFORMANCE_COLORS.red.fg,
                },
            }),
        },
        {
            title: `ND`,
            dataIndex: "noData",
            key: "noData",
            width: 70,
            align: "center",
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.gray.bg,
                    color: PERFORMANCE_COLORS.gray.fg,
                },
            }),
        },
        {
            title: `% A`,
            dataIndex: "percentAchieved",
            key: "percentAchieved",
            width: 70,
            align: "center",
            render: (_, record) =>
                formatter.format(record.percentAchieved ?? 0),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.green.bg,
                    color: PERFORMANCE_COLORS.green.fg,
                },
            }),
        },
        {
            title: `% M`,
            dataIndex: "percentModeratelyAchieved",
            key: "percentModeratelyAchieved",
            width: 70,
            align: "center",
            render: (_, record) =>
                formatter.format(record.percentModeratelyAchieved ?? 0),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.yellow.bg,
                    color: PERFORMANCE_COLORS.yellow.fg,
                },
            }),
        },
        {
            title: `% N`,
            dataIndex: "percentNotAchieved",
            key: "percentNotAchieved",
            width: 70,
            align: "center",
            render: (_, record) =>
                formatter.format(record.percentNotAchieved ?? 0),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.red.bg,
                    color: PERFORMANCE_COLORS.red.fg,
                },
            }),
        },
        {
            title: `% ND`,
            dataIndex: "percentNoData",
            key: "percentNoData",
            width: 70,
            align: "center",
            render: (_, record) => formatter.format(record.percentNoData ?? 0),
            onHeaderCell: () => ({
                style: {
                    backgroundColor: PERFORMANCE_COLORS.gray.bg,
                    color: PERFORMANCE_COLORS.gray.fg,
                },
            }),
        },
        // {
        //     title: `WA`,
        //     dataIndex: "achievedWeighted",
        //     key: "achievedWeighted",
        //     align: "center",
        //     width: 70,
        //     render: (_, record) =>
        //         formatter.format(record.achievedWeighted ?? 0),
        // },
        // {
        //     title: `WM`,
        //     dataIndex: "moderatelyAchievedWeighted",
        //     key: "moderatelyAchievedWeighted",
        //     align: "center",
        //     width: 70,
        //     render: (_, record) =>
        //         formatter.format(record.moderatelyAchievedWeighted ?? 0),
        // },
        // {
        //     title: `WN`,
        //     dataIndex: "notAchievedWeighted",
        //     key: "notAchievedWeighted",
        //     render: (_, record) =>
        //         formatter.format(record.notAchievedWeighted ?? 0),
        //     align: "center",
        //     width: 70,
        // },
        // {
        //     title: `WND`,
        //     dataIndex: "noDataWeighted",
        //     key: "noDataWeighted",
        //     align: "center",
        //     width: 70,
        //     render: (_, record) => formatter.format(record.noDataWeighted ?? 0),
        // },

        {
            title: `Weighted`,
            dataIndex: "noDataWeighted",
            key: "noDataWeighted",
            align: "center",
            width: 100,
            render: (_, record) => formatter.format(record.totalWeighted ?? 0),
        },
    ];
    return { columns, finalData };
};

export const flattenDataElementGroupSetsResponse = ({
    dataElementGroupSets,
}: DataElementGroupSetResponse): FlattenedDataElement[] => {
    return dataElementGroupSets.flatMap(
        ({ attributeValues, id, name, code, dataElementGroups }) => {
            const degs = {
                ...fromPairs(
                    attributeValues.map(({ value, attribute: { id } }) => [
                        id,
                        value,
                    ]),
                ),
                ...fromPairs(
                    attributeValues.map(({ value, attribute: { name } }) => [
                        name,
                        value,
                    ]),
                ),
                dataElementGroupSetName: name,
                dataElementGroupSetId: id,
                dataElementGroupSetCode: code,
            };
            return dataElementGroups.flatMap(
                ({ id, attributeValues, name, code, dataElements }) => {
                    const deg = {
                        ...fromPairs(
                            attributeValues.map(
                                ({ value, attribute: { id } }) => [id, value],
                            ),
                        ),
                        ...fromPairs(
                            attributeValues.map(
                                ({ value, attribute: { name } }) => [
                                    name,
                                    value,
                                ],
                            ),
                        ),
                        dataElementGroupName: name,
                        dataElementGroupId: id,
                        dataElementGroupCode: code,
                    };
                    return dataElements.flatMap(
                        ({
                            attributeValues,
                            id,
                            name,
                            code,
                            dataSetElements,
                        }) => {
                            const de = {
                                id,
                                name,
                                code,
                                ...fromPairs(
                                    attributeValues.map(
                                        ({ value, attribute: { id } }) => [
                                            id,
                                            value,
                                        ],
                                    ),
                                ),
                                ...fromPairs(
                                    attributeValues.map(
                                        ({ value, attribute: { name } }) => [
                                            name,
                                            value,
                                        ],
                                    ),
                                ),
                                ...degs,
                                ...deg,
                            };

                            const dataSetOrganizationUnits =
                                dataSetElements.flatMap(
                                    ({ dataSet: { organisationUnits } }) =>
                                        organisationUnits.map((ou) => ou.id),
                                );
                            const dataSets = dataSetElements.flatMap(
                                ({ dataSet }) => dataSet.id,
                            );
                            return uniq(dataSetOrganizationUnits).map(
                                (organisationUnitId) => ({
                                    ...de,
                                    organisationUnitId,
                                    dataSets,
                                }),
                            );
                        },
                    );
                },
            );
        },
    );
};

export const legendItems = [
    {
        bg: PERFORMANCE_COLORS.green.bg,
        color: "black",
        label: "Achieved (>= 100%)",
    },
    {
        bg: PERFORMANCE_COLORS.yellow.bg,
        color: "black",
        label: "Moderately achieved (75-99%)",
    },
    {
        bg: PERFORMANCE_COLORS.red.bg,
        color: "black",
        label: "Not achieved (< 75%)",
    },
    { bg: PERFORMANCE_COLORS.gray.bg, color: "black", label: "No Data" },
];
export const performanceLegendItems = [
    {
        bg: PERFORMANCE_COLORS.green.bg,
        color: "black",
        label: "A - Achieved (>= 100%)",
    },
    {
        bg: PERFORMANCE_COLORS.yellow.bg,
        color: "black",
        label: "M - Moderately achieved (75-99%)",
    },
    {
        bg: PERFORMANCE_COLORS.red.bg,
        color: "black",
        label: "N - Not achieved (< 75%)",
    },
    { bg: PERFORMANCE_COLORS.gray.bg, color: "black", label: " ND - No Data" },
];

export const queryAnalytics = ({
    engine,
}: {
    engine: ReturnType<typeof useDataEngine>;
    pe?: string;
    quarters: string;
    dx: string;
    ou: string;
}) => {};

export const convertAnalyticsToObjects = (analytics: Analytics) => {
    const headers = analytics.headers.map((header) => header.name);
    return analytics.rows.map((row) => {
        return fromPairs(row.map((value, index) => [headers[index], value]));
    });
};

export const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
});
