// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { ArrowLeft, History, Mic, Search as SearchIcon, TrendingUp, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { DemoVideo, demoVideos } from '../Videos/demoVideos';
import UpNextCard from '../VideoDetail/UpNextCard';

const TRENDING = ['Big Buck Bunny', 'Sintel', 'Tears of Steel', 'Elephants Dream', 'Blender Foundation'];
const BADGE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#94A3B8', '#94A3B8'];

export default function VideoSearchScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [query, setQuery] = React.useState('');
    const [recent, setRecent] = React.useState<string[]>(['Big Buck Bunny', 'Open movie', 'Blender short film']);

    const results = React.useMemo<DemoVideo[]>(() => {
        if (!query.trim()) return [];
        const q = query.trim().toLowerCase();
        return demoVideos.filter(
            (v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q)
        );
    }, [query]);

    const commitSearch = (term: string) => {
        setQuery(term);
        setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 8));
    };

    const removeRecent = (term: string) => setRecent((prev) => prev.filter((t) => t !== term));

    const handleOpenVideo = (video: DemoVideo) => router.push(`/video/${video.id}`);

    const mutedColor = isDark ? '#B3B3B3' : '#64748B';

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" />

            <SafeAreaView edges={['top']} className="bg-white dark:bg-[#121212]">
                <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="p-1">
                        <ArrowLeft color={isDark ? 'white' : 'black'} size={22} />
                    </Pressable>

                    <View className="flex-1 flex-row items-center bg-slate-50 dark:bg-[#181818] rounded-full px-4 h-11 border border-slate-100 dark:border-[#282828]">
                        <SearchIcon size={16} color={mutedColor} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => query.trim() && commitSearch(query.trim())}
                            placeholder="Search videos..."
                            placeholderTextColor={mutedColor}
                            className="flex-1 ml-2 text-[14px] text-gray-900 dark:text-white"
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery('')} hitSlop={8}>
                                <X size={16} color={mutedColor} />
                            </Pressable>
                        )}
                    </View>

                    <Pressable hitSlop={10} className="p-1">
                        <Mic color={isDark ? 'white' : 'black'} size={20} />
                    </Pressable>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
                {query.trim().length > 0 ? (
                    results.length > 0 ? (
                        <View className="pt-2">
                            {results.map((video) => (
                                <UpNextCard key={video.id} video={video} isDark={isDark} onPress={handleOpenVideo} />
                            ))}
                        </View>
                    ) : (
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-400 dark:text-[#B3B3B3]">No videos found</Text>
                        </View>
                    )
                ) : (
                    <>
                        {recent.length > 0 && (
                            <View className="pt-4">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-[15px] font-elms-med text-gray-900 dark:text-white">
                                        Recent Searches
                                    </Text>
                                    <Pressable onPress={() => setRecent([])}>
                                        <Text className="text-[13px] text-red-500 font-elms-med">Clear All</Text>
                                    </Pressable>
                                </View>

                                <View className="flex-row flex-wrap gap-2 mb-2">
                                    {recent.map((term) => (
                                        <View
                                            key={term}
                                            className="flex-row items-center gap-1.5 bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#282828] rounded-full pl-3 pr-2 py-2"
                                        >
                                            <History size={13} color={mutedColor} />
                                            <Pressable onPress={() => commitSearch(term)}>
                                                <Text className="text-[13px] text-gray-700 dark:text-white">{term}</Text>
                                            </Pressable>
                                            <Pressable onPress={() => removeRecent(term)} hitSlop={6}>
                                                <X size={13} color={mutedColor} />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View className="pt-5">
                            <Text className="text-[15px] font-elms-med text-gray-900 dark:text-white mb-3">
                                Trending Searches
                            </Text>

                            {TRENDING.map((term, index) => (
                                <Pressable
                                    key={term}
                                    onPress={() => commitSearch(term)}
                                    className="flex-row items-center justify-between bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#282828] rounded-2xl px-4 py-3.5 mb-3"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View
                                            style={{ backgroundColor: BADGE_COLORS[index % BADGE_COLORS.length] }}
                                            className="w-6 h-6 rounded-full items-center justify-center"
                                        >
                                            <Text className="text-white text-[11px] font-elms-med">{index + 1}</Text>
                                        </View>
                                        <Text className="text-[14px] text-gray-800 dark:text-white">{term}</Text>
                                    </View>
                                    <TrendingUp size={16} color="#3B82F6" />
                                </Pressable>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
