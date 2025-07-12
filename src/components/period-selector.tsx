import { Flex, Typography, Select, InputNumber, Button } from "antd";
import React, { useMemo, useCallback, useState } from "react";
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

// Constants moved outside component to prevent recreation
const PERIOD_TYPES = [
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
];

const DEFAULT_PERIOD_TYPE: PeriodType = "QUARTERLY";
const CURRENT_YEAR = dayjs().year();
const MIN_YEAR = 1900;

// Memoized period type options
const FIXED_PERIOD_TYPE_OPTIONS = createOptions2(PERIOD_TYPES, fixedPeriods);

// Optimized period detection with better type safety
const detectPeriodType = (
    period: string,
): { type: PeriodType; date: string } => {
    if (period.includes("Q")) {
        return {
            type: "QUARTERLY",
            date: dayjs(period, "YYYY[Q]Q").format("YYYY-MM-DD"),
        };
    }

    if (period.includes("Jul")) {
        return {
            type: "FYJUL",
            date: dayjs(period, "YYYY").format("YYYY-MM-DD"),
        };
    }

    // Default fallback
    return {
        type: "QUARTERLY",
        date: dayjs(period, "YYYY[Q]Q").format("YYYY-MM-DD"),
    };
};

// Memoized period converter
const getFixedPeriod = (period: string): FixedPeriod => {
    const { type, date } = detectPeriodType(period);

    return getFixedPeriodByDate({
        periodType: type,
        date,
        calendar: "iso8601",
    });
};

// Memoized list container styles
const LIST_CONTAINER_STYLE = {
    backgroundColor: "white",
    padding: 5,
    minHeight: 280,
    height: 280,
    maxHeight: 280,
    border: "1px solid #d9d9d9",
    overflowY: "auto" as const,
};

// Memoized period item component
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
    const [year, setYear] = useState<number | null>(CURRENT_YEAR);
    const [fixedPeriodType, setFixedPeriodType] =
        useState<PeriodType>(DEFAULT_PERIOD_TYPE);

    // Memoized initial periods from selected periods
    const initialPeriods = useMemo(() => {
        if (!selectedPeriods?.length) return [];

        return selectedPeriods.map(getFixedPeriod);
    }, [selectedPeriods]);

    const [periods, setPeriods] = useState<FixedPeriod[]>(initialPeriods);

    // Memoized available periods calculation
    const availableFixedPeriods = useMemo(() => {
        const currentYear = year ?? CURRENT_YEAR;

        const generatedPeriods = generateFixedPeriods({
            year: currentYear,
            calendar: "iso8601",
            periodType: fixedPeriodType,
            locale: "en",
        });

        // Create a Set of selected period IDs for O(1) lookup
        const selectedIds = new Set(periods.map((p) => p.id));

        return generatedPeriods.filter((p) => !selectedIds.has(p.id));
    }, [fixedPeriodType, year, periods]);

    // Memoized period type value
    const selectedPeriodTypeOption = useMemo(() => {
        return FIXED_PERIOD_TYPE_OPTIONS.find(
            ({ value }) => value === fixedPeriodType,
        )?.value;
    }, [fixedPeriodType]);

    // Optimized handlers
    const handlePeriodTypeChange = useCallback((value: PeriodType | null) => {
        setFixedPeriodType(value || DEFAULT_PERIOD_TYPE);
    }, []);

    const handleYearChange = useCallback((value: number | null) => {
        setYear(value);
    }, []);

    const handleAddPeriod = useCallback((period: FixedPeriod) => {
        setPeriods((prev) => [...prev, period]);
    }, []);

    const handleRemovePeriod = useCallback((period: FixedPeriod) => {
        setPeriods((prev) => prev.filter((p) => p.id !== period.id));
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
            return [...prev, ...newPeriods];
        });
    }, [availableFixedPeriods]);

    return (
        <Flex vertical gap={10}>
            {/* Period Type Selector */}
            <Flex align="center" gap={10}>
                <Text>Period Type</Text>
                <Select
                    options={FIXED_PERIOD_TYPE_OPTIONS}
                    allowClear
                    onChange={handlePeriodTypeChange}
                    style={{ flex: 1 }}
                    value={selectedPeriodTypeOption}
                    placeholder="Select period type"
                />
            </Flex>

            {/* Main Content */}
            <Flex gap={10}>
                {/* Available Periods */}
                <Flex vertical flex={1} gap={10}>
                    <Flex justify="space-between" align="center">
                        <Text>
                            Available Periods ({availableFixedPeriods.length})
                        </Text>
                        {availableFixedPeriods.length > 0 && (
                            <Button size="small" onClick={handleSelectAll}>
                                Select All
                            </Button>
                        )}
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

                    {/* Year Input */}
                    <Flex align="center" gap={10}>
                        <Text>Year</Text>
                        <InputNumber
                            min={MIN_YEAR}
                            max={CURRENT_YEAR + 10}
                            value={year}
                            onChange={handleYearChange}
                            placeholder="Enter year"
                            style={{ width: 120 }}
                        />
                    </Flex>
                </Flex>

                {/* Transfer Actions */}
                <Flex align="center" justify="center" vertical gap={10}>
                    <Text type="secondary">Transfer</Text>
                    <Text>→</Text>
                    <Text>←</Text>
                </Flex>

                {/* Selected Periods */}
                <Flex vertical flex={1} gap={10}>
                    <Flex justify="space-between" align="center">
                        <Text>Selected Periods ({periods.length})</Text>
                        {periods.length > 0 && (
                            <Button size="small" onClick={handleClearAll}>
                                Clear All
                            </Button>
                        )}
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

                    {/* Action Buttons */}
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
