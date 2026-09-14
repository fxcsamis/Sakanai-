// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TrackSheet({ open, onClose, snap = 1, className, children }: { open?: boolean, onClose?: () => void, snap?: number, className?: string, children: React.ReactNode }) {
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


    return (
        <GestureDetector gesture={pan}>
            <Animated.View
                className={`${className} absolute bottom-0 left-0 right-0 bg-black z-[1001] shadow-black/10`}
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
                {children}
            </Animated.View>
        </GestureDetector>
    );
}