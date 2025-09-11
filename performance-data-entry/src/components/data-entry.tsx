import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import { TableProps } from "antd/es/table";
import React from "react";
import {
    ICategory,
    ICategoryCombo,
    ICategoryOptionCombo,
    IDataElement,
    IDataSet,
} from "../types";
import TableCell from "./TableCell";

export function generateGroupedColumns({
    dataSet,
    dataElements,
    pe,
    ou,
    onClick,
    baselineYear,
    targetYear,
}: {
    dataSet: IDataSet;
    dataElements: IDataElement[];
    pe: string;
    ou: string;
    onClick: () => void;
    targetYear: string;
    baselineYear: string;
}): TableProps<IDataElement>["columns"] {
    const columns: TableProps<IDataElement>["columns"] = [];
    columns?.push({
        title: "Data Element",
        dataIndex: "name",
        key: "dataElement",
        fixed: "left",
    });

    const categoryCombos = new Map<string, ICategoryCombo>();
    dataElements.forEach((de) => {
        if (de.categoryCombo && !categoryCombos.has(de.categoryCombo.id)) {
            categoryCombos.set(de.categoryCombo.id, de.categoryCombo);
        }
    });

    categoryCombos.forEach((categoryCombo) => {
        if (categoryCombo.categories.length > 1) {
            const groupedColumn = createGroupedColumn(categoryCombo);
            columns?.push(groupedColumn);
        } else {
            categoryCombo.categoryOptionCombos?.forEach((coc) => {
                dataSet.categoryCombo.categories
                    .flatMap((cat) => cat.categoryOptions)
                    .forEach((dataSetCOC) => {
                        const coc1 =
                            dataSet.categoryCombo.categoryOptionCombos.find(
                                (c) =>
                                    c.categoryOptions.some(
                                        (opt) => opt.id === dataSetCOC.id,
                                    ),
                            );

                        let period = pe;
                        if (dataSetCOC.name.toLowerCase().includes("target")) {
                            period = targetYear;
                        } else if (
                            dataSetCOC.name.toLowerCase().includes("baseline")
                        ) {
                            period = baselineYear;
                        }
                        columns?.push({
                            title: `${dataSetCOC.name}`,
                            key: `${coc1?.id}_${coc.id}`,
                            render: (_, record) => (
                                <TableCell
                                    dataElement={record}
                                    coc={coc.id}
                                    aoc={coc1?.id ?? ""}
                                    co={coc.id}
                                    cc={dataSet.categoryCombo.id}
                                    cp={dataSetCOC.id}
                                    ou={ou}
                                    pe={period}
                                    de={record.id}
                                />
                            ),
                        });
                    });
            });
        }
    });

    columns?.push({
        title: "Explanation/Attachment",
        key: "explanation",
        render: () => (
            <Space.Compact style={{ width: "100%" }} onClick={onClick}>
                <Input />
                <Button
                    type="primary"
                    icon={<PaperClipOutlined />}
                    style={{ width: "48px", backgroundColor: "#3276B1" }}
                />
            </Space.Compact>
        ),
    });

    return columns;
}

export function createGroupedColumn(
    categoryCombo: ICategoryCombo,
): NonNullable<TableProps<IDataElement>["columns"]>[number] {
    const firstCategory = categoryCombo.categories[0];
    const groupedCOCs = new Map<string, ICategoryOptionCombo[]>();

    categoryCombo.categoryOptionCombos?.forEach((coc) => {
        const firstCategoryOption = coc.categoryOptions.find((opt) =>
            firstCategory.categoryOptions.some(
                (catOpt) => catOpt.id === opt.id,
            ),
        );

        if (firstCategoryOption) {
            if (!groupedCOCs.has(firstCategoryOption.id)) {
                groupedCOCs.set(firstCategoryOption.id, []);
            }
            groupedCOCs.get(firstCategoryOption.id)!.push(coc);
        }
    });
    const children: TableProps<IDataElement>["columns"] = [];
    groupedCOCs.forEach((cocs, categoryOptionId) => {
        const categoryOption = firstCategory.categoryOptions.find(
            (opt) => opt.id === categoryOptionId,
        );

        if (cocs.length === 1) {
            children?.push({
                title: categoryOption?.name || "Unknown",
                dataIndex: `${categoryCombo.id}_${cocs[0].id}`,
                key: `${categoryCombo.id}_${cocs[0].id}`,
                width: 120,
                // align: "center",
            });
        } else {
            const subChildren: TableProps<IDataElement>["columns"] = cocs.map(
                (coc) => ({
                    title: getSubColumnTitle(
                        coc,
                        categoryCombo.categories.slice(1),
                    ),
                    dataIndex: `${categoryCombo.id}_${coc.id}`,
                    key: `${categoryCombo.id}_${coc.id}`,
                    width: 120,
                    // align: "center" as const,
                }),
            );

            children?.push({
                title: categoryOption?.name || "Unknown",
                children: subChildren,
            });
        }
    });

    return {
        title: categoryCombo.name,
        children: children,
    };
}

// Get sub-column title for remaining categories
export function getSubColumnTitle(
    coc: ICategoryOptionCombo,
    remainingCategories: ICategory[],
): string {
    const relevantOptions = coc.categoryOptions.filter((opt) =>
        remainingCategories.some((cat) =>
            cat.categoryOptions.some((catOpt) => catOpt.id === opt.id),
        ),
    );
    return relevantOptions.map((opt) => opt.name).join(" × ");
}
