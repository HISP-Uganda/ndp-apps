import Dexie, { Table } from "dexie";
import { OrgUnit } from "./types";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    analytics!: Table<Record<string, string | string[] | number | null>>;
    indicators!: Table<Record<string, string>>;

    constructor() {
        super("ndp-rf");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
        });
    }
}

export const db = new CQIDexie();
