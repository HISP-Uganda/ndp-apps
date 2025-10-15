import { createRoute } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Results } from "../../../../components/results";
import {
    useAnalyticsQuery,
    useDataElementGroups,
} from "../../../../hooks/data-hooks";
import { SubProgramActionRoute } from "./route";
import { ResultsProps } from "../../../../types";
import { derivePeriods } from "../../../../utils";

export const SubProgramActionIndexRoute = createRoute({
    path: "/",
    getParentRoute: () => SubProgramActionRoute,
    component: Component,
    errorComponent: () => <div>{null}</div>,
});

function Component() {
    const { engine } = SubProgramActionIndexRoute.useRouteContext();
    const {
        ou,
        deg,
        pe,
        tab,
        program,
        degs,
        quarters,
        requiresProgram,
        category,
        categoryOptions,
				nonBaseline
    } = SubProgramActionIndexRoute.useSearch();
    const navigate = SubProgramActionIndexRoute.useNavigate();
    const { dataElementGroupSets } = SubProgramActionRoute.useLoaderData();

    const dataElementGroups = useDataElementGroups(
        {
            deg,
            pe,
            ou,
            program,
            degs,
            requiresProgram,
            category,
            categoryOptions,
        },
        dataElementGroupSets,
    );
    const data = useAnalyticsQuery(engine, dataElementGroups, {
        deg,
        pe: derivePeriods(pe),
        ou,
        program,
        degs,
        category,
        categoryOptions,
    });

    const onChange = (key: string) => {
        navigate({
            search: (prev) => ({
                ...prev,
                tab: key,
            }),
        });
    };

    const resultsProps = useMemo<ResultsProps>(
        () => ({
            data: {
                ...data.data,
                ...dataElementGroups,
            },
            dataElementGroupSets,
            onChange,
            tab,
            deg,
            ou,
            pe,
            degs,
            quarters,
            category,
            categoryOptions,
						nonBaseline
        }),
        [
            data.data,
            dataElementGroupSets,
            onChange,
            tab,
            deg,
            ou,
            pe,
            degs,
            quarters,
            category,
            categoryOptions,
        ],
    );

    return <Results {...resultsProps} />;
}
