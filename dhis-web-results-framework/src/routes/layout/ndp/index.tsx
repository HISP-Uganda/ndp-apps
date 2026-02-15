import { createRoute } from "@tanstack/react-router";
import { Carousel, Image } from "antd";
import React from "react";
import { NDPRoute } from "./route";

export const NDPIndexRoute = createRoute({
    getParentRoute: () => NDPRoute,
    path: "/",
    component: Component,
});

function Component() {
    return (
        <Carousel autoplay arrows style={{ padding: "10px" }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <Image
                    src={`${process.env.PUBLIC_URL}/images/NDPIII/${item}.jpeg`}
                    preview={false}
                    height="calc(100vh - 68px)"
                    width="calc(100vw - 15%)"
                    key={item}
                    placeholder={null}
                />
            ))}
        </Carousel>
    );
}
