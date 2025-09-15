import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import {
    createFixedPeriodFromPeriodId,
    generateFixedPeriods,
} from "@dhis2/multi-calendar-dates";

import { Button, Flex, Select } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { PeriodType } from "../types";

export default function PeriodPicker({
    period,
    onChange,
    periodType,
    minPeriod,
    maxPeriod,
    defaultPeriods,
    dataSet,
}: {
    period?: string;
    onChange: (period: string | undefined) => void;
    minPeriod: string | undefined;
    maxPeriod: string | undefined;
    periodType?: PeriodType;
    defaultPeriods: string[];
    dataSet: string | undefined;
}) {
    const minYear = useMemo(() => parseInt(minPeriod ?? "", 10), [minPeriod]);
    const maxYear = useMemo(() => parseInt(maxPeriod ?? "", 10), [maxPeriod]);
    const [year, setYear] = useState<number>(minYear);
    const [current, setCurrent] = useState<string | undefined>(period);

    useEffect(() => {
        setCurrent(undefined);
        onChange(undefined);
    }, [dataSet]);

    const availableFixedPeriods = useMemo(() => {
        if (
            periodType === undefined ||
            minPeriod === undefined ||
            maxPeriod === undefined
        ) {
            setCurrent(undefined);
            return [];
        }
        const minDate = createFixedPeriodFromPeriodId({
            periodId: minPeriod,
            calendar: "iso8601",
        }).startDate;

        const maxDate = createFixedPeriodFromPeriodId({
            periodId: maxPeriod,
            calendar: "iso8601",
        }).endDate;
        const periods = generateFixedPeriods({
            year: periodType === "FYJUL" ? maxYear : year,
            calendar: "iso8601",
            periodType,
            locale: "en",
            yearsCount: periodType === "FYJUL" ? 5 : null,
        });

        if (periodType === "FYJUL" && defaultPeriods.length > 0) {
            return defaultPeriods
                .map((p) => {
                    return createFixedPeriodFromPeriodId({
                        periodId: p,
                        calendar: "iso8601",
                    });
                })
                .map(({ name, id }) => ({
                    label: name,
                    value: id,
                }));
        }
        return periods.flatMap(({ name, id, startDate, endDate }) => {
            if (startDate >= minDate && endDate <= maxDate) {
                return {
                    label: name,
                    value: id,
                };
            }
            return [];
        });
    }, [
        year,
        periodType,
        maxYear,
        minYear,
        minPeriod,
        maxPeriod,
        current,
        defaultPeriods,
        dataSet,
        onChange,
    ]);

    return (
        <Flex gap="8px">
            <Select
                options={availableFixedPeriods}
                allowClear
                onChange={(val) => {
                    onChange(val);
                    setCurrent(val);
                }}
                showSearch
                filterOption={(input, option) =>
                    String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                }
                style={{ flex: 1 }}
                value={current}
                placeholder="Select period"
            />
            <Flex>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => setYear((prev) => prev - 1)}
                    disabled={
                        year <= minYear ||
                        (periodType === "FYJUL" && defaultPeriods.length > 0)
                    }
                />
                <Button
                    icon={<RightOutlined />}
                    onClick={() => setYear((prev) => prev + 1)}
                    disabled={
                        year > maxYear ||
                        (periodType === "FYJUL" && defaultPeriods.length > 0)
                    }
                />
            </Flex>
        </Flex>
    );
}
