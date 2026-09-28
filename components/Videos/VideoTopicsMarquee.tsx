// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clapperboard, Flame, LucideIcon, Music2, Tv, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const TOPICS: { label: string; Icon: LucideIcon }[] = [
    { label: 'Trending videos', Icon: Flame },
    { label: 'Viral videos', Icon: Zap },
    { label: 'Movies', Icon: Clapperboard },
    { label: 'Music videos', Icon: Music2 },
    { label: 'Live streams', Icon: Tv },
];

// Reserve just enough space on the left for the pinned Shorts + Live badges (sized to
// them, not a wide guess), plus a slim smoke-fade strip where scrolling pills reappear.
const FIXED_W = 110;
const FADE_W = 14;

function Pill({ text, Icon, isDark }: { text: string; Icon: LucideIcon; isDark: boolean }) {
    return (
        <View
            style={{
                marginRight: 10,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31,36,48,0.06)',
            }}
        >
            <Icon size={13} color={isDark ? '#E8C468' : '#B8860B'} />
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
                {TOPICS.map((t) => (
                    <Pill key={t.label} text={t.label} Icon={t.Icon} isDark={isDark} />
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
                <Pressable onPress={() => router.push('/shorts')} hitSlop={4} style={{ marginRight: 16 }}>
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
