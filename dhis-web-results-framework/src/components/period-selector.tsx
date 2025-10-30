import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import {
    generateFixedPeriods,
    getFixedPeriodByDate,
} from "@dhis2/multi-calendar-dates";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { Button, Flex, Typography } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import { FixedPeriod, PickerProps } from "../types";
import { orderBy } from "lodash";
import { LIST_CONTAINER_STYLE } from "../utils";

const { Text } = Typography;

const getFixedPeriod = (period: string): FixedPeriod => {
    return getFixedPeriodByDate({
        periodType: "FYJUL",
        date: dayjs(period.replace("July", "-07"), "YYYY-MM").format(
            "YYYY-MM-DD",
        ),
        calendar: "iso8601",
    });
};



const PeriodItem = React.memo<{
    period: FixedPeriod;
    onClick: (period: FixedPeriod) => void;
}>(({ period, onClick }) => {
    const handleClick = useCallback(() => {
        onClick(period);
    }, [period, onClick]);

    return (
        <Text
            key={period.id}
            style={{ cursor: "pointer", padding: "2px 4px" }}
            onClick={handleClick}
        >
            {period.name}
        </Text>
    );
});

PeriodItem.displayName = "PeriodItem";

interface PeriodSelectorProps extends PickerProps {}

export default function PeriodSelector({
    onChange,
    selectedPeriods,
}: PeriodSelectorProps) {
    const { configurations } = useLoaderData({ from: "__root__" });
    const { v } = useSearch({ from: "/layout" });
    const financialYears = configurations[v].data.financialYears;
    const baselineYear = configurations[v].data.baseline;
    const year = dayjs(
        financialYears?.at(-1)?.replace("July", "-07") ??
            dayjs().add(4, "year"),
        "YYYY-MM",
    ).year();

    const initialPeriods = useMemo(() => {
        if (selectedPeriods === undefined || selectedPeriods.length === 0)
            return [];
        return selectedPeriods.map(getFixedPeriod);
    }, [selectedPeriods]);

    const [periods, setPeriods] = useState<FixedPeriod[]>(
        orderBy(initialPeriods, ["id"]),
    );

    const availableFixedPeriods = useMemo(() => {
        const generatedPeriods = generateFixedPeriods({
            year,
            calendar: "iso8601",
            periodType: "FYJUL",
            locale: "en",
        });
        const selectedIds = new Set(periods.map((p) => p.id));
        return generatedPeriods.filter(
            (p) =>
                !selectedIds.has(p.id) &&
                [baselineYear, ...financialYears].includes(p.id),
        );
    }, [year, periods, selectedPeriods]);

    const handleAddPeriod = useCallback((period: FixedPeriod) => {
        setPeriods((prev) => orderBy([...prev, period], ["id"]));
    }, []);

    const handleRemovePeriod = useCallback((period: FixedPeriod) => {
        setPeriods((prev) =>
            orderBy(
                prev.filter((p) => p.id !== period.id),
                ["id"],
            ),
        );
    }, []);

    const handleSubmit = useCallback(() => {
        const periodIds = periods.map((p) => p.id);
        onChange(periodIds);
    }, [periods, onChange]);

    const handleClearAll = useCallback(() => {
        setPeriods([]);
    }, []);

    const handleSelectAll = useCallback(() => {
        setPeriods((prev) => {
            const currentIds = new Set(prev.map((p) => p.id));
            const newPeriods = availableFixedPeriods.filter(
                (p) => !currentIds.has(p.id),
            );
            return orderBy([...prev, ...newPeriods], ["id"]);
        });
    }, [availableFixedPeriods]);

    return (
        <Flex vertical gap={10}>
            <Flex gap={10}>
                <Flex vertical flex={1} gap={10}>
                    <Flex justify="space-between" align="center">
                        <Text>
                            Available Periods ({availableFixedPeriods.length})
                        </Text>
                    </Flex>
                    <Flex vertical style={LIST_CONTAINER_STYLE}>
                        {availableFixedPeriods.length === 0 ? (
                            <Text
                                type="secondary"
                                style={{ textAlign: "center", padding: 20 }}
                            >
                                No available periods
                            </Text>
                        ) : (
                            availableFixedPeriods.map((period) => (
                                <PeriodItem
                                    key={period.id}
                                    period={period}
                                    onClick={handleAddPeriod}
                                />
                            ))
                        )}
                    </Flex>
                </Flex>
                <Flex align="center" justify="center" vertical gap={10}>
                    <Text type="secondary">Transfer</Text>
                    <Button
                        icon={<DoubleRightOutlined color="#fff" />}
                        onClick={handleSelectAll}
                        disabled={availableFixedPeriods.length === 0}
                        style={{ backgroundColor: "#5CB85C", width: 60 }}
                    />
                    <Button
                        icon={<DoubleLeftOutlined color="#fff" />}
                        onClick={handleClearAll}
                        style={{ backgroundColor: "#CF7F86", width: 60 }}
                        disabled={periods.length === 0}
                    />
                </Flex>

                <Flex vertical flex={1} gap={10}>
                    <Flex justify="space-between" align="center">
                        <Text>Selected Periods ({periods.length})</Text>
                    </Flex>
                    <Flex vertical style={LIST_CONTAINER_STYLE}>
                        {periods.length === 0 ? (
                            <Text
                                type="secondary"
                                style={{ textAlign: "center", padding: 20 }}
                            >
                                No periods selected
                            </Text>
                        ) : (
                            periods.map((period) => (
                                <PeriodItem
                                    key={period.id}
                                    period={period}
                                    onClick={handleRemovePeriod}
                                />
                            ))
                        )}
                    </Flex>

                    <Flex gap={10}>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={periods.length === 0}
                            style={{ flex: 1 }}
                        >
                            Apply ({periods.length})
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}
