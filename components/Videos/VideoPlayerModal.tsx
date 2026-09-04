// Copyright (c) 2026 Raj
// See LICENSE for details.

import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import { DemoVideo } from './demoVideos';

export default function VideoPlayerModal({ video, onClose }: { video: DemoVideo | null; onClose: () => void }) {
    const insets = useSafeAreaInsets();
    const visible = !!video;

    const sheetStyle = useAnimatedStyle(() => ({
        opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
        transform: [
            { scale: withSpring(visible ? 1 : 0.92, { mass: 0.3, damping: 15, stiffness: 220 }) },
        ],
    }));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/90 justify-center">
                <Animated.View style={sheetStyle}>
                    <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-3 flex-row items-center justify-between">
                        <Text numberOfLines={1} className="text-white font-elms-med text-base flex-1 pr-3">
                            {video?.title}
                        </Text>
                        <Pressable onPress={onClose} className="bg-white/10 rounded-full p-2">
                            <X color="white" size={18} />
                        </Pressable>
                    </View>

                    {video && (
                        <View className="w-full">
                            <YoutubePlayer
                                height={220}
                                videoId={video.youtubeId}
                                play={visible}
                                initialPlayerParams={{
                                    controls: 1,
                                    modestbranding: 1,
                                    rel: 0,
                                    iv_load_policy: 3,
                                }}
                            />
                        </View>
                    )}

                    <View className="px-4 pt-3">
                        <Text className="text-white/70 text-xs">{video?.channel} · {video?.views}</Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
