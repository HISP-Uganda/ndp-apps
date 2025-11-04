import { Flex, Modal, Typography } from "antd";
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
import CommentCell from "./comment-cell";
import { FaInfoCircle } from "react-icons/fa";
import modal from "antd/es/modal";

export function generateGroupedColumns({
    dataSet,
    dataElements,
    pe,
    ou,
    baselineYear,
    targetYear,
    disabled,
}: {
    dataSet: IDataSet;
    dataElements: IDataElement[];
    pe: string;
    ou: string;
    targetYear: string;
    baselineYear: string;
    disabled: boolean;
}): TableProps<IDataElement>["columns"] {
    const columns: TableProps<IDataElement>["columns"] = [];
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
                    .forEach((dataSetCOC, index, arr) => {
                        const coc1 =
                            dataSet.categoryCombo.categoryOptionCombos.find(
                                (c) =>
                                    c.categoryOptions.some(
                                        (opt) => opt.id === dataSetCOC.id,
                                    ),
                            );
                        let period = pe;
                        let periodText = "";
                        if (
                            (dataSetCOC.name.includes("Target") ||
                                dataSetCOC.name.includes("Planned") ||
                                dataSetCOC.name.includes("Approved")) &&
                            targetYear
                        ) {
                            period = targetYear;
                            periodText = `${Number(
                                targetYear.slice(0, 4),
                            )}/${String(
                                Number(targetYear.slice(0, 4)) + 1,
                            ).slice(2)}`;
                        } else if (
                            dataSetCOC.name.includes("Baseline") &&
                            baselineYear
                        ) {
                            period = baselineYear;
                            periodText = `${Number(
                                baselineYear.slice(0, 4),
                            )}/${String(
                                Number(baselineYear.slice(0, 4)) + 1,
                            ).slice(2)}`;
                        }
                        columns?.push({
                            title: (
                                <Flex vertical gap={2}>
                                    <Typography.Text
                                        style={{ color: "#05416eff" }}
                                    >
                                        {`${dataSetCOC.name}`}
                                    </Typography.Text>
                                    <Typography.Text
                                        style={{ color: "#05416eff" }}
                                    >
                                        {periodText}
                                    </Typography.Text>
                                </Flex>
                            ),
                            key: `${coc1?.id}_${coc.id}`,
                            align: "center",
                            width: 150,
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
                                    disabled={index < 1 || disabled}
                                />
                            ),
                        });
                        if (index === arr.length - 1) {
                            columns?.push({
                                title: (
                                    <Typography.Text
                                        style={{
                                            color: "#05416eff",
                                        }}
                                    >
                                        Explanation/Attachment
                                    </Typography.Text>
                                ),
                                key: "explanation",
                                width: 230,
                                render: (_, record) => (
                                    <CommentCell
                                        coc={coc.id}
                                        aoc={coc1?.id ?? ""}
                                        co={coc.id}
                                        cc={dataSet.categoryCombo.id}
                                        cp={dataSetCOC.id}
                                        ou={ou}
                                        pe={period}
                                        de={record.id}
                                        dataSet={dataSet}
                                        targetYear={targetYear}
                                        baselineYear={baselineYear}
                                        disabled={index < 1 || disabled}
                                    />
                                ),
                            });
                        }
                    });
            });
        }
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
