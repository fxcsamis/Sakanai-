// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
    ChevronDown,
    Download,
    MessageCircle,
    Share2,
    ThumbsUp,
    X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer } from '../context/videoplayer';
import { DemoVideo, demoVideos } from '../Videos/demoVideos';
import UpNextCard from './UpNextCard';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PLAYER_HEIGHT_FULL = (SCREEN_W * 9) / 16;
const MINI_WIDTH = 160;
const MINI_HEIGHT = (MINI_WIDTH * 9) / 16;
const MINI_MARGIN_RIGHT = 10;
const MINI_SCALE = MINI_WIDTH / SCREEN_W;
const DRAG_DISTANCE = SCREEN_H * 0.35;

export default function VideoPlayerOverlay() {
    const { activeVideo, minimized, minimize, expand, close, open } = useVideoPlayer();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const MINI_MARGIN_TOP = insets.top + 66;

    const progress = useSharedValue(0);

    React.useEffect(() => {
        if (!activeVideo) return;
        progress.value = withTiming(minimized ? 1 : 0, { duration: 260 });
    }, [minimized, activeVideo]);

    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(1200);

    React.useEffect(() => {
        setLiked(false);
        setLikeCount(1200);
    }, [activeVideo?.id]);

    const upNext = React.useMemo(
        () => demoVideos.filter((v) => v.id !== activeVideo?.id),
        [activeVideo?.id]
    );

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleShare = async () => {
        if (!activeVideo) return;
        try {
            await Share.share({ message: `${activeVideo.title} — https://www.youtube.com/watch?v=${activeVideo.youtubeId}` });
        } catch { }
    };

    const handleComment = () => Alert.alert('Comments', 'Comments will be available soon.');
    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    const pan = Gesture.Pan()
        .enabled(!minimized)
        .activeOffsetY([-1, 10])
        .onChange((event) => {
            if (event.translationY <= 0) return;
            progress.value = Math.min(1, event.translationY / DRAG_DISTANCE);
        })
        .onEnd((event) => {
            if (progress.value > 0.35 || event.velocityY > 800) {
                progress.value = withTiming(1, { duration: 220 });
                scheduleOnRN(minimize);
            } else {
                progress.value = withTiming(0, { duration: 200 });
            }
        });

    const tap = Gesture.Tap()
        .enabled(minimized)
        .onEnd(() => {
            scheduleOnRN(expand);
        });

    // The bounding box that clips/positions the player. The actual YoutubePlayer
    // is rendered at a FIXED size always (see below) and only visually scaled via
    // a transform, so its internal WebView never resizes/reloads — that resize
    // was what caused the drag glitching and playback restarting.
    const boxStyle = useAnimatedStyle(() => {
        const width = interpolate(progress.value, [0, 1], [SCREEN_W, MINI_WIDTH], Extrapolation.CLAMP);
        const height = interpolate(progress.value, [0, 1], [PLAYER_HEIGHT_FULL, MINI_HEIGHT], Extrapolation.CLAMP);
        const top = interpolate(progress.value, [0, 1], [0, MINI_MARGIN_TOP], Extrapolation.CLAMP);
        const left = interpolate(progress.value, [0, 1], [0, SCREEN_W - MINI_WIDTH - MINI_MARGIN_RIGHT], Extrapolation.CLAMP);
        const borderRadius = interpolate(progress.value, [0, 1], [0, 12], Extrapolation.CLAMP);
        return {
            position: 'absolute',
            top,
            left,
            width,
            height,
            borderRadius,
            overflow: 'hidden',
        };
    });

    const scaleStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1, MINI_SCALE], Extrapolation.CLAMP);
        return {
            width: SCREEN_W,
            height: PLAYER_HEIGHT_FULL,
            transform: [{ scale }],
            // @ts-ignore - RN 0.81 supports transformOrigin
            transformOrigin: 'top left',
        };
    });

    const infoPanelStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 0.3], [1, 0], Extrapolation.CLAMP);
        return { opacity };
    });

    const miniCloseStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP);
        const top = interpolate(progress.value, [0, 1], [0, MINI_MARGIN_TOP], Extrapolation.CLAMP);
        const left = interpolate(progress.value, [0, 1], [0, SCREEN_W - MINI_WIDTH - MINI_MARGIN_RIGHT], Extrapolation.CLAMP);
        return { opacity, top: top - 8, left: left + MINI_WIDTH - 10 };
    });

    if (!activeVideo) return null;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
            <Animated.View
                style={[
                    infoPanelStyle,
                    {
                        position: 'absolute',
                        top: PLAYER_HEIGHT_FULL,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: isDark ? '#121212' : 'white',
                    },
                ]}
                pointerEvents={minimized ? 'none' : 'auto'}
            >
                <View className="flex-row items-center px-4 pt-3 pb-1">
                    <Pressable onPress={minimize} hitSlop={10} className="p-1 -ml-1">
                        <ChevronDown color={isDark ? 'white' : 'black'} size={22} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="px-4 pt-1">
                        <Text className="text-[17px] font-elms-med text-gray-900 dark:text-white leading-6">
                            {activeVideo.title}
                        </Text>
                        <Text className="text-[12px] text-gray-500 dark:text-[#B3B3B3] mt-1.5">
                            {activeVideo.channel} · {activeVideo.views}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between px-6 mt-5">
                        <Pressable onPress={toggleLike} className="items-center gap-1">
                            <View className={`p-3 rounded-full ${liked ? 'bg-blue-50 dark:bg-blue-500/20' : 'bg-slate-50 dark:bg-[#181818]'}`}>
                                <ThumbsUp size={18} color={liked ? '#3B82F6' : (isDark ? '#B3B3B3' : '#64748B')} fill={liked ? '#3B82F6' : 'transparent'} />
                            </View>
                            <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">{likeCount.toLocaleString()}</Text>
                        </Pressable>

                        <Pressable onPress={handleComment} className="items-center gap-1">
                            <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                                <MessageCircle size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                            </View>
                            <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Comment</Text>
                        </Pressable>

                        <Pressable onPress={handleShare} className="items-center gap-1">
                            <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                                <Share2 size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                            </View>
                            <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Share</Text>
                        </Pressable>

                        <Pressable onPress={handleDownload} className="items-center gap-1">
                            <View className="p-3 rounded-full bg-slate-50 dark:bg-[#181818]">
                                <Download size={18} color={isDark ? '#B3B3B3' : '#64748B'} />
                            </View>
                            <Text className="text-[11px] text-gray-500 dark:text-[#B3B3B3]">Download</Text>
                        </Pressable>
                    </View>

                    <View className="h-[1px] bg-black/5 dark:bg-white/10 mt-5 mx-4" />

                    <View className="px-4 pt-4">
                        <Text className="text-[14px] font-elms-med text-gray-900 dark:text-white mb-3">
                            Up next
                        </Text>

                        {upNext.map((item: DemoVideo) => (
                            <UpNextCard key={item.id} video={item} isDark={isDark} onPress={open} />
                        ))}
                    </View>
                </ScrollView>
            </Animated.View>

            <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
                <Animated.View style={boxStyle}>
                    <Animated.View style={scaleStyle}>
                        <YoutubePlayer
                            height={PLAYER_HEIGHT_FULL}
                            width={SCREEN_W}
                            videoId={activeVideo.youtubeId}
                            play
                            initialPlayerParams={{
                                controls: 1,
                                modestbranding: 1,
                                rel: 0,
                                iv_load_policy: 3,
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </GestureDetector>

            {minimized && (
                <Animated.View style={[miniCloseStyle, { position: 'absolute' }]}>
                    <Pressable onPress={close} hitSlop={10} className="bg-black rounded-full p-1">
                        <X color="white" size={13} />
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );
}
