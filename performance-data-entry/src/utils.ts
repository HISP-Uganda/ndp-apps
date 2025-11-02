import { TreeDataNode } from "antd";
import { orderBy } from "lodash";
import {
    DataValue,
    DHIS2OrgUnit,
    IDataElement,
    IDataSet,
    TableDataRow,
} from "./types";

export function convertToAntdTree(data: DHIS2OrgUnit[]): TreeDataNode[] {
    const itemMap = new Map<string, DHIS2OrgUnit>();
    data.forEach((item) => {
        itemMap.set(item.id, item);
    });

    const treeNodeMap = new Map<string, TreeDataNode>();
    data.forEach((item) => {
        treeNodeMap.set(item.id, {
            key: item.id,
            title: item.name,
            isLeaf: item.leaf,
            children: item.leaf ? undefined : [],
        });
    });
    const rootNodes: TreeDataNode[] = [];

    data.forEach((item) => {
        const currentNode = treeNodeMap.get(item.id)!;

        if (!item.parent?.id || item.parent === null) {
            rootNodes.push(currentNode);
        } else {
            const parentNode = treeNodeMap.get(item.parent.id);
            if (parentNode && parentNode.children) {
                parentNode.children.push(currentNode);
            }
        }
    });

    if (rootNodes.length === 0 && data.length > 0) {
        return Array.from(treeNodeMap.values());
    }

    return rootNodes;
}

function findNodeByKey(
    treeData: TreeDataNode[],
    searchKey: string,
): TreeDataNode | null {
    for (const node of treeData) {
        if (node.key === searchKey) {
            return node;
        }

        if (node.children) {
            const found = findNodeByKey(node.children, searchKey);
            if (found) return found;
        }
    }
    return null;
}

export function findNodesByTitle(
    treeData: TreeDataNode[],
    searchText: string,
    caseSensitive = false,
): TreeDataNode[] {
    const results: TreeDataNode[] = [];
    const searchTerm = caseSensitive ? searchText : searchText.toLowerCase();

    function searchRecursive(nodes: TreeDataNode[]) {
        for (const node of nodes) {
            const nodeTitle = caseSensitive
                ? String(node.title ?? "")
                : String(node.title ?? "").toLowerCase();

            if (nodeTitle.includes(searchTerm)) {
                results.push(node);
            }

            if (node.children) {
                searchRecursive(node.children);
            }
        }
    }
    searchRecursive(treeData);
    return results;
}

export function getPathToNode(
    treeData: TreeDataNode[],
    targetKey: string,
): string[] | null {
    function searchPath(
        nodes: TreeDataNode[],
        path: string[] = [],
    ): string[] | null {
        for (const node of nodes) {
            const currentPath = [...path, String(node.key)];

            if (node.key === targetKey) {
                return currentPath;
            }

            if (node.children) {
                const found = searchPath(node.children, currentPath);
                if (found) return found;
            }
        }
        return null;
    }

    return searchPath(treeData);
}

export function filterTree(
    treeData: TreeDataNode[],
    searchText: string,
): TreeDataNode[] {
    const searchTerm = searchText.toLowerCase();

    function filterNode(node: TreeDataNode): TreeDataNode | null {
        const titleMatches = String(node.title ?? "")
            .toLowerCase()
            .includes(searchTerm);

        let filteredChildren: TreeDataNode[] = [];
        if (node.children) {
            filteredChildren = node.children
                .map((child) => filterNode(child))
                .filter((child) => child !== null) as TreeDataNode[];
        }

        if (titleMatches || filteredChildren.length > 0) {
            return {
                ...node,
                children:
                    filteredChildren.length > 0
                        ? filteredChildren
                        : node.isLeaf
                        ? undefined
                        : [],
            };
        }

        return null;
    }

    return treeData
        .map((node) => filterNode(node))
        .filter((node) => node !== null) as TreeDataNode[];
}

export function getAllLeafNodes(treeData: TreeDataNode[]): TreeDataNode[] {
    const leafNodes: TreeDataNode[] = [];

    function collectLeaves(nodes: TreeDataNode[]) {
        for (const node of nodes) {
            if (node.isLeaf || !node.children || node.children.length === 0) {
                leafNodes.push(node);
            } else {
                collectLeaves(node.children);
            }
        }
    }

    collectLeaves(treeData);
    return leafNodes;
}

export function getParentKeysForNodes(
    treeData: TreeDataNode[],
    nodeKeys: string[],
): string[] {
    const parentKeys = new Set<string>();

    for (const key of nodeKeys) {
        const path = getPathToNode(treeData, key);
        if (path) {
            path.slice(0, -1).forEach((parentKey) => parentKeys.add(parentKey));
        }
    }

    return Array.from(parentKeys);
}

export function searchTreeWithPredicate<T extends TreeDataNode>(
    treeData: T[],
    predicate: (node: T) => boolean,
): T[] {
    const results: T[] = [];

    function searchRecursive(nodes: T[]) {
        for (const node of nodes) {
            if (predicate(node)) {
                results.push(node);
            }

            if (node.children) {
                searchRecursive(node.children as T[]);
            }
        }
    }

    searchRecursive(treeData);
    return results;
}

export function searchAndHighlight(
    treeData: TreeDataNode[],
    searchText: string,
): TreeDataNode[] {
    if (!searchText.trim()) return treeData;

    const searchTerm = searchText.toLowerCase();

    function highlightNode(node: TreeDataNode): TreeDataNode {
        let highlightedTitle = String(node.title ?? "");

        if (highlightedTitle.toLowerCase().includes(searchTerm)) {
            const regex = new RegExp(`(${searchText})`, "gi");
            highlightedTitle = highlightedTitle.replace(
                regex,
                "<mark>$1</mark>",
            );
        }

        return {
            ...node,
            title: highlightedTitle,
            children: node.children
                ? node.children.map(highlightNode)
                : undefined,
        };
    }

    return treeData.map(highlightNode);
}

export function generateTableData(
    dataSet: IDataSet,
    dataElements: IDataElement[],
    dataValues: Array<DataValue>,
): TableDataRow[] {
    const tableData: TableDataRow[] = [];
    const allData = {};
    dataElements.forEach((de) => {
        const row: TableDataRow = {
            key: de.id,
            dataElement: de.name,
            ...de,
        };
        dataSet.categoryCombo.categoryOptionCombos.forEach((dataSetCOC) => {
            de.categoryCombo.categoryOptionCombos.forEach((coc) => {
                const columnKey = `${de.id}_${dataSetCOC.id}_${coc.id}`;
                const dataValue = dataValues.find(
                    (dv) =>
                        dv.dataElement === de.id &&
                        dv.categoryOptionCombo === coc.id &&
                        dataSetCOC.id === dv.attributeOptionCombo,
                );
                allData[columnKey] = dataValue ? dataValue.value : null;
                row[columnKey] = dataValue ? dataValue.value : null;
            });
        });

        tableData.push(row);
    });
    return orderBy(tableData, ["name"], ["asc"]);
}
