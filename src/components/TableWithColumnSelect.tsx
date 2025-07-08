import React from "react";
import type { TableColumnsType } from "antd";
import { Flex, Select, Table } from "antd";
import { useState } from "react";
import { AdditionalColumn } from "../types";

export function TableWithColumnSelect({
    columns,
    data,
    additionalColumns,
}: {
    columns: TableColumnsType<Record<string, string | number | undefined>>;
    data: Record<string, string | number | undefined>[] | undefined;
    additionalColumns: AdditionalColumn[];
}) {
    const [selected, setSelected] = useState<AdditionalColumn[]>(
        additionalColumns.flatMap((a) => (a.selected ? a : [])),
    );
    const addition: TableColumnsType<
        Record<string, string | number | undefined>
    > = selected.flatMap(({ value, label, selected, render }) => {
        if (selected && render) {
            return {
                title: label,
                key: value,
                render: (val, record, index) => render(val, record, index),
            };
        }
        if (selected) {
            return {
                title: label,
                dataIndex: value,
                width: "auto",
            };
        }
        return [];
    });
    return (
        <Flex vertical gap="10px">
            <Flex justify="between" align="center" gap="10px">
                <Flex flex={1} justify="between" align="center" gap="4px">
                    <div
                        style={{
                            width: "100%",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "green",
                            color: "white",
                        }}
                    >
                        Achieved (&le; 100%)
                    </div>
                    <div
                        style={{
                            width: "100%",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "yellow",
                        }}
                    >
                        Moderately achieved (75-99%)
                    </div>
                    <div
                        style={{
                            width: "100%",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "red",
                        }}
                    >
                        Not achieved (&lt; 75%)
                    </div>
                    <div
                        style={{
                            width: "100%",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "gray",
                        }}
                    >
                        No Data
                    </div>
                </Flex>
                <Select
                    options={additionalColumns}
                    style={{ width: "25%" }}
                    mode="multiple"
                    value={selected.map((a) => a.value)}
                    onChange={(value) =>
                        setSelected(() =>
                            additionalColumns.filter((a) =>
                                value.includes(a.value),
                            ),
                        )
                    }
                />
            </Flex>
            <Table
                columns={[...addition, ...columns]}
                dataSource={data}
                pagination={false}
                scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
                rowKey="id"
                bordered
                sticky
                // components={{
                //   header: {
                //     cell: (props) => (
                //       <th {...props} style={{ ...props.style, whiteSpace: 'nowrap' }} />
                //     ),
                //   },
                //   body: {
                //     cell: (props) => (
                //       <td
                //         {...props}
                //         style={{
                //           ...props.style,
                //           whiteSpace: 'nowrap',
                //         }}
                //       />
                //     ),
                //   },
                // }}
                tableLayout="auto"
            />
        </Flex>
    );
}
