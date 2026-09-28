// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ProfileStatCard({
    title,
    value,
    Icon,
    isDark,
    onPress,
}: {
    title: string;
    value: string;
    Icon: LucideIcon;
    isDark: boolean;
    onPress?: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={{ flex: 1 }}
            className="rounded-2xl p-3 border border-[#ECE3CE] dark:border-[#282828] bg-[#FFFFFF] dark:bg-[#1A1A1A]"
        >
            <Icon size={18} color={isDark ? '#E8C468' : '#B8860B'} />
            <Text className="text-[11px] text-zinc-500 dark:text-[#B3B3B3] font-elms-med mt-2" numberOfLines={1}>
                {title}
            </Text>
            <Text className="text-[13px] text-black dark:text-white font-elms-med" numberOfLines={1}>
                {value}
            </Text>
        </Pressable>
    );
}
