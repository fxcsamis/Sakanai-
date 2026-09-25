// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const TOPICS = ['🔥 Trending videos', '⚡ Viral videos', '🎬 Movies', '🎵 Music videos', '📺 Live streams'];

// Reserve space on the left of the scroll row for the pinned Shorts + Live chips,
// so trending pills start scrolling from behind them. Wider than before so nothing
// peeks out on either side, plus room for the smoke-fade strip at the boundary.
const FIXED_W = 178;
const FADE_W = 26;

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
    // The header behind this row is semi-transparent (blur), but the pinned
    // Shorts/Live block must be fully solid or scrolling pills show through it.
    const solidBg = isDark ? '#121212' : '#FFFFFF';

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

            {/* Solid block: pinned Shorts + Live, flush against the left edge so nothing
                shows past them, and never see-through */}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: FIXED_W - FADE_W,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 10,
                    backgroundColor: solidBg,
                }}
            >
                {/* Opens the real Shorts feed */}
                <Pressable onPress={() => router.push('/shorts')} hitSlop={4} style={{ marginRight: 10 }}>
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

            {/* Smoke fade: the boundary where scrolling pills seem to dissolve away */}
            <LinearGradient
                pointerEvents="none"
                colors={[solidBg, `${solidBg}00`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    left: FIXED_W - FADE_W,
                    top: 0,
                    bottom: 0,
                    width: FADE_W,
                }}
            />
        </View>
    );
}
