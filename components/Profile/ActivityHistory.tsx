// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { ArrowLeft, Music2, PlayCircle, RotateCcw } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryItem = {
    id: string;
    type: 'Music' | 'Video' | 'Browser';
    title: string;
    subtitle: string;
    timestamp: string;
};

// Demo data until this is wired to real playback/browsing history.
const DEMO: HistoryItem[] = [];

const ICON_BG: Record<HistoryItem['type'], string> = {
    Music: '#ECFDF5',
    Video: '#EFF6FF',
    Browser: '#FEF3C7',
};
const ICON_COLOR: Record<HistoryItem['type'], string> = {
    Music: '#10B981',
    Video: '#3B82F6',
    Browser: '#D97706',
};

export default function ActivityHistory() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="items-center px-5 pt-2 pb-1">
                    <View className="absolute left-5 top-2">
                        <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center">
                            <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                        </Pressable>
                    </View>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white">Recent Cloud Activities</Text>
                    <Text className="text-[11px] font-elms text-zinc-400 mt-0.5 text-center">
                        Your local browsing, streaming & video history logs
                    </Text>
                </View>

                {DEMO.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-[13px] font-elms text-zinc-500">No activities recorded yet.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={DEMO}
                        keyExtractor={(i) => i.id}
                        contentContainerStyle={{ padding: 20, gap: 10 }}
                        renderItem={({ item }) => (
                            <View
                                className="flex-row items-center rounded-2xl p-3 border border-zinc-100 dark:border-[#282828]"
                                style={{ backgroundColor: isDark ? '#1A1A1A' : '#F8FAFC' }}
                            >
                                <View
                                    style={{ backgroundColor: ICON_BG[item.type], width: 32, height: 32, borderRadius: 16 }}
                                    className="items-center justify-center"
                                >
                                    {item.type === 'Music' && <Music2 size={16} color={ICON_COLOR.Music} />}
                                    {item.type === 'Video' && <PlayCircle size={16} color={ICON_COLOR.Video} />}
                                    {item.type === 'Browser' && <RotateCcw size={16} color={ICON_COLOR.Browser} />}
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text numberOfLines={1} className="text-[13px] font-elms-med text-black dark:text-white">
                                        {item.title}
                                    </Text>
                                    <Text numberOfLines={1} className="text-[11px] font-elms text-zinc-500">
                                        {item.subtitle}
                                    </Text>
                                </View>
                                <Text className="text-[10px] font-elms text-zinc-400 ml-1.5">{item.timestamp}</Text>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
