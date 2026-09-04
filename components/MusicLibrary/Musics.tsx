// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { formatDuration } from '@/service/MusicDuration';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Music2, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ScanState } from '.';
import MusicMenu from './MusicMenu';

const cleanFilename = (filename: string): string => {
    if (!filename) return 'Unknown Track';
    return filename.replace(/\.[^/.]+$/, '');
};

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Musics({ scanState, onOpenAddToPlayList }: { scanState: ScanState, onOpenAddToPlayList: (musicId: string) => void }) {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const tracks = useAppSelector(state => state.trackReducer);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { setupQueue, playAtIndex } = useTrack();
    const { musics, onMusicRefresh } = useMusic();

    const keyboard = useAnimatedKeyboard();

    const listContainerStyle = useAnimatedStyle(() => ({
        paddingBottom: withSpring(keyboard.height.value, { damping: 20, stiffness: 200, mass: 0.4, }),
    }));

    const focusProgress = useSharedValue(0);
    const handleFocus = useCallback(() => {
        setFocused(true);
        focusProgress.value = withTiming(1, { duration: 180 });
    }, []);

    const handleBlur = useCallback(() => {
        setFocused(false);
        focusProgress.value = withTiming(0, { duration: 180 });
    }, []);

    useEffect(() => {
        onMusicRefresh();
    }, [scanState]);


    const filteredMusics = useMemo<IMusicTrack[]>(() => {
        const q = normalize(query.trim());

        if (!q) return musics.tracks;

        return musics.tracks.filter((track) => {
            const name = normalize(cleanFilename(track.filename));
            const raw = normalize(track.filename ?? '');
            return name.includes(q) || raw.includes(q);
        });
    }, [musics, query]);

    const clearQuery = useCallback(() => {
        setQuery('');
        inputRef.current?.focus();
    }, []);


    const handlePlay = (musicId: string) => {
        if (!musics.tracks || !musics.queueHash) return;
        const indx = musics.tracks.findIndex(m => m.id === musicId);
        if (tracks.playlistName === 'Media' && tracks.queueHash === musics.queueHash) {
            playAtIndex(indx);
        } else {
            setupQueue({ tracks: getTrackFromMusic(musics.tracks), playlistName: 'Media', sourceId: null, sourceType: 'default', startIndex: indx, queueHash: musics.queueHash });
        }
    }

    const renderTrack = ({ item, index }: { item: IMusicTrack; index: number }) => (
        <View className="flex-row items-center w-full gap-3 pr-2" key={item.id}>
            <Pressable
                onPress={() => handlePlay(item.id)}
                className="flex-1 flex-row items-center gap-3"
            >
                <Image
                    source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                    className="w-16 h-16 rounded-sm bg-slate-100 dark:bg-[#282828]"
                    resizeMethod="resize"
                />

                <View className="flex-1 flex-col justify-center">
                    <Text
                        numberOfLines={1}
                        className="text-black dark:text-white text-sm font-jakarta tracking-tight"
                        style={{ fontWeight: '500' }}
                    >
                        {cleanFilename(item.filename)}
                    </Text>

                    <Text numberOfLines={1} className="text-zinc-500 dark:text-[#B3B3B3] text-xs mt-0.5">
                        {formatDuration(item.duration)} • Local Audio
                    </Text>
                </View>
            </Pressable>

            <MusicMenu musicId={item.id} onAddToPlayList={() => onOpenAddToPlayList(item.id)} />
        </View>
    );

    const ListEmpty = useMemo(
        () => (
            <View className="py-10 items-center justify-center gap-2">
                {query.trim().length > 0 ? (
                    <>
                        <Search size={22} color={isDark ? "#B3B3B3" : "#a1a1aa"} />
                        <Text className="text-zinc-500 dark:text-[#B3B3B3] font-elms text-sm">
                            No results for &ldquo;{query.trim()}&rdquo;
                        </Text>
                        <TouchableOpacity onPress={clearQuery} activeOpacity={0.7}>
                            <Text className="text-zinc-400 dark:text-[#B3B3B3] text-xs underline">Clear search</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text className="text-zinc-500 dark:text-[#B3B3B3] font-elms">No music scanned yet.</Text>
                )}
            </View>
        ),
        [query, clearQuery, isDark],
    );

    return (
        <View className="flex-1">
            <View className="flex-row items-center mx-2 gap-3">
                <Music2 size={18} color={isDark ? '#FFFFFF' : '#000'} />
                <Text className="text-xl text-black dark:text-white font-elms-med">Scanned Music</Text>

                <View className="bg-slate-50 dark:bg-[#181818] px-3 py-1.5 absolute right-0 rounded-full border border-slate-100 dark:border-[#282828]">
                    <Text className="text-xs font-elms-med text-slate-500 dark:text-[#B3B3B3] tracking-wide">
                        {query.trim()
                            ? `${filteredMusics.length} / ${musics.tracks.length}`
                            : musics.tracks.length}
                    </Text>
                </View>
            </View>

            <Animated.View
                className={`flex-row items-center rounded-md my-3 px-3 py-1.5 gap-3 bg-zinc-100 dark:bg-[#242424] border ${focused ? 'border-zinc-300 dark:border-white' : 'border-transparent dark:border-transparent'}`}
            >
                <Search size={17} color={focused ? (isDark ? '#FFFFFF' : '#3f3f46') : (isDark ? '#B3B3B3' : '#a1a1aa')} />
                <TextInput
                    ref={inputRef}
                    className="flex-1 text-zinc-800 dark:text-white text-sm"
                    placeholder="Search Music"
                    placeholderTextColor={isDark ? "#B3B3B3" : "#a1a1aa"}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="search"
                    clearButtonMode="never"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={clearQuery} activeOpacity={0.6}>
                        <View className="bg-zinc-300 dark:bg-[#3E3E3E] rounded-full p-0.5">
                            <X size={12} color={isDark ? "#FFFFFF" : "#52525b"} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                )}
            </Animated.View>

            <Animated.View style={[listContainerStyle, { flex: 1 }]}>
                <FlatList
                    data={filteredMusics}
                    extraData={query}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTrack}
                    contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    ListEmptyComponent={ListEmpty}
                />
            </Animated.View>
        </View>
    );
}