import Dexie, { Table } from "dexie";
import { DataValue, OrgUnit } from "./types";
export class PerformanceDB extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataValues!: Table<DataValue>;
    constructor() {
        super("ndp-performance");
        this.version(2).stores({
            organisationUnits: "id,value,key,title,pId",
            dataValues:
                "[dataElement+attributeOptionCombo+categoryOptionCombo+orgUnit+period]",
        });
    }
}

export const db = new PerformanceDB();
