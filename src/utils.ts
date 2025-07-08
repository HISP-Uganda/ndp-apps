import { Analytics, DataElement, DataElementGroupSet } from "./types";
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
