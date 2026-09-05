// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Download,
    MessageCircle,
    Share2,
    ThumbsUp,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Dimensions, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { DemoVideo, demoVideos } from '../Videos/demoVideos';
import UpNextCard from './UpNextCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;

export default function VideoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const video = React.useMemo<DemoVideo | undefined>(
        () => demoVideos.find((v) => v.id === id),
        [id]
    );

    const upNext = React.useMemo(
        () => demoVideos.filter((v) => v.id !== id),
        [id]
    );

    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(1200);

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleShare = async () => {
        if (!video) return;
        try {
            await Share.share({ message: `${video.title} — https://www.youtube.com/watch?v=${video.youtubeId}` });
        } catch { }
    };

    const handleComment = () => Alert.alert('Comments', 'Comments will be available soon.');
    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    const handleOpenVideo = (next: DemoVideo) => router.push(`/video/${next.id}`);

    if (!video) {
        return (
            <View className="flex-1 bg-white dark:bg-[#121212] items-center justify-center">
                <Text className="text-gray-900 dark:text-white">Video not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="light" />

            <View style={{ width: SCREEN_WIDTH, height: PLAYER_HEIGHT }}>
                <YoutubePlayer
                    height={PLAYER_HEIGHT}
                    width={SCREEN_WIDTH}
                    videoId={video.youtubeId}
                    play
                    initialPlayerParams={{
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                    }}
                />

                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={10}
                    style={{ position: 'absolute', top: insets.top + 8, left: 12 }}
                    className="bg-black/50 rounded-full p-2"
                >
                    <ArrowLeft color="white" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-4 pt-4">
                    <Text className="text-[17px] font-elms-med text-gray-900 dark:text-white leading-6">
                        {video.title}
                    </Text>
                    <Text className="text-[12px] text-gray-500 dark:text-[#B3B3B3] mt-1.5">
                        {video.channel} · {video.views}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between px-6 mt-5">
                    <TouchableOpacity onPress={toggleLike} className="items-center gap-1">
                        <View className={`p-3 rounded-full ${liked ? 'bg-blue-50 dark:bg-blue-500/20' : 'bg-slate-50 dark:bg-[#181818]'}`}>
                            <ThumbsUp size={18} color={liked ? '#3B82F6' : (isDark ? '#B3B3B3' : '#64748B')} fill={liked ? '#3B82F6' : 'transparent'} />
                        </View>
                        <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">{likeCount.toLocaleString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleComment} className="items-center gap-1">
                        <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                            <MessageCircle size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                        </View>
                        <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Comment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleShare} className="items-center gap-1">
                        <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                            <Share2 size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                        </View>
                        <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleDownload} className="items-center gap-1">
                        <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                            <Download size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                        </View>
                        <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Download</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-[1px] bg-black/5 dark:bg-white/10 mt-5 mx-4" />

                <View className="px-4 pt-4">
                    <Text className="text-[14px] font-elms-med text-gray-900 dark:text-white mb-3">
                        Up next
                    </Text>

                    {upNext.map((item) => (
                        <UpNextCard key={item.id} video={item} isDark={isDark} onPress={handleOpenVideo} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
