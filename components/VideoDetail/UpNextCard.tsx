// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Download, MoreVertical, Play } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { DemoVideo } from '../Videos/demoVideos';

export default function UpNextCard({ video, isDark, onPress }: { video: DemoVideo; isDark: boolean; onPress: (video: DemoVideo) => void }) {
    return (
        <Pressable
            onPress={() => onPress(video)}
            className="rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#181818] border border-black/5 dark:border-white/10 mb-4"
        >
            <View className="aspect-video relative">
                <Image
                    source={{ uri: video.thumbnail }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                    <View className="bg-black/40 rounded-full p-2.5">
                        <Play color="white" fill="white" size={16} />
                    </View>
                </View>

                <View className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded-md">
                    <Text className="text-[10px] text-white font-elms-med">{video.duration}</Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between px-3 py-2.5">
                <View className="flex-1 pr-2">
                    <Text numberOfLines={2} className="text-[13px] font-elms-med text-gray-900 dark:text-white leading-4">
                        {video.title}
                    </Text>
                    <Text numberOfLines={1} className="text-[11px] text-gray-500 dark:text-[#B3B3B3] mt-1">
                        {video.channel} · {video.views}
                    </Text>
                </View>

                <View className="flex-row items-center gap-3">
                    <Download size={16} color={isDark ? '#B3B3B3' : '#64748B'} />
                    <MoreVertical size={16} color={isDark ? '#B3B3B3' : '#64748B'} />
                </View>
            </View>
        </Pressable>
    );
}
