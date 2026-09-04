// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React from "react";
import { Animated, Easing, Text, View } from "react-native";

export function ProgressBar({ progress }: { progress: number }) {
    const widthPct = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(widthPct, {
            toValue: progress,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    return (
        <View className="h-[3px] bg-slate-100 dark:bg-[#282828] rounded-sm overflow-hidden w-full">
            <Animated.View
                className="h-full rounded-sm bg-[#4F8EF7] dark:bg-white"
                style={{
                    width: widthPct.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
            />
        </View>
    );
}

export function StatCard({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
    return (
        <View className="flex-1 bg-slate-50 dark:bg-[#181818] rounded-[14px] py-4 items-center border-[0.5px] border-slate-200 dark:border-[#282828]">
            <Text className={`text-2xl font-[elms-bold] mb-1 ${colorClass}`}>{value}</Text>
            <Text className="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-[elms] tracking-[0.5px]">{label}</Text>
        </View>
    );
}