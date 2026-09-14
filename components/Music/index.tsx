// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppDrawer } from '@/hooks/useAppDrawer';
import HomeRenderer from '@/sections/HomeRenderer';
import { useRouter } from 'expo-router';
import { Cloud, CloudOff, Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';

export default function MusicScreen() {
    const { onOpen } = useAppDrawer();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [mode, setMode] = React.useState<'online' | 'offline'>('offline');

    const searchBounce = useSharedValue(1);
    const searchIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: searchBounce.value }],
    }));

    const handleSearch = () => {
        searchBounce.value = withSequence(
            withTiming(0.8, { duration: 90 }),
            withTiming(1.15, { duration: 120 }),
            withTiming(1, { duration: 120 })
        );
        router.push('/music-search');
    };

    const handleDownload = () => Alert.alert('Downloads', 'Your downloads will show here.');

    const isOnline = mode === 'online';

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" />

            {isOnline ? (
                <View className="flex-1" style={{ backgroundColor: isDark ? '#241C18' : '#FDF0E7' }}>
                    <SafeAreaView edges={['top']}>
                        <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
                            <Pressable
                                onPress={onOpen}
                                hitSlop={10}
                                className="p-2 rounded-full bg-black/5 dark:bg-white/10"
                            >
                                <Image
                                    source={require('@/assets/arise/arise.png')}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                            </Pressable>

                            <View className="flex-row items-center gap-2">
                                <Animated.View style={searchIconStyle}>
                                    <Pressable
                                        onPress={handleSearch}
                                        hitSlop={10}
                                        className="p-2 rounded-full bg-black/5 dark:bg-white/10"
                                    >
                                        <Search size={18} color={isDark ? '#F3D9CC' : '#7A3B2E'} />
                                    </Pressable>
                                </Animated.View>

                                <Pressable
                                    onPress={handleDownload}
                                    hitSlop={10}
                                    className="p-2 rounded-full bg-black/5 dark:bg-white/10"
                                >
                                    <Download size={18} color={isDark ? '#F3D9CC' : '#7A3B2E'} />
                                </Pressable>
                            </View>
                        </View>
                    </SafeAreaView>

                    {/* Blank for now — online content will be designed next */}
                    <View className="flex-1" />
                </View>
            ) : (
                <HomeRenderer />
            )}

            {/* Persistent online/offline switch, floating above whichever mode is active */}
            <Pressable
                onPress={() => setMode(isOnline ? 'offline' : 'online')}
                hitSlop={10}
                style={{ position: 'absolute', top: insets.top + 8, right: 16 }}
                className={`flex-row items-center gap-1 rounded-full px-2 py-2 ${isOnline ? 'bg-black/10' : 'bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#282828]'}`}
            >
                {isOnline ? (
                    <Cloud size={16} color="#FF6F4E" />
                ) : (
                    <CloudOff size={16} color={isDark ? 'white' : 'black'} />
                )}
            </Pressable>
        </View>
    );
}
