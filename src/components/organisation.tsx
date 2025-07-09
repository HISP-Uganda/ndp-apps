import { useQueryClient } from "@tanstack/react-query";
import type { TreeSelectProps } from "antd";
import { Form, TreeSelect } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { orderBy } from "lodash";
import React from "react";
import { db } from "../db";
import { orgUnitQueryOptions } from "../query-options";
import { RootRoute } from "../routes/__root";

export function OrgUnitSelect({
    disabled,
    onChange,
    value,
    isMulti,
}: {
    value: string | string[] | undefined;
    onChange: (newValue: string | string[] | undefined) => void;
    isMulti?: boolean;
    disabled?: boolean;
}) {
    const { engine } = RootRoute.useRouteContext();
    const queryClient = useQueryClient();
    const organisationUnits = useLiveQuery(() => db.dataViewOrgUnits.toArray());
    const onLoadData: TreeSelectProps["loadData"] = async ({ value }) => {
        if (value) {
            await queryClient.ensureQueryData(
                orgUnitQueryOptions(value.toString(), engine),
            );
        }
    };
    return (
        <Form.Item
            label="Vote"
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            labelAlign="left"
						style={{width: "100%"}}
        >
            <TreeSelect
                disabled={disabled}
                treeDataSimpleMode
                allowClear
                style={{ width: "100%" }}
                value={value}
                placeholder="Please select"
                onChange={onChange}
                loadData={onLoadData}
                treeData={orderBy(organisationUnits, "title", "asc")}
                multiple={isMulti}
            />
        </Form.Item>
    );
}
