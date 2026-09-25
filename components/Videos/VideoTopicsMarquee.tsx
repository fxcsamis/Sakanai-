// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const TOPICS = ['🔥 Trending videos', '⚡ Viral videos', '🎬 Movies', '🎵 Music videos', '📺 Live streams'];

// Reserve space on the left of the scroll row for the pinned Shorts + Live chips,
// so trending pills start scrolling from behind them.
const FIXED_W = 150;

function Pill({ text, isDark }: { text: string; isDark: boolean }) {
    return (
        <View
            style={{
                marginRight: 10,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
            }}
        >
            <Text
                className="text-[12px] font-elms-med text-gray-700 dark:text-white"
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    );
}

export default function VideoTopicsMarquee({ isDark, backgroundColor }: { isDark: boolean; backgroundColor?: string }) {
    const router = useRouter();

    return (
        <View style={{ height: 36, backgroundColor }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: FIXED_W, paddingRight: 4, alignItems: 'center' }}
            >
                {TOPICS.map((t, i) => (
                    <Pill key={i} text={t} isDark={isDark} />
                ))}
            </ScrollView>

            {/* Pinned to the top bar: scrolling topic pills pass underneath these */}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    left: 4,
                    top: 0,
                    bottom: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor,
                }}
            >
                {/* Opens the real Shorts feed */}
                <Pressable onPress={() => router.push('/shorts')} hitSlop={4} style={{ marginRight: 8 }}>
                    <Image
                        source={require('@/assets/arise/shorts-badge.png')}
                        style={{ width: 22, height: 17 }}
                        resizeMode="contain"
                    />
                </Pressable>

                <Pressable hitSlop={4}>
                    <Image
                        source={require('@/assets/arise/live-badge.png')}
                        style={{ width: 40, height: 17 }}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        </View>
    );
}
