// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Home } from '@/config/viewRegistry/home';
import Renderer from '@/renderer/renderer';
import React from 'react';

export default function HomeRenderer({ hideNav = false }: { hideNav?: boolean }) {
    const scene = { ...Home['home'], props: { ...Home['home'].props, hideNav } };
    return <Renderer scene={scene} />
}