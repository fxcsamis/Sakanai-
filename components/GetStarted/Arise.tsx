// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import TermAndCondition from './TermAndCondition';

export default function Arise({ handleContinue }: { handleContinue: () => void }) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const scale = useSharedValue(1);

    const logoRef = React.useRef(null);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const pressed = useSharedValue<boolean>(false);

    const insets = useSafeAreaInsets();

    const tap = Gesture.Pan()
        .onBegin((event) => {
            pressed.value = true;
        })
        .onChange((event) => {
            offsetX.value = event.translationX;
            offsetY.value = event.translationY
        })
        .onEnd(() => {
            pressed.value = false;
            offsetX.value = withSpring(0, { damping: 50, stiffness: 200 });
            offsetY.value = withSpring(0, { damping: 50, stiffness: 200 });
        })

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withTiming(pressed.value ? 1.1 : 1) },
            { translateX: offsetX.value },
            { translateY: offsetY.value }
        ]
    }))

    useEffect(() => {
        scheduleOnRN(() => {
            opacity.value = 0;
            translateY.value = 30;

            opacity.value = withTiming(1, { duration: 800 });
            translateY.value = withTiming(0, { duration: 800 });
        })
    }, []);

    const handlePressIn = () => {
        scale.value = withTiming(0.92);
    };

    const handlePressOut = () => {
        scale.value = withTiming(1);
    };

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    const buttonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            width: '80%',
        };
    });



    return (
        <Animated.View
            className='flex-1 w-full flex-col justify-end items-center relative'
            style={containerStyle}
        >
            <View className='bg-white h-[50%] w-[150%] absolute bottom-0 self-center rounded-t-[100%] items-center' />

            <View
                className='items-center w-full'
                style={{ paddingBottom: insets.bottom + 32 }}
            >
                <GestureDetector gesture={tap}>
                    <Animated.View
                        className='relative h-28 w-28 overflow-hidden rounded-2xl bg-zinc-800 border border-zinc-700/50'
                        style={[{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, zIndex: 999 }, logoStyle]}
                        ref={logoRef}
                    >
                        <Image
                            source={require('@/assets/arise/arise.png')}
                            className='h-full w-full'
                            resizeMode='cover'
                        />
                        <View className='absolute inset-0 rounded-2xl border border-white/10' />
                    </Animated.View>
                </GestureDetector>

                <Text className='text-6xl font-elms mt-4'>Arise</Text>

                <Text className='text-center px-10 font-elms text-2xl py-8'>
                    The smartest way to listen, discover, and connect with sound.
                </Text>

                <Animated.View style={buttonStyle}>
                    <Pressable onPress={handleContinue}
                        className='bg-black rounded-full items-center justify-center py-4'
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
                    >
                        <Text className='text-white text-xl font-elms'>Get Started</Text>
                    </Pressable>
                </Animated.View>

                <TermAndCondition />
            </View>
        </Animated.View>

    );
}