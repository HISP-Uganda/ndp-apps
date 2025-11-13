import Dexie, { Table } from "dexie";
import { OrgUnit } from "./types";
import { flattenDataElementGroupSetsResponse } from "./utils";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    analytics!: Table<Record<string, string | string[] | number | null>>;
    indicators!: Table<Record<string, string>>;
    dataElements!: Table<
        ReturnType<typeof flattenDataElementGroupSetsResponse>[number]
    >;

    constructor() {
        super("ndp-rf");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
            dataElements:
                "[id+organisationUnits+NDP+dataElementGroupSetId+dataElementGroupId+dataSets],id,*organisationUnits,NDP,dataElementGroupSetId,dataElementGroupId,*dataSets",
        });
    }
}

export const db = new CQIDexie();
