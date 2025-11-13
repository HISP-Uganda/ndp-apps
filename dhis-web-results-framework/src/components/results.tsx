import { DownloadOutlined } from "@ant-design/icons";
import { useSearch } from "@tanstack/react-router";

import { Button, Flex, Modal, Table, TableProps, Tabs, TabsProps } from "antd";
import { orderBy, uniqBy } from "lodash";
import React, { useMemo } from "react";
import { FaInfoCircle } from "react-icons/fa";
import downloadExcelFromColumns from "../download-antd-table";
import { RootRoute } from "../routes/__root";
import { ResultsProps } from "../types";
import { legendItems, makeDataElementData } from "../utils";
import PerformanceLegend from "./performance-legend";
import downloadPdfFromColumns from "../download-pdf-from-columns";

const budgetColumns = {
    lAyLQi6IqVF: "BR",
    NfADZSy1VzB: "BS",
    YE32G6hzVDl: "BP",
    UHhWlfyy5bm: "BA",
    bqIaasqpTas: "B",
    Px8Lqkxy2si: "T",
    HKtncMjp06U: "A",
};

const makeIndicatorData = (data: Record<string, any>) => {
    return [
        { code: "Name", display: data["dx"] },
        { code: "Description", display: data["description"] },
        { code: "Computation method", display: data["Computation method"] },
        { code: "Unit of Measure", display: data["Unit"] },
        { code: "Indicator Source", display: data["Indicator Source"] },

        {
            code: "Alternative data source",
            display: data["Alternative data source"],
        },
        {
            code: "Preferred data source",
            display: data["Preferred data source"],
        },
        { code: "Vote", display: data["dataSetOrganisationUnitName"] },
        {
            code: "Accountability for indicator",
            display: data["Accountability for indicator"],
        },
        {
            code: "Responsibility for indicator",
            display: data["Responsibility for indicator"],
        },
        // { code: "Lead MDA", display: data["Lead MDA"] },
        { code: "Other MDAs", display: data["Other MDAs"] },
        { code: "Indicator code", display: data["code"] },
        { code: "Indicator type", display: data["Indicator type"] },
        { code: "Aggregation type", display: data["aggregationType"] },
        {
            code: "Frequency of data collection",
            display: data["Frequency of data collection"],
        },
        {
            code: "Reporting Frequency",
            display:
                data["dataSetPeriodType"] === "FinancialJuly"
                    ? "Financial Year"
                    : data["dataSetPeriodType"],
        },

        // { code: "Baseline Status 2010", display: data["Baseline Status 2010"] },
        {
            code: "Chart of Accounts Code",
            display: data["Chart of Accounts Code"],
        },
        // { code: "Computation type", display: data["Computation type"] },
        {
            code: "Descending Indicator",
            display: data["descending indicator type"] ? "Yes" : "No",
        },
        // { code: "Green range", display: data["Green range"] },
        // { code: "Current Project Cost", display: data["Current Project Cost"] },
        // { code: "Limitations", display: data["Limitations"] },

        // { code: "Rationale", display: data["Rationale"] },
        // { code: "Red range", display: data["Red range"] },
        // { code: "References", display: data["References"] },

        // { code: "Vision 2040", display: data["Vision 2040"] },
        // { code: "Yellow range", display: data["Yellow range"] },
    ];
};

const PERFORMANCE_LABELS: Record<number, string> = {
    0: "T",
    1: "A",
    2: "%",
} as const;

export function Results(props: ResultsProps) {
    const [modal, contextHolder] = Modal.useModal();
    const {
        tab,
        data,
        onChange,
        postfixColumns = [],
        prefixColumns = [],
        quarters = false,
        pe = [],
        category,
        categoryOptions,
        nonBaseline,
    } = props;
    const { v } = useSearch({ from: "/layout/ndp" });
    const { configurations, categoryOptions: optionNames } =
        RootRoute.useLoaderData();
    const { target, value, analyticsItems, finalData, baseline } =
        useMemo(() => {
            const cats = data.analytics.metaData.dimensions[category] ?? [];
            const target = cats.at(-2) ?? "";
            const value = cats.at(-1) ?? "";
            const baseline = cats.at(0) ?? "";
            const approved = cats.at(1) ?? "";
            const analyticsItems = data.analytics.metaData.items;
            let finalData = orderBy(
                makeDataElementData({
                    ...data,
                    targetId: target,
                    actualId: value,
                    baselineId: baseline,
                    category,
                }),
                ["code"],
                ["asc"],
            );
            finalData = finalData.map((row) => {
                const dataElementGroup = data.dataElementGroups
                    .flatMap((group) => {
                        const value = row[group];
                        if (value === undefined) {
                            return [];
                        }
                        return value;
                    })
                    .join(" ");

                const dataElementGroupSet = data.groupSets
                    .flatMap((group) => {
                        const value = row[group];
                        if (value === undefined) {
                            return [];
                        }
                        return value;
                    })
                    .join(" ");

                return { ...row, dataElementGroup, dataElementGroupSet };
            });

            return {
                target,
                value,
                analyticsItems,
                finalData,
                baseline,
                approved,
            };
        }, [data.analytics, category, categoryOptions]);

    const indicatorColumns: TableProps<any>["columns"] = useMemo(
        () => [
            {
                title: "Indicator Code",
                dataIndex: "code",
                key: "code",
                width: "50%",
            },
            {
                title: "Indicator Name",
                dataIndex: "display",
                key: "display",
                width: "50%",
            },
        ],
        [],
    );

    const nameColumn: TableProps<Record<string, any>>["columns"] = useMemo(
        () => [
            ...prefixColumns,
            {
                title: nonBaseline ? "Budget Actions" : "Indicators",
                dataIndex: "dx",
                render: (text: string, record) => {
                    return (
                        <div>
                            {text}
                            &nbsp;
                            <FaInfoCircle
                                style={{
                                    color: "#428BCA",
                                    fontSize: "22.4px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    modal.info({
                                        title: "Indicator Dictionary",
                                        width: 600,
                                        centered: true,
                                        content: (
                                            <Table
                                                columns={indicatorColumns}
                                                dataSource={makeIndicatorData(
                                                    record,
                                                )}
                                                style={{
                                                    margin: 0,
                                                    padding: 0,
                                                }}
                                                pagination={false}
                                                rowKey="code"
                                                scroll={{ y: 700 }}
                                                showHeader={false}
                                                bordered
                                            />
                                        ),
                                    });
                                }}
                            />
                            {contextHolder}
                        </div>
                    );
                },
            },
        ],
        [prefixColumns],
    );

    const columns = useMemo(() => {
        const columnsMap = new Map<
            string,
            TableProps<Record<string, any>>["columns"]
        >();

        columnsMap.set("target", [
            ...nameColumn,
            ...pe.flatMap((pe) => {
                const title =
                    configurations[v]?.data?.baseline === pe
                        ? analyticsItems[baseline].name
                        : analyticsItems[target].name;
                const dataIndex =
                    configurations[v]?.data?.baseline === pe
                        ? `${pe}${baseline}`
                        : `${pe}${target}`;

                if (nonBaseline && configurations[v]?.data?.baseline === pe) {
                    return [];
                }
                return {
                    title,
                    align: "center" as const,
                    // minWidth: 90,
                    children: nonBaseline
                        ? categoryOptions?.slice(0, 2).map((option) => ({
                              title:
                                  budgetColumns[option] ||
                                  analyticsItems[option]?.name?.replace(
                                      "Budget ",
                                      "",
                                  ),
                              dataIndex: `${pe}${option}`,
                              align: "center" as const,
                              minWidth: 90,
                          }))
                        : [
                              {
                                  title,
                                  dataIndex,
                                  align: "center" as const,
                                  minWidth:
                                      configurations[v]?.data?.baseline === pe
                                          ? 100
                                          : 76,
                              },
                          ],
                };
            }),
            ...postfixColumns,
        ]);
        columnsMap.set("performance", [
            ...nameColumn,
            ...pe.flatMap((pe) => {
                if (nonBaseline && configurations[v]?.data?.baseline === pe) {
                    return [];
                }
                return {
                    title: analyticsItems[pe].name,
                    align: "center" as const,
                    children: nonBaseline
                        ? categoryOptions
                              ?.flatMap((option, index) => {
                                  if (index > 1) return [];
                                  return {
                                      title:
                                          budgetColumns[option] ||
                                          analyticsItems[option]?.name?.replace(
                                              "Budget ",
                                              "",
                                          ),
                                      dataIndex: `${pe}${option}`,
                                      align: "center" as const,
                                      minWidth: 50,
                                  };
                              })
                              .concat(
                                  [3, 4, 1, 2].map((quarter, index) => {
                                      const year = Number(pe.slice(0, 4));
                                      const currentYear =
                                          quarter === 1 || quarter === 2
                                              ? year + 1
                                              : year;
                                      return {
                                          title: `Q${index + 1}`,
                                          key: `${pe}${currentYear}Q${quarter}`,
                                          align: "center",
                                          dataIndex: `${pe}${currentYear}Q${quarter}`,
                                          minWidth: 100,
                                          children: [
                                              ...categoryOptions
                                                  .slice(2)
                                                  .map((option) => ({
                                                      title:
                                                          budgetColumns[
                                                              option
                                                          ] ||
                                                          analyticsItems[option]
                                                              ?.name,
                                                      dataIndex: `${currentYear}Q${quarter}${option}`,
                                                      key: `${currentYear}Q${quarter}${option}`,
                                                      align: "center" as const,
                                                      minWidth: 40,
                                                  })),
                                              {
                                                  title: `%`,
                                                  dataIndex: `${currentYear}Q${quarter}performance`,
                                                  key: `${currentYear}Q${quarter}performance`,
                                                  align: "center",
                                                  minWidth: 40,
                                                  onCell: (
                                                      row: Record<string, any>,
                                                  ) => {
                                                      return {
                                                          style: row[
                                                              `${currentYear}Q${quarter}style`
                                                          ],
                                                      };
                                                  },
                                              },
                                          ],
                                      };
                                  }),
                              )
                        : (configurations[v]?.data?.baseline === pe
                              ? [baseline]
                              : [target, value, "performance"]
                          ).flatMap((currentValue, index) => {
                              const year = Number(pe.slice(0, 4));
                              if (index === 1 && quarters) {
                                  return [3, 4, 1, 2].map((quarter, index) => {
                                      const currentYear =
                                          quarter === 1 || quarter === 2
                                              ? year + 1
                                              : year;
                                      return {
                                          title: `Q${index + 1}`,
                                          key: `${pe}${currentYear}Q${quarter}`,
                                          align: "center",
                                          children: [
                                              {
                                                  title: `A`,
                                                  key: `${currentYear}Q${quarter}actual`,
                                                  dataIndex: `${currentYear}Q${quarter}actual`,
                                                  align: "center",
                                                  minWidth: 40,
                                              },
                                              {
                                                  title: `%`,
                                                  dataIndex: `${currentYear}Q${quarter}performance`,
                                                  key: `${currentYear}Q${quarter}performance`,
                                                  align: "center",
                                                  onCell: (
                                                      row: Record<string, any>,
                                                  ) => {
                                                      return {
                                                          style: row[
                                                              `${currentYear}Q${quarter}style`
                                                          ],
                                                      };
                                                  },
                                                  minWidth: 40,
                                              },
                                          ],
                                      };
                                  });
                              } else {
                                  const title =
                                      analyticsItems[currentValue]?.name ??
                                      PERFORMANCE_LABELS[index];
                                  return {
                                      title:
                                          budgetColumns[currentValue] || title,
                                      key: `${pe}${currentValue}`,
                                      minWidth:
                                          configurations[v]?.data?.baseline ===
                                          pe
                                              ? 78
                                              : undefined,
                                      align: "center",
                                      onCell: (row: Record<string, any>) => {
                                          if (index === 2) {
                                              return {
                                                  style: row[`${pe}style`],
                                              };
                                          }
                                          return {};
                                      },
                                      dataIndex: `${pe}${currentValue}`,
                                      children: [],
                                  };
                              }
                          }),
                };
            }),
            ...postfixColumns,
        ]);
        return columnsMap;
    }, [
        nameColumn,
        target,
        value,
        analyticsItems,
        postfixColumns,
        prefixColumns,
        configurations,
        v,
        baseline,
        quarters,
        pe,
    ]);
    const tableProps = useMemo<TableProps<Record<string, any>>>(
        () => ({
            scroll: { y: "calc(100vh - 460px)" },
            rowKey: "id",
            bordered: true,
            sticky: true,
            tableLayout: "auto",
            pagination: false,
            size: "small",
            dataSource: uniqBy(finalData, "id"),
        }),
        [finalData],
    );
    const items: TabsProps["items"] = useMemo(
        () => [
            {
                key: "target",
                label: (
                    <div style={{ width: 200, textAlign: "center" }}>
                        Targets
                    </div>
                ),
                children: (
                    <Flex
                        vertical
                        gap={10}
                        style={{ height: "calc(100vh - 278px)" }}
                    >
                        <Flex justify="flex-end" gap={10}>
                            <Button
                                onClick={() =>
                                    downloadPdfFromColumns(
                                        columns.get("target"),
                                        finalData,
                                        "performance-report.pdf",
                                    )
                                }
                                icon={<DownloadOutlined />}
                            >
                                Download PDF
                            </Button>
                            <Button
                                onClick={() =>
                                    downloadExcelFromColumns(
                                        columns.get("target"),
                                        finalData,
                                        "performance-report.xlsx",
                                    )
                                }
                                icon={<DownloadOutlined />}
                            >
                                Download Excel
                            </Button>
                        </Flex>
                        <Table
                            {...tableProps}
                            columns={columns.get("target")}
                        />
                    </Flex>
                ),
            },
            {
                key: "performance",
                label: (
                    <div style={{ width: 200, textAlign: "center" }}>
                        Performance
                    </div>
                ),
                children: (
                    <Flex
                        vertical
                        gap={10}
                        style={{
                            height: "calc(100vh - 278px)",
                        }}
                    >
                        <PerformanceLegend legendItems={legendItems} />
                        <Flex gap={10} justify="space-between">
                            <Flex style={{ width: "50%" }} gap={10}>
                                {categoryOptions?.map((option) => (
                                    <div
                                        key={option}
                                        style={{
                                            width: "100%",
                                            height: "40px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid #121212ff",
                                        }}
                                    >
                                        {`${budgetColumns[option]} : ${
                                            optionNames.get(option) || option
                                        }`}
                                    </div>
                                ))}
                            </Flex>

                            <Flex justify="flex-end" gap={10}>
                                <Button
                                    onClick={() =>
                                        downloadPdfFromColumns(
                                            columns.get("performance"),
                                            finalData,
                                            "performance-report.pdf",
                                        )
                                    }
                                    icon={<DownloadOutlined />}
                                >
                                    Download PDF
                                </Button>
                                <Button
                                    onClick={() =>
                                        downloadExcelFromColumns(
                                            columns.get("performance"),
                                            finalData,
                                            "performance-report.xlsx",
                                        )
                                    }
                                    icon={<DownloadOutlined />}
                                >
                                    Download Excel
                                </Button>
                            </Flex>
                        </Flex>
                        <Table
                            {...tableProps}
                            columns={columns.get("performance")}
                        />
                    </Flex>
                ),
            },
        ],
        [columns, tableProps],
    );

    return (
        <>
            <Tabs
                activeKey={tab || "performance"}
                type="card"
                items={items}
                onChange={onChange}
                size="large"
                renderTabBar={(props, DefaultTabBar) => (
                    <DefaultTabBar
                        {...props}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyItems: "center",
                            flexDirection: "column",
                        }}
                    />
                )}
                tabBarStyle={{ backgroundColor: "yellow", color: "black" }}
            />
        </>
    );
}
