import { useQueryClient } from "@tanstack/react-query";
import type { TreeSelectProps } from "antd";
import { Form, TreeSelect } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { orderBy } from "lodash";
import React, { useMemo, useState } from "react";
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
    const [searchValue, setSearchValue] = useState<string>("");

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

    const filteredTreeData = useMemo(() => {
        if (!searchValue.trim()) return organisationUnits;

        const searchLower = searchValue.toLowerCase();
        const matchingIds = new Set<string>();

        // Find all nodes that match the search
        const matchingNodes = organisationUnits?.filter((node) =>
            node.title.toLowerCase().includes(searchLower),
        );

        // Add matching nodes and their ancestors/descendants
        matchingNodes?.forEach((node) => {
            matchingIds.add(node.id);

            // Add all ancestors
            let currentParentId = node.pId;
            while (currentParentId) {
                matchingIds.add(currentParentId);
                const parent = organisationUnits?.find(
                    (n) => n.id === currentParentId,
                );
                currentParentId = parent?.pId;
            }

            // Add all descendants
            const addDescendants = (parentId: string) => {
                const children = organisationUnits?.filter(
                    (n) => n.pId === parentId,
                );
                children?.forEach((child) => {
                    matchingIds.add(child.id);
                    addDescendants(child.id);
                });
            };
            addDescendants(node.id);
        });

        return organisationUnits?.filter((node) => matchingIds.has(node.id));
    }, [searchValue, organisationUnits]);

    const handleSearch = (value: string): void => {
        setSearchValue(value);
    };

    return (
        <Form.Item
            label="Vote"
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            labelAlign="left"
            style={{ width: "100%" }}
        >
            <TreeSelect
                disabled={disabled}
                treeDataSimpleMode
                showSearch
                allowClear
                style={{ width: "100%", flex: 1 }}
                value={value}
                placeholder="Please select"
                onChange={onChange}
                loadData={onLoadData}
                treeData={orderBy(filteredTreeData, "title", "asc")}
                multiple={isMulti}
                filterTreeNode={false}
                onSearch={handleSearch}
            />
        </Form.Item>
    );
}
