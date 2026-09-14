// Copyright (c) 2026 Raj
// See LICENSE for details.

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaveThumbProps {
    isPlaying: boolean;
    sliderWidth: SharedValue<number>;
    progressX: SharedValue<number>;
}

export function WaveThumb({ isPlaying = true, sliderWidth, progressX }: WaveThumbProps) {
    const CYCLE_WIDTH = 24;

    const translateX = useSharedValue(-CYCLE_WIDTH);
    const amplitude = useSharedValue(isPlaying ? 1 : 0);

    useEffect(() => {
        amplitude.value = withTiming(isPlaying ? 1 : 0, { duration: 400 });

        if (isPlaying) {
            translateX.value = -CYCLE_WIDTH;
            translateX.value = withRepeat(
                withTiming(0, {
                    duration: 1000,
                    easing: Easing.linear,
                }),
                -1,
                false
            );
        }
    }, [isPlaying, translateX, amplitude]);

    const animatedProps = useAnimatedProps(() => {
        const width = sliderWidth.value;
        const cycles = width > 0 ? Math.ceil(width / CYCLE_WIDTH) + 2 : 1;
        const currentAmp = amplitude.value * 8;

        let d = `M 0 10 `;

        for (let i = 0; i < cycles; i++) {
            const startX = i * CYCLE_WIDTH;
            d += `Q ${startX + 6} ${10 - currentAmp}, ${startX + 12} 10 `;
            d += `T ${startX + 24} 10 `;
        }

        return { d };
    });

    const animatedSvgProps = useAnimatedProps(() => ({
        width: sliderWidth.value + CYCLE_WIDTH * 2,
    }));

    const animatedSvgStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const waveContainerStyle = useAnimatedStyle(() => ({
        width: progressX.value,
        height: 20,
        overflow: 'hidden',
    }));

    const thumbStyle = useAnimatedStyle(() => {
        const width = withTiming(isPlaying ? 4 : 14, { duration: 400 });
        const height = withTiming(isPlaying ? 18 : 14, { duration: 400 });
        const radius = withTiming(isPlaying ? 2 : 7, { duration: 400 });

        return {
            width,
            height,
            borderRadius: radius,
            backgroundColor: '#ffffff',
            position: 'absolute',
            left: 0,
            transform: [
                { translateX: progressX.value }
            ],
        };
    });

    const guiderStyle = useAnimatedStyle(() => {
        return {
            left: progressX.value,
        };
    });

    return (
        <View className="w-full h-[20px] justify-center relative">

            <Animated.View
                className="absolute right-0 h-[2px] bg-white/30 top-1/2 -mt-[1px]"
                style={guiderStyle}
            />

            <Animated.View style={waveContainerStyle}>
                <AnimatedSvg
                    height={20}
                    animatedProps={animatedSvgProps}
                    style={animatedSvgStyle}
                >
                    <AnimatedPath
                        animatedProps={animatedProps}
                        stroke="#ffffff"
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </AnimatedSvg>
            </Animated.View>

            <Animated.View style={thumbStyle} />

        </View>
    );
}