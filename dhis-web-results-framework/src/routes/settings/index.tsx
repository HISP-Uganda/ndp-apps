import { createRoute, Link, useLoaderData } from "@tanstack/react-router";
import { Flex, Input } from "antd";
import { maxBy } from "lodash";
import { SettingsRoute } from "./route";

import type { TableProps } from "antd";
import { Table } from "antd";
import React from "react";
import { Option } from "../../types";
import PeriodPicker from "../../components/period-picker";
import dayjs from "dayjs";

type DataType = Option & { baseline: string; financialYears: string[] };

export const SettingsIndexRoute = createRoute({
    getParentRoute: () => SettingsRoute,
    path: "/",
    component: Component,
    loaderDeps: ({ search }) => search,
});

function Component() {
    const { engine } = SettingsIndexRoute.useRouteContext();
    const { ndpVersions, configurations } = useLoaderData({ from: "__root__" });

    const dataSource: DataType[] = ndpVersions.map((version) => ({
        ...version,
        ...(configurations[version.code]?.data ?? {}),
    }));
    const latestNDP = maxBy(ndpVersions, (version) => {
        return new Date(version.created).getTime();
    });

    const columns: TableProps<DataType>["columns"] = [
        {
            title: "NDP Version",
            dataIndex: "code",
            width: "8%",
        },
        {
            title: "Baseline Financial Year",
            dataIndex: "baseline",
            width: "46%",
            render: (_, record) => {
                return (
                    <PeriodPicker
                        period={record.baseline}
                        onChange={(val) =>
                            handleSave({ ...record, baseline: val })
                        }
                        startingYear={
                            dayjs(
                                record.baseline?.replace("July", "-07"),
                                "YYYY-MM",
                            ).year() ?? dayjs().year()
                        }
                    />
                );
            },
        },
        {
            title: "Financial Years",
            dataIndex: "financialYears",
            width: "46%",
            render: (_, record) => {
                return (
                    <PeriodPicker
                        period={record.financialYears?.join(";")}
                        onChange={(val) =>
                            handleSave({
                                ...record,
                                financialYears: val.split(";"),
                            })
                        }
                        startingYear={
                            dayjs(
                                record.financialYears
                                    ?.at(-1)
                                    ?.replace("July", "-07") ??
                                    dayjs().add(4, "year"),
                                "YYYY-MM",
                            ).year() ?? dayjs().year()
                        }
                        multiple
                    />
                );
            },
        },
    ];

    const handleSave = async (row: DataType) => {
        await engine.mutate({
            resource: `dataStore/ndp-configurations`,
            data: row,
            type: "update",
            id: row.code,
        });
    };

    return (
        <Flex style={{ padding: 20 }} vertical gap={20}>
            <Link to="/ndp" search={{ v: latestNDP?.code ?? "" }}>
                Back
            </Link>
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                rowKey="code"
            />
        </Flex>
    );
}
