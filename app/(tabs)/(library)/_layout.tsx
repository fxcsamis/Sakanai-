
// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name='library' />
            <Stack.Screen name='playlist' />
        </Stack>
    )
}

export default _layout