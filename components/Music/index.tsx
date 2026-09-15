// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppDrawer } from '@/hooks/useAppDrawer';
import HomeRenderer from '@/sections/HomeRenderer';
import { useRouter } from 'expo-router';
import { Cloud, CloudOff, Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';

export default function MusicScreen() {
    const { onOpen } = useAppDrawer();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
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
    const onlineBg = { backgroundColor: isDark ? '#241C18' : '#FDF0E7' };
    const iconColor = isOnline ? (isDark ? '#F3D9CC' : '#7A3B2E') : (isDark ? 'white' : 'black');
    const pillClass = isOnline ? 'bg-black/5 dark:bg-white/10' : 'bg-slate-50 dark:bg-[#181818]';

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]" style={isOnline ? onlineBg : undefined}>
            <FocusAwareStatusBar style="auto" />

            {/* Single top bar — profile + search + download + online/offline toggle — used in both modes */}
            <SafeAreaView edges={['top']} style={isOnline ? onlineBg : undefined}>
                <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
                    <Pressable onPress={onOpen} hitSlop={10} className={`p-2 rounded-full ${pillClass}`}>
                        <Image
                            source={require('@/assets/arise/arise.png')}
                            style={{ width: 20, height: 20 }}
                            resizeMode="contain"
                        />
                    </Pressable>

                    <View className="flex-row items-center gap-2">
                        <Animated.View style={searchIconStyle}>
                            <Pressable onPress={handleSearch} hitSlop={10} className={`p-2 rounded-full ${pillClass}`}>
                                <Search size={18} color={iconColor} />
                            </Pressable>
                        </Animated.View>

                        <Pressable onPress={handleDownload} hitSlop={10} className={`p-2 rounded-full ${pillClass}`}>
                            <Download size={18} color={iconColor} />
                        </Pressable>

                        <View className={`flex-row rounded-full p-1 ${pillClass}`}>
                            <Pressable
                                onPress={() => setMode('offline')}
                                hitSlop={6}
                                className={`p-1.5 rounded-full ${!isOnline ? 'bg-white dark:bg-[#333]' : ''}`}
                            >
                                <CloudOff size={16} color={!isOnline ? (isDark ? 'white' : 'black') : '#94A3B8'} />
                            </Pressable>
                            <Pressable
                                onPress={() => setMode('online')}
                                hitSlop={6}
                                className={`p-1.5 rounded-full ${isOnline ? 'bg-white/70 dark:bg-white/20' : ''}`}
                            >
                                <Cloud size={16} color={isOnline ? '#FF6F4E' : '#94A3B8'} />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* Body — offline shows the existing Home content (its own nav hidden since we render one above);
                online is a blank canvas for now */}
            {isOnline ? <View className="flex-1" /> : <HomeRenderer hideNav />}
        </View>
    );
}
