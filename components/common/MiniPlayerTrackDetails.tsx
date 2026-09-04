// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const SWIPE_THRESHOLD = 50;
const SWIPE_OFFSET = 200;

const SPRING_CONFIG = {
    damping: 22,
    stiffness: 200,
    mass: 0.4,
};

export default function MiniPlayerTrackDetails() {
    const { queue, currentIndex } = useAppSelector((state) => state.trackReducer);
    const track = queue[currentIndex];
    const { skipToNext, skipToPrevious } = useTrack();

    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const prevTrackId = useRef(track?.id);

    useEffect(() => {
        if (track?.id !== prevTrackId.current) {
            const currentOffset = translateX.value;

            if (currentOffset < 0) {
                translateX.value = SWIPE_OFFSET;
            } else if (currentOffset > 0) {
                translateX.value = -SWIPE_OFFSET;
            } else {
                translateX.value = 35;
            }

            opacity.value = 0;

            translateX.value = withTiming(0);
            opacity.value = withTiming(1, { duration: 180 });

            prevTrackId.current = track?.id;
        }
    }, [track?.id]);

    const panGesture = Gesture.Pan()
        .enabled(!!track && queue.length > 1)
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            let transX = event.translationX;

            if (currentIndex === 0 && transX > 0) {
                transX = 0;
            } else if (currentIndex === queue.length - 1 && transX < 0) {
                transX = 0;
            }

            translateX.value = transX;
            opacity.value = Math.max(
                0.2,
                1 - Math.abs(transX) / SWIPE_OFFSET
            );
        })
        .onEnd((event) => {
            let transX = event.translationX;

            if (currentIndex === 0 && transX > 0) {
                transX = 0;
            } else if (currentIndex === queue.length - 1 && transX < 0) {
                transX = 0;
            }

            if (transX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(
                    -SWIPE_OFFSET,
                    { duration: 100 },
                    (finished) => {
                        if (finished) {
                            runOnJS(skipToNext)();
                        }
                    }
                );

                opacity.value = withTiming(0, { duration: 100 });
            } else if (transX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(
                    SWIPE_OFFSET,
                    { duration: 100 },
                    (finished) => {
                        if (finished) {
                            runOnJS(skipToPrevious)();
                        }
                    }
                );

                opacity.value = withTiming(0, { duration: 100 });
            } else {
                translateX.value = withSpring(0, SPRING_CONFIG);
                opacity.value = withTiming(1, { duration: 150 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <View className="flex-1 justify-center overflow-hidden w-full h-full py-2 bg-transparent">
                <Animated.View
                    style={[animatedStyle, { width: '100%' }]}
                >
                    <Text
                        numberOfLines={1}
                        className="text-white text-sm font-jakarta font-semibold tracking-tight"
                    >
                        {track?.title ?? 'Not Playing'}
                    </Text>

                    <Text
                        numberOfLines={1}
                        className="text-zinc-300 text-xs font-normal mt-0.5"
                    >
                        {track?.artist ?? 'Unknown Artist'}
                    </Text>
                </Animated.View>
            </View>
        </GestureDetector>
    );
}