// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { PlayList } from '@/types/database';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';

interface LibraryCardProps {
    isGrid?: boolean;
    playList: PlayList
}

export default function LibraryCard({ isGrid = false, playList }: LibraryCardProps) {
    const opacity = useRef(new Animated.Value(1)).current;
    const router = useRouter();

    const pressIn = () => {
        Animated.timing(opacity, { toValue: 0.5, duration: 50, useNativeDriver: true }).start();
    }

    const pressOut = () => {
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        router.push({
            pathname: '/(tabs)/playlist/[playlistId]',
            params: { playlistId: playList.id }
        })
    }

    if (isGrid) {
        return (
            <Pressable onPressIn={pressIn} onPressOut={pressOut} className='flex-1 p-1.5'>
                <Animated.View style={{ opacity }}>
                    <Image
                        source={{ uri: playList.cover }}
                        className='w-full aspect-square'
                        resizeMode='cover'
                    />
                    <Text numberOfLines={1} className='text-zinc-900 dark:text-white text-[13px] font-bold mt-2.5 tracking-tight'>
                        {playList.title}
                    </Text>
                    <Text numberOfLines={1} className='text-zinc-400 dark:text-[#B3B3B3] text-[11px] mt-0.5'>
                        Playlist • Arise
                    </Text>
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Pressable onPressIn={pressIn} onPressOut={pressOut}>
            <Animated.View style={{ opacity }} className='flex-row items-center gap-3 pb-3'>
                <Image
                    source={{ uri: playList.cover }}
                    className='w-[4.5rem] h-[4.5rem]'
                    resizeMode='cover'
                />
                <View className='flex-1 gap-1'>
                    <Text numberOfLines={1} className='text-zinc-900 dark:text-white text-lg font-elms-med tracking-tight'>
                        {playList.title}
                    </Text>
                    <Text numberOfLines={1} className='text-zinc-400 dark:text-[#B3B3B3] text-[12px]'>
                        Playlist • Arise
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}