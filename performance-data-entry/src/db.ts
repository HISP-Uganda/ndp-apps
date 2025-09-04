import Dexie, { Table } from "dexie";
import { OrgUnit } from "./types";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    constructor() {
        super("ndp-performance");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
        });
    }
}

export const db = new CQIDexie();
