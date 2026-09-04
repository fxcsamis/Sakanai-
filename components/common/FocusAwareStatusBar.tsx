// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';


export default function FocusAwareStatusBar(props: React.ComponentProps<typeof StatusBar>) {
    const isFocused = useIsFocused();

    return isFocused ? <StatusBar {...props} /> : null;
}