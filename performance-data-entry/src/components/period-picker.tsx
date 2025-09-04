import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { generateFixedPeriods } from "@dhis2/multi-calendar-dates";
import { Button, Flex, Select } from "antd";
import React, { useMemo, useState } from "react";
import { PeriodType } from "../types";

export default function PeriodPicker({
    period,
    onChange,
    startingYear,
    periodType,
    multiple = false,
}: {
    period: string;
    onChange: (period: string) => void;
    startingYear: number;
    multiple?: boolean;
    periodType: PeriodType;
}) {
    const [year, setYear] = useState<number>(startingYear);
    const [current, setCurrent] = useState<string>(period);

    const availableFixedPeriods = useMemo(() => {
        return generateFixedPeriods({
            year,
            calendar: "iso8601",
            periodType,
            locale: "en",
        }).map(({ name, id }) => ({ label: name, value: id }));
    }, [year]);

    if (multiple) {
        return (
            <Flex gap="8px">
                <Select
                    mode="multiple"
                    options={availableFixedPeriods.sort()}
                    allowClear
                    onChange={(val) => {
                        setCurrent(val.join(";"));
                        onChange(val.join(";"));
                    }}
                    style={{ flex: 1 }}
                    value={current?.split(";") || []}
                    placeholder="Select baseline"
                />
                <Flex>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => setYear((prev) => prev - 1)}
                    />
                    <Button
                        icon={<RightOutlined />}
                        onClick={() => setYear((prev) => prev + 1)}
                    />
                </Flex>
            </Flex>
        );
    }

    return (
        <Flex gap="8px">
            <Select
                options={availableFixedPeriods.sort()}
                allowClear
                onChange={(val) => {
                    setCurrent(val);
                    onChange(val);
                }}
                style={{ flex: 1 }}
                value={current}
                placeholder="Select baseline"
            />
            <Flex>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => setYear((prev) => prev - 1)}
                />
                <Button
                    icon={<RightOutlined />}
                    onClick={() => setYear((prev) => prev + 1)}
                />
            </Flex>
        </Flex>
    );
}
