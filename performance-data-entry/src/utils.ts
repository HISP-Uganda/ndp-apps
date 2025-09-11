import { orderBy } from "lodash";
import { TreeDataNode } from "antd";
import {
    DataValue,
    DHIS2OrgUnit,
    IDataElement,
    IDataSet,
    TableDataRow,
} from "./types";

export function convertToAntdTree(data: DHIS2OrgUnit[]): TreeDataNode[] {
    // Create a map for quick lookup
    const itemMap = new Map<string, DHIS2OrgUnit>();
    data.forEach((item) => {
        itemMap.set(item.id, item);
    });

    // Create tree nodes map
    const treeNodeMap = new Map<string, TreeDataNode>();

    // First pass: create all tree nodes
    data.forEach((item) => {
        treeNodeMap.set(item.id, {
            key: item.id,
            title: item.name,
            isLeaf: item.leaf,
            children: item.leaf ? undefined : [],
        });
    });

    // Second pass: build the tree structure
    const rootNodes: TreeDataNode[] = [];

    data.forEach((item) => {
        const currentNode = treeNodeMap.get(item.id)!;

        if (!item.parent?.id || item.parent === null) {
            // Root node
            rootNodes.push(currentNode);
        } else {
            // Child node - add to parent's children
            const parentNode = treeNodeMap.get(item.parent.id);
            if (parentNode && parentNode.children) {
                parentNode.children.push(currentNode);
            }
        }
    });

    return rootNodes;
}

// 1. Search by key (exact match)
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

// 2. Search by title (text search)
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

// 3. Get path to a node (useful for expanding tree to show search result)
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

// 4. Filter tree (keep only matching nodes and their ancestors/descendants)
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

// 5. Get all leaf nodes
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

// 6. Get all parent keys for expanding tree to show search results
export function getParentKeysForNodes(
    treeData: TreeDataNode[],
    nodeKeys: string[],
): string[] {
    const parentKeys = new Set<string>();

    for (const key of nodeKeys) {
        const path = getPathToNode(treeData, key);
        if (path) {
            // Add all parent keys (exclude the node itself)
            path.slice(0, -1).forEach((parentKey) => parentKeys.add(parentKey));
        }
    }

    return Array.from(parentKeys);
}

// 7. Advanced search with custom predicate
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

// 8. Search with highlighting (for display purposes)
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
