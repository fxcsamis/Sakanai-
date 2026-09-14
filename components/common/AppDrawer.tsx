// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { defaultAvtar } from '@/utils/constants';
import { Link } from 'expo-router';
import { Home, Library, Music, Music2, Search, Settings } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.65;
const DISMISS_THRESHOLD = DRAWER_WIDTH * 0.4;

const timing = { duration: 280, easing: Easing.out(Easing.cubic) };

export default function AppDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const translateX = useSharedValue(-DRAWER_WIDTH);
    const opacity = useSharedValue(0);
    const context = useSharedValue(0);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { avatar, name } = useAppSelector(state => state.userReducer);

    useEffect(() => {
        if (open) {
            opacity.value = withTiming(1, { duration: 250 });
            translateX.value = withTiming(0, timing);
        } else {
            opacity.value = withTiming(0, { duration: 250 });
            translateX.value = withTiming(-DRAWER_WIDTH, timing);
        }
    }, [open]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = translateX.value;
        })
        .onUpdate((e) => {
            translateX.value = Math.min(0, Math.max(-DRAWER_WIDTH, context.value + e.translationX));
            opacity.value = 1 - Math.abs(translateX.value) / DRAWER_WIDTH;
        })
        .onEnd(() => {
            if (Math.abs(translateX.value) > DISMISS_THRESHOLD) {
                opacity.value = withTiming(0, { duration: 200 });
                translateX.value = withTiming(-DRAWER_WIDTH, timing, () => scheduleOnRN(onClose));
            } else {
                translateX.value = withTiming(0, timing);
                opacity.value = withTiming(1, { duration: 200 });
            }
        });

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!open) return null;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}>

            <Animated.View style={[{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
            }, backdropStyle]}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
            </Animated.View>

            <GestureDetector gesture={gesture}>
                <Animated.View style={[{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: DRAWER_WIDTH,
                    backgroundColor: isDark ? '#121212' : '#fff',
                }, drawerStyle]}>

                    <View className='flex-row items-center justify-between px-5 pt-14 pb-5 border-b border-zinc-100 dark:border-[#282828]'>
                        <View className='flex-row gap-3 items-center'>
                            <Avatar size="md">
                                <AvatarFallbackText>{name}</AvatarFallbackText>
                                <AvatarImage
                                    source={{
                                        uri: avatar || defaultAvtar,
                                    }}
                                />
                            </Avatar>

                            <View className="flex flex-col justify-center">
                                <Text className="text-lg font-elms-med text-black dark:text-white mb-0.5">
                                    {name}
                                </Text>
                                <Text className="text-sm font-elms text-gray-500 dark:text-[#B3B3B3] leading-none tracking-tight">
                                    Arise
                                </Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>

                        <View className='px-3 pt-2 gap-1'>

                            <Link href={'/(tabs)/home'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Home size={20} color={isDark ? '#FFFFFF' : '#000'} strokeWidth={1.8} />
                                    <Text className='text-black dark:text-white font-elms-med text-sm'>Home</Text>
                                </TouchableOpacity>
                            </Link>

                            <Link href={'/(tabs)/search'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Search size={20} color={isDark ? '#FFFFFF' : '#000'} strokeWidth={1.8} />
                                    <Text className='text-black dark:text-white font-elms-med text-sm'>Search</Text>
                                </TouchableOpacity>
                            </Link>

                            <Link href={'/(tabs)/shorts'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Music2 size={20} color={isDark ? '#FFFFFF' : '#000'} strokeWidth={1.8} />
                                    <Text className='text-black dark:text-white font-elms-med text-sm'>Vibes</Text>
                                </TouchableOpacity>
                            </Link>

                            <Link href={'/(tabs)/library'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Library size={20} color={isDark ? '#FFFFFF' : '#000'} strokeWidth={1.8} />
                                    <Text className='text-black dark:text-white font-elms-med text-sm'>Library</Text>
                                </TouchableOpacity>
                            </Link>

                            <Link href={'/(tabs)/music_library'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Music size={20} color={isDark ? '#FFFFFF' : '#000'} strokeWidth={1.8} />
                                    <Text className='text-black dark:text-white font-elms-med text-sm'>Music Library</Text>
                                </TouchableOpacity>
                            </Link>

                        </View>

                        <View className='mx-4 my-3 h-px bg-zinc-100 dark:bg-[#282828]' />

                        <View className='px-3 gap-1'>
                            <Link href={'/setting'} onPress={onClose} asChild>
                                <TouchableOpacity className='flex-row items-center gap-3 px-3 py-3 rounded-xl active:bg-zinc-100 dark:active:bg-[#282828]'>
                                    <Settings size={20} color={isDark ? '#B3B3B3' : '#71717a'} strokeWidth={1.8} />
                                    <Text className='text-zinc-500 dark:text-[#B3B3B3] font-elms-med text-sm'>Account & Settings</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                    </ScrollView>

                </Animated.View>
            </GestureDetector>

        </View>
    );
}