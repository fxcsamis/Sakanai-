// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Home } from '@/config/viewRegistry/home';
import Renderer from '@/renderer/renderer';
import React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export default function HomeRenderer({ hideNav = false, onScroll }: { hideNav?: boolean; onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void }) {
    const scene = { ...Home['home'], props: { ...Home['home'].props, hideNav, onScroll } };
    return <Renderer scene={scene} />
}