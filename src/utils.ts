import { SelectProps } from "antd";
import {
    Analytics,
    DataElement,
    DataElementGroupSet,
    GoalSearch,
    MapPredicate,
} from "./types";
import { fromPairs, groupBy } from "lodash";

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
        dataElements.map(({ id, name, dataElementGroups, attributeValues }) => {
            const obj: Map<string, string> = new Map();
            obj.set(id, name);
            obj.set("id", id);
            attributeValues.forEach(({ value, attribute: { id, name } }) => {
                obj.set(id, value);
                obj.set(name, value);
            });
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
        }),
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
        if (dataElementGroupSet !== id) {
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
}) => {
    const {
        rows,
        metaData: { items, dimensions },
    } = data.analytics;

    return dimensions.dx.map((a) => {
        const current: Map<string, any> = new Map();
        const dataElementDetails = data.dataElements.get(a);
        dimensions["pe"]?.forEach((pe) => {
            dimensions["Duw5yep8Vae"].forEach((dim) => {
                const search = rows.find(
                    (row) => row[0] === a && row[3] === pe && row[2] === dim,
                );
                current.set(`${pe}${dim}`, search?.[4] ?? "");
            });
            const target = Number(current.get(`${pe}${data.targetId}`));
            const actual = Number(current.get(`${pe}${data.actualId}`));
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

    if (degs !== undefined) {
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
): { groupSets: string[]; dataElementGroups: string[] } => {
    if (program === undefined || dataElementGroupSets.length === 0) {
        return {
            groupSets: [],
            dataElementGroups: [],
        };
    }
    const groupSets = dataElementGroupSets.flatMap((d) => {
        const hasProgram =
            d.attributeValues?.some((a) => a.value === program) ?? false;

        if (hasProgram) {
            return d.id;
        }
        return [];
    });
    const dataElementGroups = dataElementGroupSets.flatMap((d) => {
        const hasProgram =
            d.attributeValues?.some((a) => a.value === program) ?? false;

        if (hasProgram) {
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
    const { deg, degs, program } = searchParams;

    if (deg !== undefined) {
        return {
            groupSets: [degs ?? ""],
            dataElementGroups: [deg],
        };
    }

    if (program !== undefined) {
        return extractDataElementGroupsByProgram(dataElementGroupSets, program);
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
    const { pe, ou, program } = searchParams;

    return {
        deg: dataElementGroups.map((de) => `DE_GROUP-${de}`).join(";"),
        pe,
        ou,
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
    red: { bg: "#CD615A", fg: "black", end: 75 },
    yellow: { bg: "#F4CD4D", fg: "black", start: 75, end: 99 },
    gray: { bg: "#AAAAAA", fg: "black", start: 75, end: 99 },
    green: { bg: "#339D73", fg: "white", start: 100 },
} as const;

export const headerColors = {
    n: { backgroundColor: "#CD615A", color: "black" },
    m: { backgroundColor: "#F4CD4D", color: "black" },
    x: { backgroundColor: "#AAAAAA", color: "black" },
    a: { backgroundColor: "#339D73", color: "white" },
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
