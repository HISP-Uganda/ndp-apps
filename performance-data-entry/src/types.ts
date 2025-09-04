import { generateFixedPeriods, periodTypes } from "@dhis2/multi-calendar-dates";
import { TreeDataNode } from "antd";

import { z } from "zod";
export const search = z.object({
    orgUnit: z.string().optional(),
    pe: z.string().array().optional(),
    dataSet: z.string().optional(),
});

export interface OrgUnit extends TreeDataNode {
    pId?: string;
    value: string;
    id: string;
    title: string;
    children?: OrgUnit[];
}

export type DHIS2OrgUnit = {
    id: string;
    name: string;
    leaf: boolean;
    parent: { id: string };
};

export type PeriodType = (typeof periodTypes)[number];

export type FixedPeriod = ReturnType<typeof generateFixedPeriods>[number];
