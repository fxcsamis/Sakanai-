// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const TOPICS = ['🔥 Trending videos', '⚡ Viral videos', '🎬 Movies', '🎵 Music videos', '📺 Live streams'];

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
    return (
        <View style={{ height: 36, backgroundColor }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}
            >
                {TOPICS.map((t, i) => (
                    <Pill key={i} text={t} isDark={isDark} />
                ))}
            </ScrollView>
        </View>
    );
}
