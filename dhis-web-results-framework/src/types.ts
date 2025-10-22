import { generateFixedPeriods, periodTypes } from "@dhis2/multi-calendar-dates";
import type { TableColumnType, TableProps, TreeDataNode } from "antd";

import { ToOptions } from "@tanstack/react-router";
import { z } from "zod";
import { router } from "./router";
export const NDPValidator = z.object({
    v: z.string(),
});

export const SettingsSearch = z.object({
    edit: z.string().optional(),
});

export const GoalValidator = z.object({
    deg: z.string().optional(),
    degs: z.string().optional(),
    tab: z.string().optional(),
    pe: z.string().array().optional(),
    program: z.string().optional(),
    quarters: z.boolean().optional(),
    requiresProgram: z.boolean().optional(),
    category: z.string(),
    categoryOptions: z.string().array().optional(),
    ou: z.string(),
    nonBaseline: z.boolean().optional(),
});

export const PerformanceSchema = z.object({
    period: z.string().optional(),
    quarters: z.boolean().optional(),
});

export type GoalSearch = z.infer<typeof GoalValidator>;

export type AdditionalColumn = {
    value: string;
    label: string;
    selected: boolean;
    render?: TableColumnType<
        Record<string, string | number | undefined>
    >["render"];
};

export interface OrgUnit extends TreeDataNode {
    pId?: string;
    value: string;
    id: string;
    title: string;
    children?: OrgUnit[];
}
export interface OrgUnitsResponse {
    organisationUnits: OrgUnit[];
}

export type AttributeValue = {
    attribute: { id: string; name: string };
    value: string;
};

export type NameWithAttribute = {
    id: string;
    name: string;
    attributeValues: AttributeValue[];
};

export type DataElementGroupSet = NameWithAttribute & {
    dataElementGroups: Array<
        NameWithAttribute & {
            dataElements: NameWithAttribute[];
        }
    >;
};

export type DataElement = NameWithAttribute & {
    dataElementGroups: Array<
        NameWithAttribute & {
            groupSets: NameWithAttribute[];
        }
    >;
    aggregationType: string;
    dataSetElements: Array<{
        dataSet: {
            name: string;
            periodType: string;
            id: string;
            organisationUnits: Array<{
                code: string;
                displayName: string;
                id: string;
            }>;
        };
    }>;
};

type MetaData = {
    items: Record<string, Dx>;
    dimensions: Record<string, string[]>;
};

type Dx = {
    uid: string;
    name: string;
    dimensionType: string;
    description?: string;
    valueType?: string;
    aggregationType?: string;
    totalAggregationType?: string;
    startDate?: string;
    endDate?: string;
    code?: string;
};

type Header = {
    name: string;
    column: string;
    valueType: string;
    type: string;
    hidden: boolean;
    meta: boolean;
};

export type Analytics = {
    headers: Header[];
    metaData: MetaData;
    width: number;
    rows: string[][];
    height: number;
    headerWidth: number;
};

export type AppRouter = typeof router;

export type To = ToOptions<AppRouter>["to"];

export type PickerProps = {
    selectedPeriods: string[];
    onChange: (periods: string[]) => void;
};

export interface ResultsProps extends GoalSearch {
    dataElementGroupSets: DataElementGroupSet[];
    data: {
        analytics: Analytics;
        dataElements: Map<string, { [k: string]: string }>;
        dataElementGroups: string[];
        groupSets: string[];
    };
    onChange?: (key: string) => void;
    prefixColumns?: TableProps<Record<string, any>>["columns"];
    postfixColumns?: TableProps<Record<string, any>>["columns"];
    quarters?: boolean;
}

export type MapPredicate<K, V> = (key: K, value: V) => boolean;

export type Option = {
    id: string;
    name: string;
    code: string;
    created: string;
};
export type OptionSet = {
    id: string;
    name: string;
    options: Option[];
};

export type PeriodType = (typeof periodTypes)[number];

export type FixedPeriod = ReturnType<typeof generateFixedPeriods>[number];

export type DHIS2OrgUnit = {
    id: string;
    name: string;
    leaf: boolean;
    parent: { id: string };
    code?: string;
};
