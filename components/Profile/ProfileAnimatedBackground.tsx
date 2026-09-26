// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Cloud, PawPrint } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

// Soft drifting clouds behind the profile content. Every value here is read only
// inside useAnimatedStyle (a UI-thread worklet), so this animates forever without
// ever triggering a JS-thread re-render of the screen around it - the exact mistake
// that made Cloudihub's own Kotlin version of this jank (a value read directly in
// the composable body there forced a full recompose+relayout every frame; here the
// equivalent would be reading a shared value outside useAnimatedStyle).
export default function ProfileAnimatedBackground({ isDark }: { isDark: boolean }) {
    const t1 = useSharedValue(0);
    const t2 = useSharedValue(0);
    const t3 = useSharedValue(0);

    React.useEffect(() => {
        t1.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true);
        t2.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true);
        t3.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, []);

    const cloud1Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: 20 },
            { translateY: 80 + (t1.value * 28 - 14) },
            { scale: 0.96 + t3.value * 0.08 },
        ],
    }));

    const cloud2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: -20 },
            { translateY: 160 + (t2.value * -28 + 14) },
            { scale: 1.04 - t3.value * 0.08 },
        ],
    }));

    const animalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: 260 + (t3.value * 14 - 7) }],
    }));

    const cloudTint = isDark ? '#38BDF8' : '#0284C7';

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                }}
            />
            <Animated.View style={[{ position: 'absolute', left: 0, top: 0, opacity: 0.14 }, cloud1Style]}>
                <Cloud size={110} color={cloudTint} fill={cloudTint} />
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', right: 0, top: 0, opacity: 0.12 }, cloud2Style]}>
                <Cloud size={90} color={cloudTint} fill={cloudTint} />
            </Animated.View>
            <Animated.View style={[{ position: 'absolute', left: 30, top: 0, opacity: 0.08 }, animalStyle]}>
                <PawPrint size={60} color={cloudTint} />
            </Animated.View>
        </View>
    );
}
