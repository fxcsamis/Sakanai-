// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Section } from "@/types/screenMap";
import React from "react";
import { sectionsRegistry } from "./registry";

const Renderer = ({ scene }: { scene: Section }) => {
    const Component = sectionsRegistry[scene.key];

    if (!Component) return null;

    return (
        <>
            <Component {...scene.props}>
                {scene.children?.map((child, index) => (
                    <Renderer key={child.key + index} scene={child} />
                ))}
            </Component>

            {scene.sections?.map((section, index) => (
                <Renderer key={section.key + index} scene={section} />
            ))}
        </>
    );
};

export default Renderer;