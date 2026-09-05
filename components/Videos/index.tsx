// Copyright (c) 2026 Raj
// See LICENSE for details.

import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { DemoVideo, demoVideos } from './demoVideos';
import VideoCard from './VideoCard';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function VideosScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const headerHeight = insets.top + 56;

    const translateY = React.useRef(new Animated.Value(0)).current;
    const blurIntensity = React.useRef(new Animated.Value(0)).current;
    const translateYNum = React.useRef(0);
    const lastOffset = React.useRef(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const diff = y - lastOffset.current;
        lastOffset.current = y;

        if (y <= 0) {
            translateYNum.current = 0;
            translateY.setValue(0);
            blurIntensity.setValue(0);
            return;
        }

        let next = translateYNum.current - diff;
        next = Math.max(-headerHeight, Math.min(0, next));
        translateYNum.current = next;

        translateY.setValue(next);
        const progress = Math.abs(next) / headerHeight;
        blurIntensity.setValue(progress * 100);
    };

    const handleSearch = () => router.push('/video-search');

    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    const handleOpenVideo = (video: DemoVideo) => router.push(`/video/${video.id}`);

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" translucent />

            <FlatList
                data={demoVideos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: 90 }}
                renderItem={({ item }) => <VideoCard video={item} onPress={handleOpenVideo} />}
            />

            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: headerHeight,
                    transform: [{ translateY }],
                }}
            >
                <AnimatedBlurView
                    intensity={blurIntensity}
                    tint={isDark ? 'dark' : 'light'}
                    style={{
                        flex: 1,
                        paddingTop: insets.top,
                        overflow: 'hidden',
                    }}
                >
                    <View className="flex-1 flex-row items-center justify-between px-4">
                        <Text className="text-xl font-elms-med text-gray-900 dark:text-white">
                            Videos
                        </Text>

                        <View className="flex-row items-center gap-2">
                            <Pressable
                                onPress={handleSearch}
                                hitSlop={8}
                                className="bg-slate-50/70 dark:bg-white/10 p-2 rounded-full border border-slate-100 dark:border-white/10"
                            >
                                <Search color={isDark ? 'white' : 'black'} size={18} />
                            </Pressable>

                            <Pressable
                                onPress={handleDownload}
                                hitSlop={8}
                                className="bg-slate-50/70 dark:bg-white/10 p-2 rounded-full border border-slate-100 dark:border-white/10"
                            >
                                <Download color={isDark ? 'white' : 'black'} size={18} />
                            </Pressable>
                        </View>
                    </View>
                </AnimatedBlurView>
            </Animated.View>
        </View>
    );
}
