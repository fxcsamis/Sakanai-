// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ProfileMenuItem({
    Icon,
    iconColor,
    title,
    subtitle,
    isDark,
    onPress,
    isLast = false,
}: {
    Icon: LucideIcon;
    iconColor?: string;
    title: string;
    subtitle?: string;
    isDark: boolean;
    onPress?: () => void;
    isLast?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-zinc-50 dark:active:bg-[#242424] ${
                isLast ? '' : 'border-b border-[#ECE3CE] dark:border-[#282828]'
            }`}
        >
            <View
                style={{ backgroundColor: (iconColor ?? (isDark ? '#E8C468' : '#B8860B')) + '1A' }}
                className="w-9 h-9 rounded-full items-center justify-center"
            >
                <Icon size={18} color={iconColor ?? (isDark ? '#E8C468' : '#B8860B')} />
            </View>
            <View className="flex-1">
                <Text className="text-[14px] text-black dark:text-white font-elms-med" numberOfLines={1}>
                    {title}
                </Text>
                {subtitle ? (
                    <Text className="text-[11.5px] text-zinc-500 dark:text-[#B3B3B3] font-elms mt-0.5" numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}
