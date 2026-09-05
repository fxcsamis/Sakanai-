// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const TOPICS = ['🔥 Trending videos', '⚡ Viral videos', '🎬 Movies', '🎵 Music videos', '📺 Live streams'];

function Pill({ text, isDark }: { text: string; isDark: boolean }) {
    return (
        <View
            style={{
                marginRight: 10,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
            }}
        >
            <Text
                className="text-[12px] font-elms-med text-gray-700 dark:text-white"
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    );
}

export default function VideoTopicsMarquee({ isDark }: { isDark: boolean }) {
    const translateX = useSharedValue(0);
    const [setWidth, setSetWidth] = React.useState(0);

    const onLayoutSet = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && width !== setWidth) setSetWidth(width);
    };

    React.useEffect(() => {
        if (setWidth <= 0) return;
        translateX.value = 0;
        translateX.value = withRepeat(
            withTiming(-setWidth, { duration: setWidth * 18, easing: Easing.linear }),
            -1,
            false
        );
    }, [setWidth]);

    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={{ height: 36, overflow: 'hidden' }} pointerEvents="none">
            <Animated.View style={[{ flexDirection: 'row' }, style]}>
                <View style={{ flexDirection: 'row' }} onLayout={onLayoutSet}>
                    {TOPICS.map((t, i) => (
                        <Pill key={`a-${i}`} text={t} isDark={isDark} />
                    ))}
                </View>
                <View style={{ flexDirection: 'row' }}>
                    {TOPICS.map((t, i) => (
                        <Pill key={`b-${i}`} text={t} isDark={isDark} />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}
