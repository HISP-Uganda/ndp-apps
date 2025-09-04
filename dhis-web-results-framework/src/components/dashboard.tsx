import React from "react";

import { Carousel, Image } from "antd";

export default function Dashboard() {
    return (
        <Carousel autoplay arrows style={{ padding: "10px" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                <Image
                    src={`${process.env.PUBLIC_URL}/images/NDPIII/${item}.jpeg`}
                    preview={false}
                    height="calc(100vh - 68px)"
                    width="calc(100vw - 15%)"
										key={item}
                    placeholder={
                        <Image
                            preview={false}
                            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200"
                        />
                    }
                />
            ))}
        </Carousel>
    );
}
