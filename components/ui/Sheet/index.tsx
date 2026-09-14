// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { useEffect } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SheetProvider({ open, onClose, snap = 0.6, className = 'bg-white dark:bg-[#121212]', children, closeClassName }: { open?: boolean, onClose?: () => void, snap?: number, className?: string, children: React.JSX.Element, closeClassName?: string }) {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const context = useSharedValue(0);
    const SHEET_HEIGHT = SCREEN_HEIGHT * snap;

    useEffect(() => {
        if (open) {
            translateY.value = withTiming(0, {
                duration: 400,
                easing: Easing.out(Easing.quad)
            });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
        }
    }, [open]);

    const closeSheet = () => {
        translateY.value = withTiming(SCREEN_HEIGHT, {
            duration: 300,
            easing: Easing.in(Easing.quad)
        }, () => {
            scheduleOnRN(onClose!);
        });
    };

    const pan = Gesture.Pan()
        .activeOffsetY([-18, 18])
        .onBegin(() => {
            context.value = translateY.value;
        })
        .onChange((event) => {
            translateY.value = Math.max(0, context.value + event.translationY);
        })
        .onEnd((event) => {
            if (translateY.value > SHEET_HEIGHT * 0.2 || event.velocityY > 500) {
                scheduleOnRN(closeSheet);
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateY.value,
            [0, SHEET_HEIGHT],
            [0.5, 0],
            Extrapolation.CLAMP
        ),
        display: translateY.value >= SCREEN_HEIGHT ? 'none' : 'flex',
    }));

    return (
        <>
            <Animated.View
                className="absolute inset-0 top-[-1000%] bg-black z-[1000]"
                style={backdropStyle}
            >
                <Pressable className="flex-1" onPress={closeSheet} />
            </Animated.View>

            <GestureDetector gesture={pan}>
                <Animated.View
                    className={`absolute bottom-0 left-0 right-0 rounded-t-[32px] z-[1001] p-5 shadow-black/10 ${className}`}
                    style={[
                        sheetStyle,
                        {
                            height: SHEET_HEIGHT,
                            elevation: 20,
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                        }
                    ]}
                >
                    <View className={`w-12 h-1.5 bg-zinc-200 dark:bg-[#282828] self-center rounded-full ${closeClassName || ''}`} />
                    {children}
                </Animated.View>
            </GestureDetector>
        </>
    );
}