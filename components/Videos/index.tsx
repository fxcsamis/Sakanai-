// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { useVideoPlayer } from '../context/videoplayer';
import { demoVideos } from './demoVideos';
import VideoCard from './VideoCard';
import VideoTopicsMarquee from './VideoTopicsMarquee';

const TITLE_ROW_HEIGHT = 52;
const MARQUEE_ROW_HEIGHT = 36;

export default function VideosScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { open } = useVideoPlayer();

    const headerHeight = insets.top + TITLE_ROW_HEIGHT + MARQUEE_ROW_HEIGHT;

    const translateY = React.useRef(new Animated.Value(0)).current;
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
        next = Math.max(-headerHeight, Math.min(0, next));
        translateYNum.current = next;
        translateY.setValue(next);
    };

    const handleSearch = () => router.push('/video-search');

    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    const handleOpenVideo = (video: (typeof demoVideos)[number]) => open(video);

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" />

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
                className="bg-white dark:bg-[#121212]"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: headerHeight,
                    paddingTop: insets.top,
                    transform: [{ translateY }],
                }}
            >
                <View style={{ height: TITLE_ROW_HEIGHT }} className="flex-row items-center justify-between px-4">
                    <Text className="text-xl font-elms-med text-gray-900 dark:text-white">
                        Videos
                    </Text>

                    <View className="flex-row items-center gap-2">
                        <Pressable
                            onPress={handleSearch}
                            hitSlop={8}
                            className="bg-slate-50 dark:bg-[#242424] p-2 rounded-full"
                        >
                            <Search color={isDark ? 'white' : 'black'} size={18} />
                        </Pressable>

                        <Pressable
                            onPress={handleDownload}
                            hitSlop={8}
                            className="bg-slate-50 dark:bg-[#242424] p-2 rounded-full"
                        >
                            <Download color={isDark ? 'white' : 'black'} size={18} />
                        </Pressable>
                    </View>
                </View>

                <VideoTopicsMarquee isDark={isDark} />
            </Animated.View>
        </View>
    );
}
