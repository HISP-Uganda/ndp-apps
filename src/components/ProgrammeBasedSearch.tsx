import { useLoaderData } from "@tanstack/react-router";
import Filter from "./Filter";
import React from "react";

export default function ProgrammeBasedSearch() {
    const { programs } = useLoaderData({ from: "__root__" });
    return (
        <Filter
            first={programs.map(({ code, name }) => ({
                value: code,
                label: name,
            }))}
            second={[]}
        />
    );
}
