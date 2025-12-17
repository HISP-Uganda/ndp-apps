import Dexie, { Table } from "dexie";
import { OrgUnit } from "./types";
import { processDataElements } from "./utils";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    analytics!: Table<Record<string, string | string[] | number | null>>;
    indicators!: Table<Record<string, string>>;
    dataElements!: Table<ReturnType<typeof processDataElements>[number]>;

    constructor() {
        super("ndp-rf");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
            dataElements:
                "[id+fsIKncW1Eps+orgUnit],[fsIKncW1Eps+BmUMiIbD5XY],[fsIKncW1Eps+orgUnit],[fsIKncW1Eps+BmUMiIbD5XY+orgUnit],id,fsIKncW1Eps,BmUMiIbD5XY,orgUnit,*attributes",
        });
    }
}

export const db = new CQIDexie();
