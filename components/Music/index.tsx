// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppDrawer } from '@/hooks/useAppDrawer';
import { useAppSelector } from '@/hooks/useRedux';
import HomeRenderer from '@/sections/HomeRenderer';
import { defaultAvtar } from '@/utils/constants';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Cloud, CloudOff, Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

const TOP_BAR_HEIGHT = 56;

export default function MusicScreen() {
    const { onOpen } = useAppDrawer();
    const { avatar, name } = useAppSelector(state => state.userReducer);
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
    const onlineBg = { backgroundColor: isDark ? '#241C18' : '#FDF0E7' };
    const iconColor = isDark ? 'white' : 'black';
    const headerHeight = insets.top + TOP_BAR_HEIGHT;

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]" style={isOnline ? onlineBg : undefined}>
            <FocusAwareStatusBar style="auto" />

            {/* Body — offline shows the existing Home content (its own nav hidden since we render one above);
                online is a blank canvas for now */}
            <View style={{ flex: 1, paddingTop: headerHeight }}>
                {isOnline ? <View className="flex-1" /> : <HomeRenderer hideNav />}
            </View>

            {/* Single top bar — profile + search + download + online/offline toggle — curved + blurred, used in both modes */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: headerHeight,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.45 : 0.1,
                    shadowRadius: 10,
                    elevation: 8,
                }}
            >
                <View style={{ flex: 1, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
                    <BlurView
                        intensity={22}
                        tint={isDark ? 'dark' : 'light'}
                        style={{
                            flex: 1,
                            paddingTop: insets.top,
                            backgroundColor: isDark ? 'rgba(18,18,18,0.82)' : 'rgba(255,255,255,0.86)',
                        }}
                    >
                        <View style={{ height: TOP_BAR_HEIGHT }} className="flex-row items-center justify-between px-5">
                            <Pressable onPress={onOpen} hitSlop={10}>
                                <Avatar size="md">
                                    <AvatarFallbackText>{name}</AvatarFallbackText>
                                    <AvatarImage source={{ uri: avatar || defaultAvtar }} />
                                </Avatar>
                            </Pressable>

                            <View className="flex-row items-center gap-2">
                                <Animated.View style={searchIconStyle}>
                                    <Pressable onPress={handleSearch} hitSlop={10} className="bg-slate-50 dark:bg-[#242424] p-2 rounded-full">
                                        <Search size={18} color={iconColor} />
                                    </Pressable>
                                </Animated.View>

                                <Pressable onPress={handleDownload} hitSlop={10} className="bg-slate-50 dark:bg-[#242424] p-2 rounded-full">
                                    <Download size={18} color={iconColor} />
                                </Pressable>

                                <View className="flex-row rounded-full p-1 bg-slate-50 dark:bg-[#242424]">
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
                    </BlurView>
                </View>
            </View>
        </View>
    );
}
