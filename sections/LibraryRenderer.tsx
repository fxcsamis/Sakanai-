// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Library } from '@/config/viewRegistry/library';
import Renderer from '@/renderer/renderer';
import React from 'react';

export default function LibraryRenderer() {
    const scene = Library['lib'];
    return (
        <Renderer scene={scene} />
    )
}