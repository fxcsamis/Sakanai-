// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Section } from "@/types/screenMap";

export const Primary: Record<string, Section> = {
    'get-started': {
        key: 'GetStarted',
        children: [{
            key: 'AriseLogo',
            props: {
                title: "Arise Raj"
            },
        },
        {
            key: 'AriseBackground',
        }]
    }
}