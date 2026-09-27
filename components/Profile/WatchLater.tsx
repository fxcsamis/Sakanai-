// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WatchLaterVideo = {
    id: string;
    title: string;
    creator: string;
    duration: string;
    imageUrl: string;
};

// Demo data until this is wired to the real "save for later" action on the Home feed.
const DEMO: WatchLaterVideo[] = [];

export default function WatchLater() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [list, setList] = React.useState<WatchLaterVideo[]>(DEMO);

    const remove = (id: string) => setList((prev) => prev.filter((v) => v.id !== id));

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-4 py-3">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#0F172A'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">Watch Later</Text>
                    <View className="flex-1" />
                    <View className="rounded-xl px-2 py-1" style={{ backgroundColor: 'rgba(255,145,0,0.15)' }}>
                        <Text className="text-[12px] font-elms-med" style={{ color: '#FF9100' }}>
                            {list.length} Saved
                        </Text>
                    </View>
                </View>

                {list.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <View
                            className="w-[90px] h-[90px] rounded-full items-center justify-center"
                            style={{ backgroundColor: isDark ? '#1E293B' : '#FFF7ED' }}
                        >
                            <Clock size={32} color="#FF9100" />
                        </View>
                        <Text className="text-[16px] font-elms-med text-black dark:text-white mt-4">
                            No Watch Later Videos
                        </Text>
                        <Text className="text-[13px] font-elms text-zinc-400 mt-1.5 text-center">
                            Tap the Watch Later icon on any video thumbnail on the Home screen to save videos here for later viewing.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={list}
                        keyExtractor={(v) => v.id}
                        contentContainerStyle={{ padding: 16, gap: 12 }}
                        renderItem={({ item }) => (
                            <View
                                className="flex-row items-center rounded-2xl p-2.5"
                                style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }}
                            >
                                <View style={{ width: 100, height: 62, borderRadius: 10, overflow: 'hidden' }}>
                                    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    <View className="absolute bottom-1 right-1 bg-black/70 rounded px-1">
                                        <Text className="text-white text-[9px] font-elms">{item.duration}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text numberOfLines={2} className="text-[13px] font-elms-med text-black dark:text-white">
                                        {item.title}
                                    </Text>
                                    <Text className="text-[11px] font-elms text-zinc-500 mt-1">{item.creator}</Text>
                                </View>
                                <Pressable onPress={() => remove(item.id)} hitSlop={8} className="w-9 h-9 items-center justify-center">
                                    <Trash2 size={18} color="#EF4444" />
                                </Pressable>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
