import { QueryClient } from "@tanstack/react-query";
import {
    createHashHistory,
    createRouter,
    ErrorComponent,
} from "@tanstack/react-router";
import { Flex, Spin } from "antd";
import React from "react";
import { RootRoute } from "./routes/__root";
import { IndexRoute } from "./routes/index";
import { LayoutIndexRoute } from "./routes/layout";
import { NDPIndexRoute } from "./routes/layout/ndp";
import { FAQIndexRoute } from "./routes/layout/ndp/faqs";
import { FAQRoute } from "./routes/layout/ndp/faqs/route";
import { GoalIndexRoute } from "./routes/layout/ndp/goals";
import { GoalRoute } from "./routes/layout/ndp/goals/route";
import { IndicatorDictionaryIndexRoute } from "./routes/layout/ndp/indicator-dictionaries";
import { IndicatorDictionaryRoute } from "./routes/layout/ndp/indicator-dictionaries/route";
import { OutcomeLevelIndexRoute } from "./routes/layout/ndp/outcome-levels";
import { OutcomeLevelRoute } from "./routes/layout/ndp/outcome-levels/route";
import { LibraryIndexRoute } from "./routes/layout/ndp/libraries";
import { LibraryRoute } from "./routes/layout/ndp/libraries/route";
import { PolicyActionIndexRoute } from "./routes/layout/ndp/policy-actions";
import { PolicyActionRoute } from "./routes/layout/ndp/policy-actions/route";
import { NDPRoute } from "./routes/layout/ndp/route";
import { SubProgramActionIndexRoute } from "./routes/layout/ndp/sub-program-actions";
import { SubProgramActionRoute } from "./routes/layout/ndp/sub-program-actions/route";
import { SubProgramOutcomeIndexRoute } from "./routes/layout/ndp/sub-program-outcomes";
import { SubProgramOutcomeRoute } from "./routes/layout/ndp/sub-program-outcomes/route";
import { SubProgramOutputIndexRoute } from "./routes/layout/ndp/sub-program-outputs";
import { SubProgramOutputRoute } from "./routes/layout/ndp/sub-program-outputs/route";
import { VisionIndexRoute } from "./routes/layout/ndp/visions";
import { VisionRoute } from "./routes/layout/ndp/visions/route";
import { WorkFlowIndexRoute } from "./routes/layout/ndp/workflows";
import { WorkflowRoute } from "./routes/layout/ndp/workflows/route";
import { LayoutRoute } from "./routes/layout/route";
import { ProjectPerformanceRoute } from "./routes/layout/ndp/project-performances/route";
import { ProjectPerformanceIndexRoute } from "./routes/layout/ndp/project-performances";
import { ObjectiveRoute } from "./routes/layout/ndp/objectives/route";
import { ObjectIndexRoute } from "./routes/layout/ndp/objectives";

const routeTree = RootRoute.addChildren([
    IndexRoute,
    LayoutRoute.addChildren([
        LayoutIndexRoute,
        NDPRoute.addChildren([
            NDPIndexRoute,
            FAQRoute.addChildren([FAQIndexRoute]),
            GoalRoute.addChildren([GoalIndexRoute]),
            IndicatorDictionaryRoute.addChildren([
                IndicatorDictionaryIndexRoute,
            ]),
            ObjectiveRoute.addChildren([ObjectIndexRoute]),
            OutcomeLevelRoute.addChildren([OutcomeLevelIndexRoute]),
            LibraryRoute.addChildren([LibraryIndexRoute]),
            PolicyActionRoute.addChildren([PolicyActionIndexRoute]),
            SubProgramActionRoute.addChildren([SubProgramActionIndexRoute]),
            SubProgramOutcomeRoute.addChildren([SubProgramOutcomeIndexRoute]),
            SubProgramOutputRoute.addChildren([SubProgramOutputIndexRoute]),
            VisionRoute.addChildren([VisionIndexRoute]),
            WorkflowRoute.addChildren([WorkFlowIndexRoute]),
            ProjectPerformanceRoute.addChildren([ProjectPerformanceIndexRoute]),
        ]),
    ]),
]);
export const router = createRouter({
    routeTree,
    defaultPendingComponent: () => (
        <Flex justify="center" align="center" style={{ height: "100%" }}>
            <Spin />
        </Flex>
    ),
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    history: createHashHistory(),
    context: { queryClient: new QueryClient(), engine: undefined! },

    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
});
