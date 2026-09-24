// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export const BAR_H = 44;
export const BAR_PAD = 3;
export const BAR_MARGIN = 32;
export const TAB_COUNT = 4;

// The visible part of the floating tab bar: the capsule (white in light, dark in dark mode) and
// the iOS-style highlight that slides + stretches to the active tab with a spring.
// It sits BEHIND the real TabList (which is transparent and only holds the touchable tabs).
export default function TabBarBackground({ activeIndex, isDark, bottom }: { activeIndex: number; isDark: boolean; bottom: number }) {
    const { width } = useWindowDimensions();
    const tabW = (width - BAR_MARGIN * 2 - BAR_PAD * 2) / TAB_COUNT;

    const x = useSharedValue(Math.max(activeIndex, 0) * tabW);
    const stretch = useSharedValue(1);
    const visible = useSharedValue(activeIndex >= 0 ? 1 : 0);

    React.useEffect(() => {
        visible.value = withTiming(activeIndex >= 0 ? 1 : 0, { duration: 180 });
        if (activeIndex < 0) return;
        x.value = withSpring(activeIndex * tabW, { mass: 0.7, damping: 14, stiffness: 180 });
        stretch.value = withSequence(
            withTiming(1.16, { duration: 120 }),
            withSpring(1, { damping: 10, stiffness: 220 })
        );
    }, [activeIndex, tabW]);

    const indicatorStyle = useAnimatedStyle(() => ({
        opacity: visible.value,
        transform: [{ translateX: x.value }, { scaleX: stretch.value }],
    }));

    const innerH = BAR_H - BAR_PAD * 2;

    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: BAR_MARGIN,
                right: BAR_MARGIN,
                bottom,
                height: BAR_H,
                borderRadius: BAR_H / 2,
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.5 : 0.14,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 5 },
                elevation: 9,
            }}
        >
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: BAR_PAD,
                        top: BAR_PAD,
                        width: tabW,
                        height: innerH,
                        borderRadius: innerH / 2,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.07)',
                    },
                    indicatorStyle,
                ]}
            />
        </View>
    );
}
