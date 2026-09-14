// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Home } from '@/config/viewRegistry/home';
import Renderer from '@/renderer/renderer';
import React from 'react';

export default function HomeRenderer() {
    const scene = Home['home'];
    return <Renderer scene={scene} />
}