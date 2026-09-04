// Copyright (c) 2026 Raj
// See LICENSE for details.

import { AppTheme } from '@/components/context/apptheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import { Download, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { DemoVideo, demoVideos } from './demoVideos';
import VideoCard from './VideoCard';

export default function VideosScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { colorScheme } = useColorScheme();
    const isDark = (colorScheme === 'dark' ? colorScheme : theme) === AppTheme.dark;

    const handleSearch = () => router.push('/video-search');

    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    const handleOpenVideo = (video: DemoVideo) => router.push(`/video/${video.id}`);

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" />

            <SafeAreaView edges={['top']} className="bg-white dark:bg-[#121212]">
                <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
                    <Text className="text-xl font-elms-med text-gray-900 dark:text-white">
                        Videos
                    </Text>

                    <View className="flex-row items-center gap-2">
                        <Pressable
                            onPress={handleSearch}
                            hitSlop={8}
                            className="bg-slate-50 dark:bg-[#181818] p-2 rounded-full border border-slate-100 dark:border-[#282828]"
                        >
                            <Search color={isDark ? 'white' : 'black'} size={18} />
                        </Pressable>

                        <Pressable
                            onPress={handleDownload}
                            hitSlop={8}
                            className="bg-slate-50 dark:bg-[#181818] p-2 rounded-full border border-slate-100 dark:border-[#282828]"
                        >
                            <Download color={isDark ? 'white' : 'black'} size={18} />
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={demoVideos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 90 }}
                renderItem={({ item }) => <VideoCard video={item} onPress={handleOpenVideo} />}
            />
        </View>
    );
}
