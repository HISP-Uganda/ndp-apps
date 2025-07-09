import { Flex, Typography, Select, InputNumber, Button } from "antd";
import React, { useEffect, useState } from "react";
import {
    generateFixedPeriods,
    getFixedPeriodByDate,
} from "@dhis2/multi-calendar-dates";
import { createOptions2, fixedPeriods } from "../utils";
import {
    FixedPeriod,
    PeriodType,
} from "@dhis2/multi-calendar-dates/build/types/period-calculation/types";
import dayjs from "dayjs";
import { PickerProps } from "../types";

const { Text } = Typography;

const fixedPeriodTypeOptions = createOptions2(
    [
        "Daily",
        "Weekly",
        "Weekly (Start Wednesday)",
        "Weekly (Start Thursday)",
        "Weekly (Start Saturday)",
        "Weekly (Start Sunday)",
        "Bi-Weekly",
        "Monthly",
        "Bi-Monthly",
        "Quarterly",
        "Quarterly-Nov",
        "Six-Monthly",
        "Six-Monthly-April",
        "Six-Monthly-Nov",
        "Yearly",
        "Financial-Year (Start November)",
        "Financial-Year (Start October)",
        "Financial-Year (Start July)",
        "Financial-Year (Start April)",
    ],
    fixedPeriods,
);
const getFixedPeriod = (period: string) => {
    if (period.includes("Q")) {
        return getFixedPeriodByDate({
            periodType: "QUARTERLY",
            date: dayjs(period, "YYYY[Q]Q").format("YYYY-MM-DD"),
            calendar: "iso8601",
        });
    } else if (period.includes("Jul")) {
        return getFixedPeriodByDate({
            periodType: "FYJUL",
            date: dayjs(period, "YYYY").format("YYYY-MM-DD"),
            calendar: "iso8601",
        });
    }

    return getFixedPeriodByDate({
        periodType: "QUARTERLY",
        date: dayjs(period, "YYYY[Q]Q").format("YYYY-MM-DD"),
        calendar: "iso8601",
    });
};
export default function PeriodSelector({
    onChange,
    selectedPeriods,
}: PickerProps) {
    const [availableFixedPeriods, setAvailableFixedPeriods] = useState<
        Array<FixedPeriod>
    >([]);
    const [year, setYear] = useState<number | null>(dayjs().year());
    const [fixedPeriodType, setFixedPeriodType] =
        useState<PeriodType>("QUARTERLY");

    const [periods, setPeriods] = useState<FixedPeriod[]>(() => {
        if (selectedPeriods && selectedPeriods.length > 0) {
            return selectedPeriods.map((id) => {
                return getFixedPeriod(id);
            });
        }
        return [];
    });

    useEffect(() => {
        setAvailableFixedPeriods(() =>
            generateFixedPeriods({
                year: year ?? dayjs().year(),
                calendar: "iso8601",
                periodType: fixedPeriodType,
                locale: "en",
            }).filter((p) => !periods.find(({ id }) => p.id === id)),
        );
    }, [fixedPeriodType, year, periods]);
    return (
        <Flex vertical gap={10}>
            <Flex align="center" gap={10}>
                <Text>Period Type</Text>
                <Select
                    options={fixedPeriodTypeOptions}
                    allowClear
                    onChange={(e) => {
                        setFixedPeriodType(
                            () => (e as PeriodType) || "MONTHLY",
                        );
                    }}
                    style={{ flex: 1 }}
                    value={
                        fixedPeriodTypeOptions.find(
                            ({ value }) => value === fixedPeriodType,
                        )?.value
                    }
                />
            </Flex>
            <Flex gap={10}>
                <Flex vertical flex={1} gap={10}>
                    <Text>Available Periods</Text>
                    <Flex
                        vertical
                        style={{
                            backgroundColor: "white",
                            padding: 5,
                            minHeight: 280,
                            height: 280,
                            maxHeight: 280,
                            border: "1px solid #d9d9d9",
                            overflowY: "auto",
                        }}
                    >
                        {availableFixedPeriods.map((p) => (
                            <Text
                                key={p.id}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    setPeriods((prev) => [...prev, p])
                                }
                            >
                                {p.name}
                            </Text>
                        ))}
                    </Flex>
                    <Flex align="center" gap={10}>
                        <Text>Year</Text>
                        <InputNumber
                            min={1900}
                            value={year}
                            onChange={(val) => {
                                setYear(() => val);
                            }}
                        />
                    </Flex>
                </Flex>

                <Flex align="center" justify="center" vertical>
                    <Text>ARROWS</Text>
                </Flex>
                <Flex vertical flex={1} gap={10}>
                    <Text>Selected Periods</Text>
                    <Flex
                        vertical
                        style={{
                            backgroundColor: "white",
                            padding: 5,
                            minHeight: 280,
                            height: 280,
                            maxHeight: 280,
                            border: "1px solid #d9d9d9",
                            overflowY: "auto",
                        }}
                    >
                        {periods.map((p) => (
                            <Text
                                key={p.id}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    setPeriods((prev) =>
                                        prev.filter((v) => v.id !== p.id),
                                    )
                                }
                            >
                                {p.name}
                            </Text>
                        ))}
                    </Flex>
                    <Flex>
                        <Button
                            onClick={() => onChange(periods.map((p) => p.id))}
                        >
                            OK
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
