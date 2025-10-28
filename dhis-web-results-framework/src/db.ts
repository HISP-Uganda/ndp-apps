import Dexie, { Table } from "dexie";
import { FlattenedDataElement, OrgUnit } from "./types";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    analytics!: Table<Record<string, string | string[] | number | null>>;
    indicators!: Table<Record<string, string>>;
    dataElements!: Table<FlattenedDataElement>;

    constructor() {
        super("ndp-rf");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
            dataElements:
                "[id+organisationUnitId+NDP+dataElementGroupSetId+dataElementGroupId],id,organisationUnitId,NDP,dataElementGroupSetId,dataElementGroupId",
        });
    }
}

export const db = new CQIDexie();
