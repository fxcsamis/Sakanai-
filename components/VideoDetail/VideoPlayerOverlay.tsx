// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { VideoView, useVideoPlayer as useExpoVideoPlayer } from 'expo-video';
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
const MINI_WIDTH = 220;
const MINI_HEIGHT = (MINI_WIDTH * 9) / 16;
const MINI_MARGIN_RIGHT = 10;
const MINI_SCALE = MINI_WIDTH / SCREEN_W;
const DRAG_DISTANCE = SCREEN_H * 0.35;

export default function VideoPlayerOverlay() {
    const { activeVideo } = useVideoPlayer();
    // Mounting expo-video's player hook is deferred until a video is actually
    // opened — calling it unconditionally at the app root on every launch was
    // causing the app to crash immediately on open.
    if (!activeVideo) return null;
    return <VideoPlayerOverlayInner />;
}

function VideoPlayerOverlayInner() {
    const { activeVideo, minimized, minimize, expand, close, open } = useVideoPlayer();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const MINI_MARGIN_BOTTOM = insets.bottom + 78;
    const baseLeftMini = SCREEN_W - MINI_WIDTH - MINI_MARGIN_RIGHT;
    const baseTopMini = SCREEN_H - MINI_HEIGHT - MINI_MARGIN_BOTTOM;

    const progress = useSharedValue(0);
    // Free-drag offset for the mini PiP window, relative to its default docked corner.
    const miniTranslateX = useSharedValue(0);
    const miniTranslateY = useSharedValue(0);
    const dragStartX = useSharedValue(0);
    const dragStartY = useSharedValue(0);

    // Native, direct-file player — no WebView, no YouTube embed, so nothing to
    // break or get bot-checked. Source is swapped manually so switching videos
    // (via "Up next") never remounts the player.
    const player = useExpoVideoPlayer(activeVideo?.videoUrl ?? null, (p) => {
        p.loop = true;
    });

    const [isReady, setIsReady] = React.useState(false);
    const [loadError, setLoadError] = React.useState(false);

    React.useEffect(() => {
        if (!activeVideo) return;
        setIsReady(false);
        setLoadError(false);
        player.replace(activeVideo.videoUrl);
        player.play();
    }, [activeVideo?.id]);

    React.useEffect(() => {
        const sub = player.addListener('statusChange', (payload: { status: string }) => {
            if (payload.status === 'readyToPlay') {
                setIsReady(true);
                setLoadError(false);
            } else if (payload.status === 'error') {
                setLoadError(true);
            }
        });
        // The player may already be ready (or already errored) by the time this
        // listener attaches — without this check, a fast-loading video's status
        // change can be missed entirely, leaving the spinner stuck forever.
        if (player.status === 'readyToPlay') setIsReady(true);
        if (player.status === 'error') setLoadError(true);
        return () => sub.remove();
    }, [player]);

    const handleRetry = () => {
        if (!activeVideo) return;
        setLoadError(false);
        setIsReady(false);
        player.replace(activeVideo.videoUrl);
        player.play();
    };

    React.useEffect(() => {
        if (!activeVideo) return;
        progress.value = withTiming(minimized ? 1 : 0, { duration: 260 });
    }, [minimized, activeVideo]);

    React.useEffect(() => {
        if (!minimized) {
            miniTranslateX.value = 0;
            miniTranslateY.value = 0;
        }
    }, [minimized]);

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
            await Share.share({ message: activeVideo.title });
        } catch { }
    };

    const handleComment = () => Alert.alert('Comments', 'Comments will be available soon.');
    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    // Drag DOWN on the expanded player to minimize it into the PiP window.
    const minimizePan = Gesture.Pan()
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

    // Once minimized, the PiP window can be freely dragged anywhere on screen.
    // A small activation threshold keeps a quick tap from being swallowed by
    // this pan gesture, so tapping to reopen still works.
    const dragPan = Gesture.Pan()
        .enabled(minimized)
        .activeOffsetX([-6, 6])
        .activeOffsetY([-6, 6])
        .onBegin(() => {
            dragStartX.value = miniTranslateX.value;
            dragStartY.value = miniTranslateY.value;
        })
        .onChange((event) => {
            const minX = 8 - baseLeftMini;
            const maxX = (SCREEN_W - MINI_WIDTH - 8) - baseLeftMini;
            const minY = (insets.top + 8) - baseTopMini;
            const maxY = (SCREEN_H - MINI_HEIGHT - 8) - baseTopMini;

            const nx = dragStartX.value + event.translationX;
            const ny = dragStartY.value + event.translationY;

            miniTranslateX.value = Math.min(maxX, Math.max(minX, nx));
            miniTranslateY.value = Math.min(maxY, Math.max(minY, ny));
        });

    const tap = Gesture.Tap()
        .enabled(minimized)
        .onEnd(() => {
            scheduleOnRN(expand);
        });

    // The bounding box that clips/positions the player. The actual video view
    // is rendered at a FIXED size always (see below) and only visually scaled
    // via a transform, so it never resizes/reflows mid-gesture.
    const boxStyle = useAnimatedStyle(() => {
        const width = interpolate(progress.value, [0, 1], [SCREEN_W, MINI_WIDTH], Extrapolation.CLAMP);
        const height = interpolate(progress.value, [0, 1], [PLAYER_HEIGHT_FULL, MINI_HEIGHT], Extrapolation.CLAMP);
        const top = interpolate(progress.value, [0, 1], [0, baseTopMini], Extrapolation.CLAMP) + miniTranslateY.value * progress.value;
        const left = interpolate(progress.value, [0, 1], [0, baseLeftMini], Extrapolation.CLAMP) + miniTranslateX.value * progress.value;
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
        const top = interpolate(progress.value, [0, 1], [0, baseTopMini], Extrapolation.CLAMP) + miniTranslateY.value * progress.value;
        const left = interpolate(progress.value, [0, 1], [0, baseLeftMini], Extrapolation.CLAMP) + miniTranslateX.value * progress.value;
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

            <GestureDetector gesture={Gesture.Simultaneous(minimizePan, dragPan, tap)}>
                <Animated.View style={boxStyle}>
                    <Animated.View style={scaleStyle}>
                        <VideoView
                            player={player}
                            style={{ width: SCREEN_W, height: PLAYER_HEIGHT_FULL }}
                            contentFit="cover"
                            nativeControls={!minimized}
                        />
                    </Animated.View>

                    {!isReady && !minimized && (
                        <View
                            pointerEvents={loadError ? 'auto' : 'none'}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#000',
                            }}
                        >
                            {loadError ? (
                                <>
                                    <Text style={{ color: 'white', marginBottom: 12 }}>Couldn't load this video</Text>
                                    <Pressable
                                        onPress={handleRetry}
                                        style={{ backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
                                    >
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <ActivityIndicator color="#fff" size="large" />
                            )}
                        </View>
                    )}
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
