// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useThemePreference } from '@/components/context/themePreference';
import { useAppDrawer } from '@/hooks/useAppDrawer';
import { useAppSelector } from '@/hooks/useRedux';
import HomeRenderer from '@/sections/HomeRenderer';
import { customThemeColors, defaultAvtar } from '@/utils/constants';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Cloud, CloudOff, Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Animated as RNAnimated, NativeScrollEvent, NativeSyntheticEvent, Pressable, View } from 'react-native';
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
    const { isCustomTheme } = useThemePreference();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [mode, setMode] = React.useState<'online' | 'offline'>('offline');

    const searchBounce = useSharedValue(1);
    const searchIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: searchBounce.value }],
    }));

    // Top bar hide-on-scroll-down / reveal-on-scroll-up.
    // The nav row OVERLAYS the content (content is never pushed down by its full height),
    // so hiding it just reveals content that was already sitting there — nothing "foreign"
    // can ever show through. Only a thin status-bar-colored strip stays fixed at the very top.
    const translateY = React.useRef(new RNAnimated.Value(0)).current;
    const translateYNum = React.useRef(0);
    const lastOffset = React.useRef(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const diff = y - lastOffset.current;
        lastOffset.current = y;

        if (y <= 0) {
            translateYNum.current = 0;
            translateY.setValue(0);
            return;
        }

        let next = translateYNum.current - diff;
        next = Math.max(-TOP_BAR_HEIGHT, Math.min(0, next));
        translateYNum.current = next;
        translateY.setValue(next);
    };

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
    const peachBg = { backgroundColor: isDark ? customThemeColors.dark : customThemeColors.light };
    const useWarmBg = false; // Sunset theme removed
    const iconColor = isDark ? 'white' : 'black';
    const barBg = useWarmBg ? (isDark ? customThemeColors.dark : customThemeColors.light) : (isDark ? '#121212' : '#FFFFFF');

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]" style={useWarmBg ? peachBg : undefined}>
            <FocusAwareStatusBar style="auto" />

            {/* Body — content starts right below the status-bar strip; the nav row below
                overlays it and simply reveals/covers it as it hides/shows, so there's no
                reserved gap that could expose anything unexpected when it slides away. */}
            <View style={{ flex: 1, paddingTop: insets.top }}>
                {isOnline ? <View className="flex-1" /> : <HomeRenderer hideNav onScroll={handleScroll} />}
            </View>

            {/* Thin status-bar-colored strip — always fixed, never animates, so the real
                system status bar area is never exposed. */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: barBg }} />

            {/* Nav row — profile + search + download + online/offline toggle — curved + blurred.
                Overlays the top of the content and slides up under the strip above on
                scroll-down, back down on scroll-up. */}
            <RNAnimated.View
                style={{
                    position: 'absolute',
                    top: insets.top,
                    left: 0,
                    right: 0,
                    height: TOP_BAR_HEIGHT,
                    transform: [{ translateY }],
                    overflow: 'hidden',
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                }}
            >
                <BlurView
                    intensity={22}
                    tint={isDark ? 'dark' : 'light'}
                    style={{
                        flex: 1,
                        backgroundColor: isDark ? 'rgba(18,18,18,0.82)' : 'rgba(255,255,255,0.86)',
                    }}
                >
                    <View style={{ flex: 1 }} className="flex-row items-center justify-between px-5">
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
            </RNAnimated.View>
        </View>
    );
}
