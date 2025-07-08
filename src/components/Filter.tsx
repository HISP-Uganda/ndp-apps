import { useLoaderData } from "@tanstack/react-router";
import type { SelectProps } from "antd";
import { Flex, Select } from "antd";
import React from "react";
import { NDPItemRoute } from "../routes/layout.ndp.$item";
import { GoalSearch } from "../types";
import { onlyDegs } from "../utils";

export default function Filter({
    first,
    second,
}: {
    first: SelectProps["options"];
    second: SelectProps["options"];
}) {
    const navigate = NDPItemRoute.useNavigate();
    const { deg, degs, program, pe, label } = NDPItemRoute.useSearch();
    const { item } = NDPItemRoute.useParams();

    const { dataElementGroupSets } = useLoaderData({
        from: "__root__",
    });

    return (
        <Flex className="w-1/2 h-[180px]" vertical>
            <Flex
                vertical={true}
                justify="center"
                gap="small"
                style={{ margin: "5px" }}
            >
                <div>{label}</div>
                <Select
                    allowClear
                    options={first}
                    style={{ width: "100%" }}
                    value={program || degs}
                    onChange={(value) => {
                        let search: GoalSearch = { pe, label };
                        if (onlyDegs.has(item) && value) {
                            const filtered = dataElementGroupSets.filter(
                                ({ id }) => id === value,
                            );
                            if (filtered.length > 0) {
                                search = {
                                    ...search,
                                    "deg-ids": filtered[0].dataElementGroups
                                        .map(({ id }) => `DE_GROUP-${id}`)
                                        .join(";"),
                                    degs: value,
                                };
                            }
                        } else {
                            search = { ...search, program: value };
                        }

                        navigate({
                            search: (prev) => ({
                                ...prev,
                                ...search,
                                deg: undefined,
                            }),
                        });
                    }}
                    onClear={() => {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                deg: undefined,
                            }),
                        });
                    }}
                />
            </Flex>
            <Flex
                vertical={true}
                justify="center"
                gap="small"
                style={{ margin: "5px" }}
            >
                <div>{label}</div>
                <Select
                    allowClear
                    options={second}
                    style={{ width: "100%" }}
                    value={deg}
                    defaultValue="ALL"
                    onChange={(value) => {
                        if (value) {
                            navigate({
                                search: (prev) => ({
                                    ...prev,
                                    deg: value,
                                    "deg-ids": `DE_GROUP-${value}`,
                                }),
                            });
                        } else if (onlyDegs.has(item)) {
                            const filtered = dataElementGroupSets.filter(
                                ({ id }) => id === degs,
                            );
                            if (filtered.length > 0) {
                                navigate({
                                    search: (prev) => ({
                                        ...prev,
                                        deg: undefined,
                                        "deg-ids": filtered[0].dataElementGroups
                                            .map(({ id }) => `DE_GROUP-${id}`)
                                            .join(";"),
                                    }),
                                });
                            }
                        }
                    }}
                    maxTagCount="responsive"
                />
            </Flex>
        </Flex>
    );
}
