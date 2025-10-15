import { Input, InputNumber, message, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { DataElementDataValue } from "../types";
import { useSaveDataValue } from "../query-options";
import { useDataEngine } from "@dhis2/app-runtime";

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
    disabled = true,
}: {
    dataElement: DataElementDataValue;
    coc: string;
    aoc: string;
    co: string;
    cc: string;
    cp: string;
    de: string;
    ou: string;
    pe: string;
    disabled?: boolean;
		comment?: boolean;
}) {
    const engine = useDataEngine();
    const saveDataValue = useSaveDataValue();
    const [currentValue, setCurrentValue] = useState<
        string | number | undefined
    >(dataElement.dataValue[`${ou}_${pe}_${aoc}_${coc}`]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        if (!isEditing && !isLoading) {
            const newValue = dataElement.dataValue[`${ou}_${pe}_${aoc}_${coc}`];
            setCurrentValue(newValue);
        }
    }, [ou, pe, aoc, coc]);

    const handleUpdate = async (value: string | number | null) => {
        const stringValue = value?.toString() || "";

        const originalValue =
            dataElement.dataValue[`${ou}_${pe}_${aoc}_${coc}`];
        if (stringValue === originalValue) {
            setIsEditing(false);
            return;
        }
        const previousValue = currentValue;
        setIsLoading(true);

        try {
            await saveDataValue.mutateAsync({
                engine,
                dataValue: {
                    de,
                    pe,
                    ou,
                    co,
                    cc,
                    cp,
                    value: stringValue,
                },
            });
            message.success("Data saved successfully", 2);
        } catch (error) {
            message.error(
                `Failed to save data. Please try again. ${error.message}`,
                4,
            );
            setCurrentValue(previousValue);
            console.error("Save error:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    const inputComponent =
        dataElement.valueType.toLowerCase().includes("number") ||
        dataElement.valueType.toLowerCase().includes("integer") ||
        dataElement.valueType.toLowerCase().includes("unit") ? (
            <InputNumber
                style={{
                    width: "100%",
                }}
                value={currentValue as number}
                onChange={(value) => {
                    setIsEditing(true);
                    setCurrentValue(value || undefined);
                }}
                onBlur={(e) => handleUpdate(e.target.value)}
                onFocus={() => setIsEditing(true)}
                disabled={isLoading || disabled}
            />
        ) : (
            <Input
                style={{
                    width: "100%",
                }}
                value={currentValue as string}
                onChange={(e) => {
                    setIsEditing(true);
                    setCurrentValue(e.target.value);
                }}
                onBlur={(e) => handleUpdate(e.target.value)}
                onFocus={() => setIsEditing(true)}
                disabled={isLoading || disabled}
            />
        );

    return (
        <Spin spinning={isLoading} size="small">
            {inputComponent}
        </Spin>
    );
}
