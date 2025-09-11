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
}: {
    period?: string;
    onChange: (period: string | undefined) => void;
    startingYear: number;
    periodType?: PeriodType;
}) {
    const [year, setYear] = useState<number>(startingYear);
    const [current, setCurrent] = useState<string | undefined>(period);

    const availableFixedPeriods = useMemo(() => {
        if (periodType === undefined) {
            setCurrent(undefined);
            return [];
        }
        return generateFixedPeriods({
            year,
            calendar: "iso8601",
            periodType,
            locale: "en",
        }).map(({ name, id }) => ({ label: name, value: id }));
    }, [year, periodType, period]);

    return (
        <Flex gap="8px">
            <Select
                options={availableFixedPeriods}
                allowClear
                onChange={(val) => {
                    onChange(val);
                    setCurrent(val);
                }}
                style={{ flex: 1 }}
                value={current}
                placeholder="Select period"
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
