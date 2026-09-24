// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, History, Mic, Search as SearchIcon, TrendingUp, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import { useVideoPlayer } from '../context/videoplayer';
import UpNextCard from '../VideoDetail/UpNextCard';
import { DemoVideo, demoVideos } from '../Videos/demoVideos';

const MAROON = '#7A3B2E';
const TRENDING = ['Big Buck Bunny', 'Sintel', 'Tears of Steel', 'Elephants Dream', 'Blender Foundation'];
const BADGE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#94A3B8', '#94A3B8'];

type Mode = 'music' | 'video';

// One search screen for the whole app. Music opens it as-is, Videos opens it with mode="video"
// (same look, same open animation — only the placeholder and the results change).
export default function MusicSearchScreen({ mode: modeProp }: { mode?: Mode }) {
    const router = useRouter();
    const params = useLocalSearchParams<{ mode?: string }>();
    const mode: Mode = modeProp ?? (params.mode === 'video' ? 'video' : 'music');
    const isVideo = mode === 'video';

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { open } = useVideoPlayer();

    const [query, setQuery] = React.useState('');
    const [recent, setRecent] = React.useState<string[]>(['Big Buck Bunny', 'Open movie', 'Blender short film']);

    const scale = useSharedValue(0.85);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) });
        scale.value = withSpring(1, { mass: 0.4, damping: 9, stiffness: 160 });
    }, []);

    const bounceStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const results = React.useMemo<DemoVideo[]>(() => {
        if (!isVideo || !query.trim()) return [];
        const q = query.trim().toLowerCase();
        return demoVideos.filter(
            (v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q)
        );
    }, [query, isVideo]);

    const commitSearch = (term: string) => {
        setQuery(term);
        setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 8));
    };

    const removeRecent = (term: string) => setRecent((prev) => prev.filter((t) => t !== term));

    const handleOpenVideo = (video: DemoVideo) => {
        open(video);
        router.back();
    };

    const ink = isDark ? '#F3D9CC' : MAROON;
    const inkMuted = isDark ? '#F3D9CC99' : '#7A3B2E99';
    const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(122,59,46,0.08)';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
            <FocusAwareStatusBar style="auto" />

            <SafeAreaView edges={['top']}>
                <Animated.View style={[bounceStyle, { paddingHorizontal: 20, paddingTop: 8 }]}>
                    <View className="flex-row items-center gap-3 mb-4">
                        <Pressable onPress={() => router.back()} hitSlop={10}>
                            <ArrowLeft size={22} color={ink} />
                        </Pressable>
                        <Text style={{ color: ink }} className="text-3xl font-elms-med">
                            Search
                        </Text>
                    </View>

                    <View
                        className="flex-row items-center rounded-full px-4 h-12"
                        style={{ backgroundColor: chipBg }}
                    >
                        <SearchIcon size={17} color={ink} />
                        <TextInput
                            autoFocus
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => isVideo && query.trim() && commitSearch(query.trim())}
                            returnKeyType="search"
                            placeholder={isVideo ? 'Search videos...' : 'Search songs, artists, albums...'}
                            placeholderTextColor={inkMuted}
                            style={{ color: ink }}
                            className="flex-1 ml-2 text-[15px]"
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery('')} hitSlop={8}>
                                <X size={16} color={ink} />
                            </Pressable>
                        )}
                        <Pressable hitSlop={8} className="ml-2">
                            <Mic size={17} color={ink} />
                        </Pressable>
                    </View>
                </Animated.View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
            >
                {!isVideo ? (
                    <Text style={{ color: inkMuted }} className="text-[14px]">
                        {query.trim().length > 0
                            ? `No local results for "${query}" yet.`
                            : 'Start typing to search your music library.'}
                    </Text>
                ) : query.trim().length > 0 ? (
                    results.length > 0 ? (
                        <View>
                            {results.map((video) => (
                                <UpNextCard key={video.id} video={video} isDark={isDark} onPress={handleOpenVideo} />
                            ))}
                        </View>
                    ) : (
                        <Text style={{ color: inkMuted }} className="text-[14px]">
                            {`No videos found for "${query}".`}
                        </Text>
                    )
                ) : (
                    <>
                        {recent.length > 0 && (
                            <View>
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text style={{ color: ink }} className="text-[15px] font-elms-med">
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
                                            style={{ backgroundColor: chipBg }}
                                            className="flex-row items-center gap-1.5 rounded-full pl-3 pr-2 py-2"
                                        >
                                            <History size={13} color={inkMuted} />
                                            <Pressable onPress={() => commitSearch(term)}>
                                                <Text style={{ color: ink }} className="text-[13px]">{term}</Text>
                                            </Pressable>
                                            <Pressable onPress={() => removeRecent(term)} hitSlop={6}>
                                                <X size={13} color={inkMuted} />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View className="pt-5">
                            <Text style={{ color: ink }} className="text-[15px] font-elms-med mb-3">
                                Trending Searches
                            </Text>

                            {TRENDING.map((term, index) => (
                                <Pressable
                                    key={term}
                                    onPress={() => commitSearch(term)}
                                    style={{ backgroundColor: chipBg }}
                                    className="flex-row items-center justify-between rounded-2xl px-4 py-3.5 mb-3"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View
                                            style={{ backgroundColor: BADGE_COLORS[index % BADGE_COLORS.length] }}
                                            className="w-6 h-6 rounded-full items-center justify-center"
                                        >
                                            <Text className="text-white text-[11px] font-elms-med">{index + 1}</Text>
                                        </View>
                                        <Text style={{ color: ink }} className="text-[14px]">{term}</Text>
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
