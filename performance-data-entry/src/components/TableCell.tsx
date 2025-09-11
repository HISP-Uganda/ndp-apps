import { Input, InputNumber } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../db";
import { IndexRoute } from "../routes";
import { IDataElement } from "../types";

export default function TableCell({
    dataElement,
    coc,
    aoc,
    de,
    pe,
    ou,
    cc,
    cp,
    co,
}: {
    dataElement: IDataElement;
    coc: string;
    aoc: string;

    co: string;
    cc: string;
    cp: string;
    de: string;
    ou: string;
    pe: string;
}) {
    const { engine } = IndexRoute.useRouteContext();
    const value = useLiveQuery(() => db.dataValues.get([de, aoc, coc, ou, pe]));

    const onUpdate = async (newValue: string) => {
        const prevValue = await db.dataValues.get([de, aoc, coc, ou, pe]);

        await db.dataValues.put(
            {
                ...(value ?? {}),
                value: newValue,
                dataElement: de,
                categoryOptionCombo: co,
                attributeOptionCombo: aoc,
                orgUnit: ou,
                period: pe,
            },
            [de, aoc, coc, ou, pe],
        );

        const params = new URLSearchParams({
            de,
            co,
            cc,
            ou,
            pe,
            cp,
            value: newValue,
        }).toString();

        try {
            await engine.mutate({
                type: "create",
                resource: `dataValues.json?${params}`,
                data: {},
            });
        } catch (err) {
            if (err && err instanceof Error) {
                if (err.message.includes("Unexpected end of JSON input")) {
                } else if (prevValue) {
                    await db.dataValues.put(prevValue);
                }
            }
        }
    };
    if (
        dataElement.valueType.toLowerCase().includes("number") ||
        dataElement.valueType.toLowerCase().includes("integer") ||
        dataElement.valueType.toLowerCase().includes("unit")
    ) {
        return (
            <InputNumber
                style={{
                    width: "100%",
                }}
                value={value?.value}
                onBlur={(e) => onUpdate(e.target.value)}
            />
        );
    }

    return (
        <Input
            style={{
                width: "100%",
            }}
            value={value?.value}
            onBlur={(e) => onUpdate(e.target.value)}
        />
    );
}
